import { ModuleAPI, Module } from "./moduleBase.js";

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