import { AudioAPI, AudioModule } from "./audioModule.mjs";
import { InputAPI, InputModule } from "./inputModule.mjs";
import { RenderAPI, RenderModule } from "./renderModule.mjs";
import { PhysicsAPI, PhysicsModule } from "./physicsModule.mjs";
import { EntityAPI, EntityModule } from "./entityModule.mjs";
import { AssetAPI, AssetModule } from "./assetModule.mjs";
import { ParticleAPI, ParticleModule } from "./particleModule.mjs";
import { ScriptingAPI, ScriptingModule } from "./scriptingModule.mjs";
import { NetworkingAPI, NetworkingModule  } from "./networkingModule.mjs";
import  GameManager from "../gameManager.mjs"


import { ModuleAPI, Module } from "./moduleBase.mjs";

export class EngineAPI {
    APIs = {};

    constructor(context, canvas, engine) {
        this.engine = engine;
        this.ctx = context;
        this.canvas = canvas;

        this.APIs = {};
        this.loadAPIs();
    }

    loadAPIs() {
        this.APIs.audio = new AudioAPI(this);
        this.APIs.input = new InputAPI(this);
        this.APIs.render = new RenderAPI(this);
        this.APIs.physics = new PhysicsAPI(this);
        this.APIs.entity = new EntityAPI(this);
        this.APIs.asset = new AssetAPI(this);
        this.APIs.particle = new ParticleAPI(this);
        this.APIs.scripting = new ScriptingAPI(this);
        this.APIs.networking = new NetworkingAPI(this);
    }

    getAPI(module) {
        if (typeof this.APIs[module] === "undefined")
            throw new Error(`Module ${module} does not exist`);
        else if (typeof module === "string") {

            const lowcaseModule = module.toLowerCase(); // convert the module to lowercase to match the key in the APIs object
            if (lowcaseModule !== module) console.warn(`Module ${module} is not lowercase`);
            return this.APIs[module];
        }

        // search the values of the APIs object to find one with the same type as the module and return the name
        for (let key in this.APIs) {
            if (typeof this.APIs[key].module === typeof module) {
                return key;
            }
        }

        throw new Error(`Module ${module} does not exist`);
    }

    getModule(module) {
        if (typeof this.engine.modules[module] === "undefined")
            throw new Error(`Module ${module} does not exist (undefined)`);
        return this.engine.modules[module];
    }
}


export class Level{
    constructor(engineAPI, entities, levelManagerName){
        this.engineAPI = engineAPI;// Engine API
        this.entities = entities;// Entities in the level

        this.alreadyStarted = new Set(); // Set of entities that have already been started
        
        const scriptingAPI = this.engineAPI.getAPI("scripting");
        this.levelManager = scriptingAPI.instantiateLevelManager(levelManagerName, this, this.engineAPI); // Instantiate the level manager
        this.levelManagerName = levelManagerName;
    }

    addEntity(entity){
        this.entities.push(entity);

        if (this.alreadyStarted.has(entity)) return;
        entity.start();

        this.alreadyStarted.add(entity);
    }

    start(){
        this.levelManager.Start();
        for(let entity of this.entities){
            if (this.alreadyStarted.has(entity)) continue;
            entity.start();

            this.alreadyStarted.add(entity);
        }
    }

    update(dt){
        this.levelManager.Update(dt);
        this.entities.forEach(entity => entity.update(dt));
    }

    end(){
        this.levelManager.End();
    }

    toJSON(){
        const replacer = (key, value) => {
            if (key === 'engineAPI') return undefined;
            if (key === 'levelManager') return this.levelManagerName;

            return value;
        }
        return JSON.stringify(this, replacer);
    }

    static fromJSON(engineAPI, jsonObject){
        const position = new Vec2(jsonObject.components.transform.position.x, jsonObject.components.transform.position.y);
        const rotation = jsonObject.components.transform.rotation;
        const velocity = new Vec2(jsonObject.components.rigidbody.velocity.x, jsonObject.components.rigidbody.velocity.y);

        const entities = jsonObject.entities.map(entity => EntityAPI.Entity.fromJSON(engineAPI, entity, {position, rotation, velocity}));
        return new Level(engineAPI, entities, jsonObject.levelManager);
    }

    
}


export class Engine {
    #lastUpdate = performance.now();

    modules = {};
    constructor(context, canvas) {
        this.ctx = context;
        this.canvas = canvas;

        this.api = new EngineAPI(context, canvas, this);
        this.loadModules();

        this.gameManager = new GameManager(this.api);
        this.currentLevel = null;
    }

    async preload() {
        const priorityMap = new Map();
        priorityMap.set("asset", 0);
        priorityMap.set("audio", 1);
        priorityMap.set("input", 2);
        priorityMap.set("physics", 3);
        priorityMap.set("entity", 4);
        priorityMap.set("particle", 5);
        priorityMap.set("render", 6);
        priorityMap.set("scripting", 7);
        priorityMap.set("networking", 8);

        this.sortedModules = Object.keys(this.modules).sort(
            (a, b) => priorityMap.get(a) - priorityMap.get(b)
        );

        return new Promise(async (resolve, reject) => {
            for (let module in this.modules) {
                if (typeof this.modules[module].preload === "function") {
                    await this.modules[module].preload();
                }
            }
            await this.gameManager.Preload();
            resolve();
        });
    }

    loadModules() {
        this.modules.asset = new AssetModule(this.api);
        this.modules.audio = new AudioModule(this.api);
        this.modules.input = new InputModule(this.api);
        this.modules.render = new RenderModule(this.api);
        this.modules.physics = new PhysicsModule(this.api);
        this.modules.entity = new EntityModule(this.api);
        this.modules.particle = new ParticleModule(this.api);
        this.modules.scripting = new ScriptingModule(this.api);
        this.modules.networking = new NetworkingModule(this.api); 
    }

    async loadLevel(level) {
        function isAsync(func) {
            return typeof func.then === "function";
        }
        
        if (this.currentLevel !== null) {
            this.currentLevel.end();
        }

        for (let module in this.modules) {
            if (typeof this.modules[module].endLevel === "function") {
                // check if the function is async

                if (isAsync(this.modules[module].endLevel)) {
                    await this.modules[module].endLevel(level);
                } else {
                    this.modules[module].endLevel(level);
                }
            }
        }

        for (let module in this.modules) {
            if (typeof this.modules[module].preloadLevel === "function") {
                // check if the function is async
                if (isAsync(this.modules[module].preloadLevel)) {
                    await this.modules[module].preloadLevel(level);
                } else {
                    this.modules[module].preloadLevel(level);
                }
            }
        }

        for (let module in this.modules) {
            if (typeof this.modules[module].setupLevel === "function") {
                // check if the function is async

                if (isAsync(this.modules[module].setupLevel)) {
                    await this.modules[module].setupLevel(level);
                } else {
                    this.modules[module].setupLevel(level);
                }
            }
        }

        this.currentLevel = level;
        this.currentLevel.start();
    }

    start() {
        for (let module of this.sortedModules) {
            if (typeof this.modules[module].start === "function") {
                this.modules[module].start();
            }
        }

        

        this.gameManager.Start();

        this.#lastUpdate = performance.now();
        this.update(0);
    }

    update() {
        const gameSpeed = 1;
        let dt = performance.now() - this.#lastUpdate;
        dt /= 1000;
        dt *= gameSpeed;
        this.#lastUpdate = performance.now();

        for (let module of this.sortedModules) {
            if (typeof this.modules[module].update === "function") {
                this.modules[module].update(dt);
            }
        }

        this.gameManager.Update(dt);
       
        if(this.currentLevel !== null){
            this.currentLevel.update(dt);
        }

        requestAnimationFrame(() => this.update(dt));
    }
}