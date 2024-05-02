import { ModuleAPI } from "./moduleBase";
import { Module } from "./moduleBase";

export class EntityAPI extends ModuleAPI {
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}

export class EntityModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }
}

