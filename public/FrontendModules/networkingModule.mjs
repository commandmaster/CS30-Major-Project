import { ModuleAPI, Module } from "./moduleBase.mjs";

class EntityStatePacket{
    
}

export class NetworkingAPI extends ModuleAPI {
    constructor(engineAPI) {
        super(engineAPI);
    }
}

export class NetworkingModule extends Module {
    // Uses socket.io to connect to the server
    // Make sure the cdn is included in the index.html file above any game engine or related scripts

    constructor(engineAPI) {
        super(engineAPI);
    }

    connectToServer(ip = 'http://localhost:3000') {
        this.socket = io(ip);
        return new Promise((resolve, reject) => {
            const timeoutLength = 5000;
            setTimeout(() => {
                reject(new Error(`Connection to server timed out after ${timeoutLength}ms`));
            }, timeoutLength);

            this.socket.on('connect', () => {
                resolve(this.socket);
            });


            this.socket.on('disconnect', () => {
                location.reload();
            });
        });
    }
}

