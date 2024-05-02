import { ModuleAPI } from "./moduleBase";
import { Module } from "./moduleBase";

export class RenderAPI extends ModuleAPI {
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}

export class RenderModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }
}