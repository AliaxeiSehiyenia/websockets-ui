import {AddressInfo, WebSocketServer} from 'ws';
import colorize from "../utils/colorize";
import {parseRequestMessageString} from "../utils/messageParser";
import {commandTypes} from "../types/entities/commandTypes";
import {IMessage} from "../types/entities/messages";
import {IRegistrationRequestData} from "../types/commands/registration";
import {messageHandler} from "../messageHandler/MessageHandler";

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
                        const responseCreateGameData = messageHandler.createRoom(
                            messageData.type,
                            messageData.id,
                            wsClient
                        );
                        responseCreateGameData.data = JSON.stringify(responseCreateGameData.data);
                        wsClient.send(JSON.stringify(responseCreateGameData));
                        server.clients.forEach((client) => {
                            if (client !== wsClient && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(responseCreateGameData));
                            }
                        });
                        break;
                    case commandTypes.ADD_PLAYER_TO_ROOM:
                        break;
                    case commandTypes.SINGLE_PLAY:
                        break;
                    case commandTypes.ADD_SHIPS:
                        break;
                    case commandTypes.ATTACK:
                        break;
                    case commandTypes.RANDOM_ATTACK:
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
