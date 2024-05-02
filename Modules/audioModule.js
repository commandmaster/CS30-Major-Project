import { ModuleAPI } from "./moduleBase";
import { Module } from "./moduleBase";

export class AudioAPI extends ModuleAPI {
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}

export class AudioModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }
}