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
        const transform = parentModuleAPI.constructor.TransformComponent.fromJSON(component, parentModule, this.entityAPI.engineAPI);
    }

    #createRigidbodyComponent(component, parentModule, parentModuleAPI) {
        // Create a new rigidbody component instance from the JSON data
        const rigidbody = parentModuleAPI.constructor.RigidbodyComponent.fromJSON(component, parentModule, this.entityAPI.engineAPI);
    }

    #createAnimatorComponent(component, parentModule, parentModuleAPI) {
        // Create a new animator component instance from the JSON data
        const animator = parentModuleAPI.constructor.AnimatorComponent.fromJSON(component, parentModule, this.entityAPI.engineAPI);
    }

    #createSpriteRendererComponent(component, parentModule, parentModuleAPI) {
        // Create a new sprite renderer component instance from the JSON data
        const spriteRenderer = parentModuleAPI.constructor.SpriteRendererComponent.fromJSON(component, parentModule, this.entityAPI.engineAPI); 
    }

    #createScriptingComponent(component, parentModule, parentModuleAPI) {
        // Create a new scripting component instance from the JSON data
        const scripting = parentModuleAPI.constructor.ScriptingComponent.fromJSON(component, parentModule, this.entityAPI.engineAPI);
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

