import {AddressInfo, WebSocketServer} from 'ws';
import colorize from "../utils/colorize";

export const websocketServerStart = (wsPort: number) => {
    const server = new WebSocketServer({port: wsPort});
    console.log(colorize('Start websocket server on the ', 'brightGreen') +
        colorize(wsPort, 'cyan') +
        colorize(' port!', 'brightGreen'));
    server.on('connection', (wsClient, request) => {
        console.log(colorize('new client connected on port ', 'orange') +
            colorize((request.socket.address() as AddressInfo).port, 'cyan'));
    });
    server.on('close', () => {
        server.clients.forEach((client) => client.terminate());
    });
};
