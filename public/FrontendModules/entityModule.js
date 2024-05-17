import { ModuleAPI, Module } from "./moduleBase.js";
import { AssetAPI, AssetModule } from "./assetModule.js";
import { AudioAPI, AudioModule } from "./audioModule.js";
import { InputAPI, InputModule } from "./inputModule.js";
import { NetworkingAPI, NetworkingModule } from "./networkingModule.js";
import { ParticleAPI, ParticleModule } from "./particleModule.js";
import { PhysicsAPI, PhysicsModule } from "./physicsModule.js";
import { RenderAPI, RenderModule } from "./renderModule.js";
import { ScriptingAPI, ScriptingModule } from "./scriptingModule.js";

import { Vec2 } from "../SharedCode/physicsEngine.mjs";


class Entity {
    components = new Map(); // Map<componentName, component>
    constructor(entityAPI, name, serializedComponents = {}) {
        this.entityAPI = entityAPI; // EntityAPI used to acces module, and the engine
        this.name = name; // Name of the entity
        this.serializedComponents = serializedComponents; // Serialized components to be created in jsonObject format
        this.entityModule = entityAPI.module; // EntityModule used to create components
        this.engineAPI = entityAPI.engineAPI; // EngineAPI used to access the engine 
        this.#init(); // initialize the entity
        
    }

    #init() {
        this.#initComponents(); // initialize the components
    }

    #initComponents() {
        if (typeof this.serializedComponents === "undefined") return; // If the serialized components is undefined, return out of the function

        //Check the data type of the serialized components to see the serialization format of the components is an array or an object
        (typeof this.serializedComponents === "object" ? Object.values(this.serializedComponents) : this.serializedComponents).forEach((component) => {
            this.createComponent(component, true); // Create the component
        });

        if (!this.components.has("transform")) {
            this.createComponent({type: "transform", position: new Vec2(0, 0), rotation: 0}); // Create a transform component if it does not exist
        } 
    }

    #createTransformComponent(component, parentAPI) {
        // Create a new transform component instance from the JSON data
        const transform = PhysicsAPI.TransformComponent.fromJSON(
            this,
            parentAPI, 
            component,
            this.entityAPI.engineAPI
        );

        this.components.set("transform", transform); // Add the transform component to the components map
    }

    #createRigidbodyComponent(component, parentAPI) {
        // Create a new rigidbody component instance from the JSON data
        const rigidbody = PhysicsAPI.RigidbodyComponent.fromJSON(
            this,
            parentAPI,
            component,
            this.entityAPI.engineAPI
        );

        this.components.set("rigidbody", rigidbody); // Add the rigidbody component to the components map
    }

    #createAnimatorComponent(component, parentAPI) {
        // Create a new animator component instance from the JSON data
        const animator = RenderAPI.AnimatorComponent.fromJSON(
            this,
            parentAPI,
            component,
            this.entityAPI.engineAPI
        );

        this.components.set("animator", animator); // Add the animator component to the components map
    }

    #createSpriteRendererComponent(component, parentAPI) {
        // Create a new sprite renderer component instance from the JSON data
        const spriteRenderer = RenderAPI.SpriteRendererComponent.fromJSON(
            this,
            parentAPI,
            component,
            this.entityAPI.engineAPI
        );

        this.components.set("spriteRenderer", spriteRenderer); // Add the sprite renderer component to the components map
    }

    #createScriptingComponent(component, parentAPI) {
        // Create a new scripting component instance from the JSON data
        const scripting = ScriptingAPI.ScriptingComponent.fromJSON(
            this,
            parentAPI,
            component,
            this.entityAPI.engineAPI
        );

        this.components.set("scripting", scripting); // Add the scripting component to the components map
    }

    createComponent(component, isSerialized = false) {
        let parentAPI; // Parent module of the component - One of the core engine systems/modules (e.g. Physics, Graphics, etc.)

        if (component === null || component === undefined){
            throw new Error(`Component is ${typeof component}!`);
        }

        if (typeof component !== "object") {
            throw new Error(`The component is not an object. Invalid!`);
        }

        if (typeof component.type === "undefined") {
            throw new Error(`The Components type property is undefined!`);
        }

        if (isSerialized) {
            // Check the type of the component and create the component
            switch (component.type.toLowerCase()) {
                case "transform":
                    parentAPI = this.engineAPI.getAPI('physics'); // Get the physics module
                    this.#createTransformComponent(
                        component,
                        parentAPI,
                    );
                    break;
                case "rigidbody":
                    parentAPI = this.engineAPI.getAPI('physics'); // Get the physics module
                    this.#createRigidbodyComponent(
                        component,
                        parentAPI,
                    );
                    break;
                case "animatior":
                    parentAPI = this.engineAPI.getAPI('render'); // Get the render module
                    this.#createAnimatorComponent(
                        component,
                        parentAPI,
                    );
                    break;
                case "spriterenderer":
                    parentAPI = this.engineAPI.getAPI('render'); // Get the render module
                    this.#createSpriteRendererComponent(
                        component,
                        parentAPI,
                    );
                    break;
                case "scripting":
                    parentAPI = this.engineAPI.getAPI('scripting'); // Get the scripting module
                    this.#createScriptingComponent(
                        component,
                        parentAPI,
                    );
                    break;
                default:
                    if (typeof component.type === "string" || component.type.toLowerCase() !== component.type) {
                        throw new Error(`Component ${component.type} does not exist. Make sure the component type is a valid string and is LOWERCASE!`);
                    }
                        
                    throw new Error(`Component ${component.type} does not exist or is not a valid component type!`);
            }
        }

        else {
            console.log(component.type);
            // Check the type of the component and create the component
            switch (component.type.toLowerCase()) {
                case "transform":
                    parentAPI = this.engineAPI.getAPI('physics'); // Get the physics module
                    this.components.set("transform", new PhysicsAPI.TransformComponent(this, parentAPI, component)); // Add the transform component to the components map
                    break;
                case "rigidbody":
                    console.log(component)
                    parentAPI = this.engineAPI.getAPI('physics'); // Get the physics module
                    this.components.set("rigidbody", new PhysicsAPI.RigidbodyComponent(this, parentAPI, component)); // Add the rigidbody component to the components map
                    break;
                case "animator":
                    parentAPI = this.engineAPI.getAPI('render'); // Get the render module
                    this.components.set("animator", new RenderAPI.AnimatorComponent(this, parentAPI, component)); // Add the animator component to the components map
                    break;
                case "spriterenderer":
                    parentAPI = this.engineAPI.getAPI('render'); // Get the render module
                    this.components.set("spriteRenderer", new RenderAPI.SpriteRendererComponent(this, parentAPI, component)); // Add the sprite renderer component to the components map
                    break;
                case "scripting":
                    parentAPI = this.engineAPI.getAPI('scripting'); // Get the scripting module
                    this.components.set("scripting", new ScriptingAPI.ScriptingComponent(this, parentAPI, component)); // Add the scripting component to the components map
                    break;
                default:
                    if (typeof component.type === "string" || component.type.toLowerCase() !== component.type) {
                        throw new Error(`Component ${component.type} does not exist. Make sure the component type is a valid string and is LOWERCASE!`);
                    }
                        
                    throw new Error(`Component ${component.type} does not exist or is not a valid component type!`);
            }
        }
   }

   start() {
        //console.log("Starting entity...");
        this.components.forEach((component) => {
            component.start();
        });
    }

    update(dt) {
        //console.log("Updating entity...");
        this.components.forEach((component) => {
            component.update(dt);
        });
    }

    toJson() {
        let serizedComponents = {};
        this.components.forEach((component, key) => {
            serizedComponents[key] = component.toJSON();
        });
        return serizedComponents;
    }

    static fromJSON(entityAPI, serializedEntity, {position, rotation, velocity}) {
        if (typeof serializedEntity === 'string') serializedEntity = JSON.parse(serializedEntity);

        if (!serializedEntity instanceof Object) throw new Error("Serialized entity must be a valid Object or JSON string.");

        const newEntity = new Entity(entityAPI, serializedEntity);

        if (position instanceof Vec2 && newEntity.components.transform) newEntity.components.transform.position = position;
        if (rotation instanceof Number && newEntity.components.transform) newEntity.components.transform.rotation = rotation;
        if (velocity instanceof Vec2 && newEntity.components.rigidbody) newEntity.components.rigidbody.velocity = velocity;
    }
}

export class EntityAPI extends ModuleAPI {
    static Entity = Entity;
    constructor(engineAPI) {
        super(engineAPI);
    }
}

export class EntityModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }

    update(dt) {

    }

}

