import { ModuleAPI } from "./moduleBase";
import { Module } from "./moduleBase";

export class ParticleAPI extends ModuleAPI {
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}

export class ParticleModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }
}