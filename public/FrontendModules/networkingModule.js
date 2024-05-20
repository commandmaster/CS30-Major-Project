import { ModuleAPI, Module } from "./moduleBase.js";

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

    connectToServer(){
        this.socket = io('http://localhost:3000');
        return new Promise((resolve, reject) => {
            const timeoutLength = 5000;
            setTimeout(() => {
                reject(new Error(`Connection to server timed out after ${timeoutLength}ms`));
            }, timeoutLength);

            this.socket.on('connect', () => {
                resolve(this.socket);
            });
        });
    }
}

