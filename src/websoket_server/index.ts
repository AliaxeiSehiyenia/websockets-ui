import {AddressInfo, WebSocketServer} from 'ws';
import colorize from "../utils/colorize";
import {parseRequestMessageString} from "../utils/messageParser";
import {commandTypes} from "../types/entities/commandTypes";
import {IMessage} from "../types/entities/messages";
import {messageHandler} from "../messageHandler/MessageHandler";
import {
    IAddUserShipsRequestData,
    IAddUserToRoomRequestData,
    IAttackRequestData, IRandomAttackRequestData,
    IRegistrationRequestData
} from "../types/types/types";

export const websocketServerStart = (wsPort: number) => {
    const server = new WebSocketServer({port: wsPort});

    process.on('SIGINT', () => {
        server.clients.forEach((ws) => {
            ws.close();
        });
    });

    console.log(colorize('Start websocket server on the ', 'brightGreen') +
        colorize(wsPort, 'cyan') +
        colorize(' port!', 'brightGreen'));

    server.on('connection', (wsClient, request) => {
        console.log(colorize('new client connected on port ', 'orange') +
            colorize((request.socket.address() as AddressInfo).port, 'cyan'));
        console.log(colorize('Connection. Total online users: ', 'magenta') + colorize(server.clients.size, 'cyan'));

        wsClient.on('close', () => {
            console.log(colorize('Close. Total online users: ', 'magenta') + colorize(server.clients.size, 'cyan'));
        });

        wsClient.on('error', console.error);

        wsClient.on('message', (data: Buffer) => {
            try {
                const messageData: IMessage = parseRequestMessageString(data.toString());
                switch (messageData.type) {
                    case commandTypes.REGISTRATION:
                        const registrationData = JSON.parse(messageData.data) as IRegistrationRequestData;
                        messageHandler.registrationOrLogin(
                            registrationData,
                            messageData.type,
                            messageData.id,
                            wsClient
                        );
                        break;
                    case commandTypes.CREATE_ROOM:
                        messageHandler.createRoom(
                            messageData.type,
                            messageData.id,
                            wsClient,
                            server
                        );
                        break;
                    case commandTypes.ADD_PLAYER_TO_ROOM:
                        const addUserToRoomData = JSON.parse(
                            messageData.data as string
                        ) as IAddUserToRoomRequestData;
                        messageHandler.addUserToRoom(
                            addUserToRoomData,
                            messageData.type,
                            messageData.id,
                            wsClient,
                            server
                        );
                        break;
                    case commandTypes.SINGLE_PLAY:
                        break;
                    case commandTypes.ADD_SHIPS:
                        const addUserShipsData = JSON.parse(
                            messageData.data as string
                        ) as IAddUserShipsRequestData;
                        messageHandler.addUserShips(
                            addUserShipsData,
                            messageData.type,
                            messageData.id,
                            server
                        );
                        break;
                    case commandTypes.ATTACK:
                        const attackData = JSON.parse(messageData.data as string) as IAttackRequestData;
                        messageHandler.attack(attackData, messageData.type, messageData.id, server);
                        break;
                    case commandTypes.RANDOM_ATTACK:
                        const randomAttackData = JSON.parse(
                            messageData.data as string
                        ) as IRandomAttackRequestData;
                        messageHandler.randomAttack(
                            randomAttackData,
                            messageData.type,
                            messageData.id,
                            server
                        );
                        break;
                }
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error);
                }
            }
        });
    });
};
