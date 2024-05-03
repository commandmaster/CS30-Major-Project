import { AudioAPI, AudioModule } from "./audioModule.js";
import { InputAPI, InputModule } from "./inputModule.js";
import { RenderAPI, RenderModule } from "./renderModule.js";
import { PhysicsAPI, PhysicsModule } from "./physicsModule.js";
import { EntityAPI, EntityModule } from "./entityModule.js";
import { AssetAPI, AssetModule } from "./assetModule.js";

import { ModuleAPI, Module } from "./moduleBase";


export class EngineAPI{
    APIs = {};
    
    constructor(context, canvas, engine){
        this.engine = engine;
        this.ctx = context;
        this.canvas = canvas;

     
        this.APIs = {};
        this.#loadAPIs();
    }


    #loadAPIs(){
        this.APIs.audio = new AudioAPI(this, this.engine.modules.audio);
        this.APIs.input = new InputAPI(this, this.engine.modules.input);
        this.APIs.render = new RenderAPI(this, this.engine.modules.render);
        this.APIs.physics = new PhysicsAPI(this, this.engine.modules.physics);
        this.APIs.entity = new EntityAPI(this, this.engine.modules.entity);
        this.APIs.asset = new AssetAPI(this, this.engine.modules.asset);
    }


    getAPI(module){
        if (typeof this.APIs[module] === 'undefined') throw new Error(`Module ${module} does not exist`);

        else if (typeof this.APIs[module] === String) {
            return this.APIs[module];
        }

        // search the values of the APIs object to find one with the same type as the module and return the name
        for (let key in this.APIs){
            if (typeof this.APIs[key].module === typeof module){
                return key;
            }
        }

        throw new Error(`Module ${module} does not exist`);
    }
    
}

export class Engine{
    #lastUpdate = performance.now();

    modules = {};
    constructor(context, canvas){
        this.ctx = context;
        this.canvas = canvas;

        this.#loadModules();

        this.api = new EngineAPI(context, canvas, this);
    }

    async preload(){
        return new Promise(async (resolve, reject) => {
            for (let module in this.modules){
                if (typeof this.modules[module].preload === 'function'){
                    await this.modules[module].preload();
                }
            }
            resolve();
        });
    }

    #loadModules(){
        this.modules.asset = new AssetModule(this.api); 
        this.modules.audio = new AudioModule(this.api);
        this.modules.input = new InputModule(this.api);
        this.modules.render = new RenderModule(this.api);
        this.modules.physics = new PhysicsModule(this.api);
        this.modules.entity = new EntityModule(this.api);
    }

    async loadLevel(level){
        function isAsync(func){
            return typeof func.then === 'function';
        }

        for (let module in this.modules){
            if (typeof this.modules[module].endLevel === 'function'){
                // check if the function is async

                if (isAsync(this.modules[module].endLevel)){
                    await this.modules[module].endLevel(level);
                } else {
                    this.modules[module].endLevel(level);
                }
                
            }
        }

        for (let module in this.modules){
            if (typeof this.modules[module].preloadLevel === 'function'){
                // check if the function is async
                if (isAsync(this.modules[module].preloadLevel)){
                    await this.modules[module].preloadLevel(level);
                } else {
                    this.modules[module].preloadLevel(level);
                }
            }
        }

        for (let module in this.modules){
            if (typeof this.modules[module].setupLevel === 'function'){
                // check if the function is async

                if (isAsync(this.modules[module].setupLevel)){
                    await this.modules[module].setupLevel(level);
                } else {
                    this.modules[module].setupLevel(level);
                }
            }
        }

        this.start();
    }

    start(){
        for (let module in this.modules){
            if (typeof this.modules[module].start === 'function'){
                this.modules[module].start();
            }
        }

        this.#lastUpdate = performance.now();
        this.update(0);
    }

    update(dt){
        for (let module in this.modules){
            if (typeof this.modules[module].update === 'function'){
                this.modules[module].update(dt);
            }
        }

        const dt = performance.now() - this.#lastUpdate;
        this.#lastUpdate = performance.now();
        requestAnimationFrame(() => this.update(dt));
    }
}

