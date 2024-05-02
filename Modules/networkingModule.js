import { ModuleAPI } from "./moduleBase";
import { Module } from "./moduleBase";

export class NetworkingAPI extends ModuleAPI {
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}

export class NetworkingModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }
}