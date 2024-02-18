import {AddressInfo, WebSocketServer} from 'ws';
import colorize from "../utils/colorize";
import {parseRequestMessageString} from "../utils/messageParser";

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
                const messageData = parseRequestMessageString(data.toString());
                console.log(messageData.type);
            } catch (error) {
                if (error instanceof Error) {
                    console.error(error);
                }
            }
        });
    });
};
