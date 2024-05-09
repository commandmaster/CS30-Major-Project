import { ModuleAPI, Module } from "./moduleBase.js";
import { AssetAPI, AssetModule } from "./assetModule.js";
import { AudioAPI, AudioModule } from "./audioModule.js";
import { InputAPI, InputModule } from "./inputModule.js";
import { NetworkingAPI, NetworkingModule } from "./networkingModule.js";
import { ParticleAPI, ParticleModule } from "./particleModule.js";
import { PhysicsAPI, PhysicsModule } from "./physicsModule.js";
import { RenderAPI, RenderModule } from "./renderModule.js";
import { ScriptingAPI, ScriptingModule } from "./scriptingModule.js";


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
        (typeof this.serializedComponents === "object" ? Object.values(this.serializedComponents) : this.serializedComponents).forEach((component) => {
            this.createComponent(component); // Create the component
        });
    }

    #createTransformComponent(component, parentModule) {
        // Create a new transform component instance from the JSON data
        const transform = PhysicsAPI.TransformComponent.fromJSON(
            this,
            component,
            parentModule,
            this.entityAPI.engineAPI
        );

        this.components.set("transform", transform); // Add the transform component to the components map
    }

    #createRigidbodyComponent(component, parentModule) {
        // Create a new rigidbody component instance from the JSON data
        const rigidbody = PhysicsAPI.RigidbodyComponent.fromJSON(
            this,
            component,
            parentModule,
            this.entityAPI.engineAPI
        );

        this.components.set("rigidbody", rigidbody); // Add the rigidbody component to the components map
    }

    #createAnimatorComponent(component, parentModule) {
        // Create a new animator component instance from the JSON data
        const animator = RenderAPI.AnimatorComponent.fromJSON(
            this,
            component,
            parentModule,
            this.entityAPI.engineAPI
        );

        this.components.set("animator", animator); // Add the animator component to the components map
    }

    #createSpriteRendererComponent(component, parentModule) {
        // Create a new sprite renderer component instance from the JSON data
        const spriteRenderer = RenderAPI.SpriteRendererComponent.fromJSON(
            this,
            component,
            parentModule,
            this.entityAPI.engineAPI
        );

        this.components.set("spriteRenderer", spriteRenderer); // Add the sprite renderer component to the components map
    }

    #createScriptingComponent(component, parentModule) {
        // Create a new scripting component instance from the JSON data
        const scripting = ScriptingAPI.ScriptingComponent.fromJSON(
            this,
            component,
            parentModule,
            this.entityAPI.engineAPI
        );

        this.components.set("scripting", scripting); // Add the scripting component to the components map
    }

    createComponent(component) {
        
        let parentModule; // Parent module of the component - One of the core engine systems/modules (e.g. Physics, Graphics, etc.)
        // Check the type of the component and create the component
        switch (component.type.toLowerCase()) {
            case "transform":
                parentModule = this.engineAPI.getModule('physics'); // Get the physics module
                this.#createTransformComponent(
                    component,
                    parentModule,
                );
                break;
            case "rigidbody":
                parentModule = this.engineAPI.getModule('physics'); // Get the physics module
                this.#createRigidbodyComponent(
                    component,
                    parentModule,
                );
                break;
            case "animatior":
                parentModule = this.engineAPI.getModule('render'); // Get the render module
                this.#createAnimatorComponent(
                    component,
                    parentModule,
                );
                break;
            case "spriterenderer":
                parentModule = this.engineAPI.getModule('render'); // Get the render module
                this.#createSpriteRendererComponent(
                    component,
                    parentModule,
                );
                break;
            case "scripting":
                parentModule = this.engineAPI.getModule('scripting'); // Get the scripting module
                this.#createScriptingComponent(
                    component,
                    parentModule,
                );
                break;
            default:
                console.error("Invalid module type");
                break;
        }
    }
}

export class EntityAPI extends ModuleAPI {
    constructor(engineAPI) {
        super(engineAPI);
    }
}

export class EntityModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }
}

