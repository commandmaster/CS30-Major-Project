import { ModuleAPI } from "./moduleBase";
import { Module } from "./moduleBase";

export class InputAPI extends ModuleAPI {
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}

export class InputModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }

}

