import { ModuleAPI, Module } from "./moduleBase.js";
import { Component } from "./entityModule.js";


class ScriptingComponent extends Component{
    constructor(entity, parentModule, engineAPI, componentConfig){
       super(entity, parentModule, engineAPI, componentConfig);


    }
}

export class ScriptingAPI extends ModuleAPI {
    static ScriptingComponent = ScriptingComponent;

    constructor(engineAPI) {
        super(engineAPI);
    }
}

export class ScriptingModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }
}