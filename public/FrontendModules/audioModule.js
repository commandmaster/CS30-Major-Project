import { ModuleAPI, Module } from "./moduleBase.js";
import { Vec2 } from "../SharedCode/physicsEngine.mjs";

export class AudioAPI extends ModuleAPI {
    constructor(engineAPI) {
        super(engineAPI);
    }
}

export class AudioModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
        
    }
}