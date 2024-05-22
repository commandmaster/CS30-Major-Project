import { NetworkManager } from "./network.mjs";
import { PhysicsModule } from "./physics.mjs";

import path from "path";
import slash from "slash";

import * as fsPromises from "fs/promises";
const __dirname = import.meta.dirname;

export class Engine {
    constructor(io) {
        this.modules = {};
        this.io = io;

        this.dt = 0;
        this.lastUpdate = performance.now();

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
            this.scriptModules.forEach((module) => {
                this.modules[module.default.name] = new module.Backend(this);
            });
        });
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
    }
}

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

class PhysicsEnity{
    constructor(engine){
        this.engine = engine;
    }
}
