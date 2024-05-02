export class ModuleAPI{
    constructor(engineAPI, module){
        this.engineAPI = engineAPI;
        this.engine = engineAPI.engine;
        this.ctx = engineAPI.ctx;
        this.canvas = engineAPI.canvas;
        this.module = module;
    }
}

export class Module{
    constructor(engineAPI){
        this.engineAPI = engineAPI;
        this.engine = engineAPI.engine;
        this.ctx = engineAPI.ctx;
        this.canvas = engineAPI.canvas;
    }
}