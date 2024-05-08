export class ModuleAPI{
    constructor(engineAPI){
        this.engineAPI = engineAPI;
        this.engine = engineAPI.engine;
        this.ctx = engineAPI.ctx;
        this.canvas = engineAPI.canvas;
    }

    getModule(moduleName){
        return this.engineAPI.getModule(moduleName);
    }
}

export class Module{
    constructor(engineAPI){
        this.engineAPI = engineAPI;
        this.engine = engineAPI.engine;
        this.ctx = engineAPI.ctx;
        this.canvas = engineAPI.canvas;
    }

    preload(){
        
    }


    preloadLevel(level){
        
    }   

    setupLevel(level){
        
    }

    endLevel(level){
        
    }

    start(){
        
    }

    update(dt){
        
    } 
}

export class Component{
    constructor(entity, moduleAPI, {}){
        this.entity = entity;
        this.moduleAPI = moduleAPI;
        this.engineAPI = moduleAPI.engineAPI;
        this.engine = moduleAPI.engineAPI.engine;
        this.ctx = moduleAPI.engineAPI.ctx;
        this.canvas = moduleAPI.engineAPI.canvas;
        this.module = moduleAPI.module;
    }

    static fromJSON(entity, moduleAPI, jsonObject){
        return new Component(entity, moduleAPI, jsonObject);
    }

    toJSON(){
        return {};
    }
}