import { ModuleAPI, Module } from "./moduleBase.js";


class Entity {
    components = new Map(); // Map<componentName, component>
    constructor(entityAPI, serializedComponents) {
        this.entityAPI = entityAPI; // EntityAPI used to acces module, and the engine
        this.serializedComponents = serializedComponents; // Serialized components to be created in jsonObject format
        this.entityModule = entityAPI.module; // EntityModule used to create components

        this.#init(); // initialize the entity
    }

    #init() {
        this.#initComponents(); // initialize the components
    }

    #initComponents() {
        if (typeof this.serializedComponents === "undefined") return; // If the serialized components is undefined, return out of the function

        //Check the data type of the serialized components to see the serialization format of the components is an array or an object
        (typeof this.serializedComponents === "object" ? Object.values(this.serializedComponents) : this.serializedComponents).forEach(component => {
            this.createComponent(component); // Create the component
        });
    }

    #createTransformComponent(component, parentModule, parentModuleAPI) {
        // Create a new transform component instance from the JSON data
        const transform = parentModuleAPI.constructor.TransformComponent.fromJSON(this, component, parentModule, this.entityAPI.engineAPI);
    }

    #createRigidbodyComponent(component, parentModule, parentModuleAPI) {
        // Create a new rigidbody component instance from the JSON data
        const rigidbody = parentModuleAPI.constructor.RigidbodyComponent.fromJSON(this, component, parentModule, this.entityAPI.engineAPI);
    }

    #createAnimatorComponent(component, parentModule, parentModuleAPI) {
        // Create a new animator component instance from the JSON data
        const animator = parentModuleAPI.constructor.AnimatorComponent.fromJSON(this, component, parentModule, this.entityAPI.engineAPI);
    }

    #createSpriteRendererComponent(component, parentModule, parentModuleAPI) {
        // Create a new sprite renderer component instance from the JSON data
        const spriteRenderer = parentModuleAPI.constructor.SpriteRendererComponent.fromJSON(this, component, parentModule, this.entityAPI.engineAPI); 
    }

    #createScriptingComponent(component, parentModule, parentModuleAPI) {
        // Create a new scripting component instance from the JSON data
        const scripting = parentModuleAPI.constructor.ScriptingComponent.fromJSON(this, component, parentModule, this.entityAPI.engineAPI);
    }
 
    createComponent(component) {
        const componentAPI = this.entityAPI.engineAPI.getAPI(component.parentModule); // Get the API of the parent module stored in the serialized component

        // Get the module of the parent module grabbed from the parent module API
        // This may seem backwards but the parent moduleAPI is stored in the engineAPI and the module is referenced in the mopduleAPI
        const parentModule = componentAPI.module; 

        // Check the type of the component and create the component
        switch (component.type.toLowerCase()) {
            case "transform":
                this.#createTransformComponent(component, parentModule, componentAPI);
                break;
            case "rigidbody":
                this.#createRigidbodyComponent(component, parentModule, componentAPI);
                break;
            case "animatior":
                this.#createAnimatorComponent(component, parentModule, componentAPI);
                break;
            case "spriterenderer":
                this.#createSpriteRendererComponent(component, parentModule, componentAPI);
                break;
            case "scripting":
                this.#createScriptingComponent(component, parentModule, componentAPI);
                break;
            default:
                console.error("Invalid module type");
                break;
        }
        
    }
}


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

export class Component {
    constructor(entity, parentModule, engineAPI, componentConfig) {
        this.parentModule = parentModule; // Parent module of the component - One of the core engine systems/modules (e.g. Physics, Graphics, etc.)
        this.engineAPI = engineAPI; // EngineAPI used to access the engine
        this.entity = entity; // Entity the component is attached to
        this.componentConfig = componentConfig; // Configuration data for the component
    }

    start(){
        // Start the component
    
    }

    update(){
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



