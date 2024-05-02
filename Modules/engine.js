import { AudioAPI, AudioModule } from "./audioModule.js";
import { InputAPI, InputModule } from "./inputModule.js";
import { RenderAPI, RenderModule } from "./renderModule.js";
import { PhysicsAPI, PhysicsModule } from "./physicsModule.js";
import { EntityAPI, EntityModule } from "./entityModule.js";



export class EngineAPI{
    #modules = {};
    #APIs = {};
    
    constructor(context, canvas, engine){
        this.engine = engine;
        this.ctx = context;
        this.canvas = canvas;

        this.#modules = {};
        this.#APIs = {};

        this.#loadModules();
        this.#loadAPIs();
    }

    #loadModules(){
        this.#modules.audio = new AudioModule(this);
        this.#modules.input = new InputModule(this);
        this.#modules.render = new RenderModule(this);
        this.#modules.physics = new PhysicsModule(this);
        this.#modules.entity = new EntityModule(this);
    }

    #loadAPIs(){
        this.#APIs.audio = new AudioAPI(this.engine, this.#modules.audio);
        this.#APIs.input = new InputAPI(this.engine, this.#modules.input);
        this.#APIs.render = new RenderAPI(this.engine, this.#modules.render);
        this.#APIs.physics = new PhysicsAPI(this.engine, this.#modules.physics);
        this.#APIs.entity = new EntityAPI(this.engine, this.#modules.entity);
    }
}