import { NetworkManager } from "./network.mjs";
import { PhysicsModule } from "./physics.mjs";

import path from "path";
import slash from "slash";

import * as fsPromises from "fs/promises";
const __dirname = import.meta.dirname;



class ScriptLoader{
    static getAssetConfig(){
        return new Promise(async (resolve, reject) => {

            const assetConfigPath = path.join(__dirname, "../",  "/public/assets/assetConfig.json");
            const data = await fsPromises.readFile(assetConfigPath, "utf-8")
            resolve(JSON.parse(data));
        });
    }

    static loadScripts(){
        return new Promise(async (resolve, reject) => {
            const assetConfig = await ScriptLoader.getAssetConfig();
            const scripts = assetConfig.filter(asset => asset.type === "script").map(asset => asset.path);

            let modules = [];

            for (let script of scripts){
                console.log(slash(path.join("../public", script)));
                const module = await ScriptLoader.loadScriptModule(slash(path.join("../public", script)));
                modules.push(module);
            }

            resolve(modules);
        });
    }

    static loadScriptModule(path){
        return new Promise(async (resolve, reject) => {
            const scriptModule = await import(path);
            resolve(scriptModule);
        });
    }
}

class BE_Enity{
    constructor(engine, name){
        this.engine = engine;
        this.BE_PhysicsModule = engine.modules.physicsModule;

        this.name = name;
        this.rb = null;

        this.engine.addBE_Enity(name, this);
    }

    addRigidBody({position, rotation, mass, bounce, colliders}){
        this.rb = this.BE_PhysicsModule.createRigidBody({position, rotation, mass, bounce, colliders});
    }

    start(){
        
    }

    update(dt){
        
    }
}



export class Engine {
    static BE_Enity = BE_Enity;

    constructor(io) {
        this.modules = {};
        this.io = io;

        this.dt = 0;
        this.lastUpdate = performance.now();

        this.BE_Enities = {};

        this.#loadModules();

        setInterval(() => {
            this.update();
        }, 1000 / 60);
    }

    #loadModules() {
        return new Promise(async (resolve, reject) => {
            this.modules.networkManager = new NetworkManager(this, this.io);
            this.modules.physicsModule = new PhysicsModule(this);

            this.scriptModules = await ScriptLoader.loadScripts();

            for (let module of this.scriptModules){
                this.modules[module.default.name] = new module.Backend(this);
                await this.modules[module.default.name].preload();
            }

            for (let module in this.modules) {
                if (typeof this.modules[module].start === "function") {
                    this.modules[module].start();
                }

                else {
                    throw new Error(`Module ${module} does not have a start function`);
                }
            }

            resolve(this.modules);
        });
    }

    addBE_Enity(name, BE_Enity){
        this.BE_Enities[name] = BE_Enity;
    }

    update() {
        this.dt = performance.now() - this.lastUpdate;
        this.lastUpdate = performance.now();

    
        for (let module in this.modules) {
            if (typeof this.modules[module].update === "function") {
                this.modules[module].update(this.dt);
            }

            else {
                throw new Error(`Module ${module} does not have an update function`);
            }
        }

        for (let enity in this.BE_Enities){
            this.BE_Enities[enity].update(this.dt);
        }
    }
}