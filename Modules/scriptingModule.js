import { ModuleAPI } from "./moduleBase";
import { Module } from "./moduleBase";

export class ScriptingAPI extends ModuleAPI {
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}

export class ScriptingModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }
}