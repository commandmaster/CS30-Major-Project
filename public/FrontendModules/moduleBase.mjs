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

export class Component {
    constructor(entity, parentModule, engineAPI, componentConfig) {
        this.parentModule = parentModule; // Parent module of the component - One of the core engine systems/modules (e.g. Physics, Graphics, etc.)
        this.engineAPI = engineAPI; // EngineAPI used to access the engine
        this.entity = entity; // Entity the component is attached to
        this.componentConfig = componentConfig; // Configuration data for the component
    }

    start() {
        // Start the component
    }

    update() {
        // Update the component
    }

    toJSON() {
        // By default the component is serialized as a JSON string
        // We can't use the default replacer function because it will cause a circular reference error with the entity, parentModule, and engineAPI, we only want to serialize the componentConfig
        function replacer(key, value) {
            // Check if the value is an instance of the component
            const bannedProperties = ["entity", "parentModule", "engineAPI"]; // Properties that should not be serialized
            const acceptable = !bannedProperties.includes(key); // Check if the key is not in the banned properties

            return acceptable ? value : undefined; // Return the value if it is acceptable, otherwise return undefined
        }

        return JSON.stringify(this, replacer, 2); // Return the JSON string of the component ignoring the banned properties
    }

    static fromJSON(entity, parentModule, engineAPI, json) {
        if (typeof json === "string") {
            // Parse the JSON string if it is a string turning it into a Object()
            json = JSON.parse(json);
        }

        const component = new Component(entity, parentModule, engineAPI, json);
        return component;
    }
}

