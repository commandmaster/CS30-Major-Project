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

class Entity {
    components = [];
    constructor(entityAPI, serializedComponents) {
        this.entityAPI = entityAPI;
        this.serializedComponents = serializedComponents;
        this.entityModule = entityAPI.module;

        this.#init();
    }

    #init() {
        this.#initComponents();
    }

    #initComponents() {
        this.serializedComponents.forEach(component => {
            this.entityModule.createComponent(component);
        });
    }

    createComponent(component) {
        const componentAPI = this.entityAPI.engineAPI.getComponentAPI(component.type);
        
    }



    


}

