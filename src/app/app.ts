import {httpServerStart} from "../http_server";

import { config } from 'dotenv';
import { resolve } from 'path';

export class App {
    private HTTP_PORT: number;
    constructor() {
        config({ path: resolve(process.cwd(), './.env') });
        this.HTTP_PORT = +process.env['HTTP_PORT']!;
    }

    start() {
        httpServerStart(this.HTTP_PORT);
    }
}
