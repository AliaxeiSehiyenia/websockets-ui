import WebSocket from 'ws';
import {IUser, User} from "../types/entities/user";
import {commandTypes} from "../types/entities/commandTypes";
import {createResponseMessage} from "../utils/messageParser";
import colorize from "../utils/colorize";
import * as uuid from 'uuid';
import {IRoom, Room} from "../types/entities/room";
import {IWinner, Winner} from "../types/entities/winner";
import {IncomingMessage} from "http";
import {Game} from "../types/entities/game";
import {
    BattlefieldMatrixType,
    IAddUserShipsRequestData,
    IAddUserToRoomRequestData,
    IAttackRequestData,
    IAttackResponseData,
    IRandomAttackRequestData,
    IRegistrationRequestData
} from "../types/types/types";
import {ActiveGamePlayer, IActiveGamePlayer} from "../types/entities/activeGamePlayer";
import {attackHandler, battlefieldMatrixGenerator, lastShotHandler, randomAttackGenerator} from "../utils/utils";
import {ActiveGame, IActiveGame} from "../types/entities/activeGame";
import {KILLED_SHIPS_SELLS_COUNT} from "../constants/constants";
import {IShipPosition} from "../types/entities/sellCoordinate";

class MessageHandler {
    users: Array<IUser> = [];
    rooms: Array<IRoom> = [];
    winners: Array<IWinner> = [];
    activeGamesData: Array<IActiveGame> = [];
    activeSingleGamesData: Array<IActiveGame> = [];

    registrationOrLogin(data: IRegistrationRequestData, type: commandTypes, id: number, ws: WebSocket) {
        const existedUser = this.users.find((user) => user.name === data.name);
        if (existedUser) {
            if (existedUser.password === data.password) {
                this.users = this.users.map((user) => {
                    if (user.name === existedUser.name) {
                        user.ws = ws;
                        return user;
                    } else {
                        return user;
                    }
                });
                ws.send(createResponseMessage(type, {
                    name: existedUser.name,
                    id: existedUser.id,
                    error: false,
                    errorText: ''
                }));
                this.users = [...this.users, {...existedUser, isOnline: true}];
                console.log(colorize(existedUser.name, 'cyan') + colorize(' has logged in', 'brightGreen'));
                console.log(colorize('users online: ', 'magenta')
                    + colorize((this.users.filter(item => item.isOnline)).length, 'cyan'));
                ws.send(createResponseMessage(commandTypes.UPDATE_ROOM, this.rooms));
                ws.send(createResponseMessage(commandTypes.UPDATE_WINNERS, this.winners));
            } else {
                ws.send(createResponseMessage(type, {
                    name: '',
                    id: 0,
                    error: true,
                    errorText: 'Wrong password',
                }));
            }
            return;
        }

        const newUser = new User(data.name, uuid.v4(), data.password, 0, true, ws);
        this.users = [...this.users, newUser];
        ws.send(createResponseMessage(type, {
            name: newUser.name,
            id: newUser.id,
            error: false,
            errorText: '',
        }));
        console.log(colorize(newUser.name, 'cyan') + colorize(' has logged in', 'brightGreen'));
        console.log(colorize('users online: ', 'magenta')
            + colorize((this.users.filter(item => item.isOnline)).length, 'cyan'));
        ws.send(createResponseMessage(commandTypes.UPDATE_ROOM, this.rooms));
        ws.send(createResponseMessage(commandTypes.UPDATE_WINNERS, this.winners));
    }

    createRoom(
        type: commandTypes,
        id: number,
        ws: WebSocket,
        websocketsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>
    ) {
        type = commandTypes.UPDATE_ROOM;
        const roomOwner = this.users.find((user) => user.ws === ws) as IUser;
        this.rooms = [...this.rooms, new Room(uuid.v4(), [roomOwner])];
        ws.send(createResponseMessage(type, this.rooms));
        websocketsServer.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(this.rooms));
            }
        });
    }

    addUserToRoom(
        data: IAddUserToRoomRequestData,
        type: commandTypes,
        id: number,
        ws: WebSocket,
        websocketsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>
    ) {
        const roomOwner = this.rooms.find((room) => room.roomId === data.indexRoom)
            ?.roomUsers[0] as IUser;
        const gameGuest = this.users.find((user) => user.ws === ws);
        if (gameGuest.name === roomOwner.name) {
            console.log(colorize(gameGuest.name, 'cyan') + colorize(', you have already joined this room', 'magenta'));
            return;
        }

        this.rooms = this.rooms.filter((room) => room.roomId !== data.indexRoom);
        this.rooms = this.rooms.filter((room) => room.roomUsers[0]?.name !== gameGuest.name);
        this.rooms = this.rooms.filter((room) => room.roomUsers[0]?.name !== roomOwner.name);

        const roomsData = createResponseMessage(commandTypes.UPDATE_ROOM, this.rooms);
        ws.send(roomsData);

        type = commandTypes.CREATE_GAME;
        const gameId = uuid.v4()

        const ownerGameData = new Game(gameId, roomOwner.id);
        const guestGameData = new Game(gameId, gameGuest.id);

        roomOwner.ws?.send(createResponseMessage(type, ownerGameData));
        ws.send(createResponseMessage(type, guestGameData));
        websocketsServer.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(roomsData);
            }
        });
    }

    addUserShips(
        data: IAddUserShipsRequestData,
        type: commandTypes,
        id: number,
        websocketsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>
    ) {
        type = commandTypes.START_GAME;
        const foundActiveGame = this.activeGamesData.find(
            (activeGame) => activeGame.gameId === data.gameId
        );
        if (!foundActiveGame) {
            const gameOwner = new ActiveGamePlayer(data.ships, data.indexPlayer, []);
            const newActiveGame = new ActiveGame(data.gameId, [], data.indexPlayer);
            newActiveGame.addNewUser(gameOwner);
            this.activeGamesData = [...this.activeGamesData, newActiveGame];
        } else {
            const secondGamePlayerData = new ActiveGamePlayer(data.ships, data.indexPlayer, []);
            foundActiveGame.addNewUser(secondGamePlayerData);
            const firstPlayer = this.users.find(
                (user) => user.id === foundActiveGame.gamePlayersData[0].indexPlayer
            ) as IUser;
            const secondPlayer = this.users.find(
                (user) => user.id === foundActiveGame.gamePlayersData[1].indexPlayer
            ) as IUser;
            const currentPlayerId = foundActiveGame.currentPlayer === firstPlayer.id ? secondPlayer.id : firstPlayer.id
            foundActiveGame.changeCurrentPlayer(currentPlayerId);

            firstPlayer.ws?.send(createResponseMessage(type, {
                currentPlayerIndex: foundActiveGame.currentPlayer,
                ships: foundActiveGame.gamePlayersData[0].ships,
            }, id));
            secondPlayer.ws?.send(createResponseMessage(type, {
                currentPlayerIndex: foundActiveGame.currentPlayer,
                ships: foundActiveGame.gamePlayersData[1].ships,
            }, id));

            const firstPlayerBattlefield = battlefieldMatrixGenerator(
                foundActiveGame.gamePlayersData[0].ships
            );
            const secondPlayerBattlefield = battlefieldMatrixGenerator(
                foundActiveGame.gamePlayersData[1].ships
            );
            foundActiveGame.gamePlayersData[0].updateShipsMatrix(firstPlayerBattlefield);
            foundActiveGame.gamePlayersData[1].updateShipsMatrix(secondPlayerBattlefield);

            type = commandTypes.TURN;
            firstPlayer.ws?.send(createResponseMessage(type, {
                currentPlayer: foundActiveGame.currentPlayer,
            }, id));
            secondPlayer.ws?.send(createResponseMessage(type, {
                currentPlayer: foundActiveGame.currentPlayer,
            }, id));
        }
    }

    attack(
        data: IAttackRequestData,
        type: commandTypes,
        id: number,
        websocketsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>
    ) {
        try {
            let currentGame = this.activeGamesData.find(
                (activeGame) => activeGame.gameId === data.gameId
            );
            if (currentGame && data.indexPlayer !== currentGame?.currentPlayer) return;

            if (!currentGame) return;

            const attackRecipient = currentGame?.gamePlayersData.filter(
                (playerData) => playerData.indexPlayer !== data.indexPlayer
            )[0] as IActiveGamePlayer;
            const attacker = currentGame?.gamePlayersData.filter(
                (playerData) => playerData.indexPlayer === data.indexPlayer
            )[0] as IActiveGamePlayer;
            if (!attackRecipient || !attacker) return;

            const attackRecipientSocket = this.users.find(
                (user) => user.id === attackRecipient.indexPlayer
            )?.ws;
            const attackerSocket = this.users.find((user) => user.id === data.indexPlayer)?.ws;

            const attackData = attackHandler(
                attackRecipient.shipsMatrix as BattlefieldMatrixType,
                data.x,
                data.y
            );
            if (!attackData) {
                currentGame && currentGame.changeCurrentPlayer(attackRecipient.indexPlayer);
                type = commandTypes.TURN;

                attackerSocket?.send(createResponseMessage(type, {
                    currentPlayer: currentGame?.currentPlayer as string,
                }, id));
                attackRecipientSocket?.send(createResponseMessage(type, {
                    currentPlayer: currentGame?.currentPlayer as string,
                }, id));

                return;
            }

            if (attackData.attackedSell === 'free') {
                const responseData: IAttackResponseData = {
                    currentPlayer: data.indexPlayer,
                    status: 'miss',
                    position: {
                        x: data.x,
                        y: data.y,
                    }
                };
                attackerSocket?.send(createResponseMessage(type, responseData, id));
                attackRecipientSocket?.send(createResponseMessage(type, responseData, id));

                currentGame && currentGame.changeCurrentPlayer(attackRecipient.indexPlayer);
                type = commandTypes.TURN;

                attackerSocket?.send(createResponseMessage(type, {
                    currentPlayer: currentGame?.currentPlayer as string,
                }, id));
                attackRecipientSocket?.send(createResponseMessage(type, {
                    currentPlayer: currentGame?.currentPlayer as string,
                }, id));

            } else {
                if (!attackData.isKilled) {
                    const updatedMatrix = attackData.updatedMatrix as BattlefieldMatrixType;
                    attackRecipient.updateShipsMatrix(updatedMatrix);

                    const responseData: IAttackResponseData = {
                        currentPlayer: data.indexPlayer,
                        status: 'shot',
                        position: {
                            x: data.x,
                            y: data.y,
                        }
                    };
                    attackerSocket?.send(createResponseMessage(type, responseData, id));
                    attackRecipientSocket?.send(createResponseMessage(type, responseData, id));

                    type = commandTypes.TURN;

                    attackerSocket?.send(createResponseMessage(type, {
                        currentPlayer: currentGame?.currentPlayer as string,
                    }, id));
                    attackRecipientSocket?.send(createResponseMessage(type, {
                        currentPlayer: currentGame?.currentPlayer as string,
                    }, id));
                } else {
                    const updatedMatrix = attackData.updatedMatrix as BattlefieldMatrixType;
                    attackRecipient.updateShipsMatrix(updatedMatrix);

                    const lastShotResults = lastShotHandler(
                        updatedMatrix,
                        attackRecipient.killedShips,
                        data.x,
                        data.y
                    );
                    lastShotResults?.aroundShotsCoords?.forEach((aroundSellCoordinate) => {
                        const responseData: IAttackResponseData = {
                            currentPlayer: data.indexPlayer,
                            status: 'miss',
                            position: {
                                x: aroundSellCoordinate.x,
                                y: aroundSellCoordinate.y,
                            }
                        };
                        attackerSocket?.send(createResponseMessage(type, responseData, id));
                        attackRecipientSocket?.send(createResponseMessage(type, responseData, id));
                    });

                    lastShotResults?.killedShipSells.forEach((killedShipSellCoordinate) => {
                        const responseData: IAttackResponseData = {
                            currentPlayer: data.indexPlayer,
                            status: 'killed',
                            position: {
                                x: killedShipSellCoordinate.x,
                                y: killedShipSellCoordinate.y,
                            }
                        };
                        attackerSocket?.send(createResponseMessage(type, responseData, id));
                        attackRecipientSocket?.send(createResponseMessage(type, responseData, id));
                    });

                    currentGame?.addPlayerKilledShips(
                        lastShotResults?.killedShipSells as Array<IShipPosition>,
                        attackRecipient.indexPlayer
                    );

                    if (
                        attackRecipient.killedShips?.filter((sell) => sell).length === KILLED_SHIPS_SELLS_COUNT
                    ) {
                        type = commandTypes.FINISH;

                        attackerSocket?.send(createResponseMessage(type, {
                            winPlayer: data.indexPlayer,
                        }, id));
                        attackRecipientSocket?.send(createResponseMessage(type, {
                            winPlayer: data.indexPlayer,
                        }, id));

                        type = commandTypes.UPDATE_WINNERS;
                        const user = this.users.find((item => item.id === data.indexPlayer))
                        const winner = this.winners.find(item => item.userId === user.id)
                        if (winner) {
                            this.winners = [...this.winners.filter(item => item.userId !== winner.userId), {
                                ...winner,
                                wins: winner.wins + 1
                            }]
                        } else {
                            this.winners = [...this.winners, new Winner(user.id, user.name, user.wins + 1)];
                        }
                        attackerSocket?.send(createResponseMessage(type, this.winners, id));
                        attackRecipientSocket?.send(createResponseMessage(type, this.winners, id));

                        websocketsServer.clients.forEach((client) => {
                            if (
                                client !== attackerSocket &&
                                client !== attackRecipientSocket &&
                                client.readyState === WebSocket.OPEN
                            ) {
                                client.send(createResponseMessage(type, this.winners, id));
                            }
                        });
                    } else {
                        type = commandTypes.TURN;
                        attackerSocket?.send(createResponseMessage(type, {
                            currentPlayer: currentGame?.currentPlayer as string
                        }, id));
                        attackRecipientSocket?.send(createResponseMessage(type, {
                            currentPlayer: currentGame?.currentPlayer as string
                        }, id));
                    }
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error(error);
            }
        }
    }

    randomAttack(
        data: IRandomAttackRequestData,
        type: commandTypes,
        id: number,
        websocketsServer: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>
    ) {
        let currentGame = this.activeGamesData.find((activeGame) => activeGame.gameId === data.gameId);
        const currentSingleGame = this.activeSingleGamesData.find(
            (activeSingleGame) => activeSingleGame.gameId === data.gameId
        );

        currentGame = currentSingleGame ? currentSingleGame : currentGame;

        const attackRecipientMatrix = currentGame?.gamePlayersData.filter(
            (playerData) => playerData.indexPlayer !== data.indexPlayer
        )[0].shipsMatrix as BattlefieldMatrixType;

        const randomAttackData = randomAttackGenerator(attackRecipientMatrix);
        type = commandTypes.ATTACK
        const attackData: IAttackRequestData = {
            x: randomAttackData.x,
            y: randomAttackData.y,
            gameId: currentGame?.gameId as string,
            indexPlayer: data.indexPlayer,
        };

        this.attack(attackData, type, id, websocketsServer);
    }
}

export const messageHandler = new MessageHandler();
