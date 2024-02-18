import {httpServerStart} from "../http_server";

import { config } from 'dotenv';
import { resolve } from 'path';
import {websocketServerStart} from "../websoket_server";

export class App {
    private HTTP_PORT: number;
    private WS_PORT: number;
    constructor() {
        config({ path: resolve(process.cwd(), './.env') });
        this.HTTP_PORT = +process.env['HTTP_PORT']!;
        this.WS_PORT = +process.env['WS_PORT']!;
    }

    start() {
        httpServerStart(this.HTTP_PORT);
        websocketServerStart(this.WS_PORT)
    }
}
