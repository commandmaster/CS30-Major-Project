import { ModuleAPI, Module } from "./moduleBase.mjs";
import { Vec2 } from "../SharedCode/physicsEngine.mjs";

// NOTE: This is a placeholder module for the audio module. This module is not implemented in the current version of the engine.

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