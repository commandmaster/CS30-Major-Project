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

class BE_Entity{
    constructor(engine, name){
        this.engine = engine;
        this.BE_PhysicsModule = engine.modules.physicsModule;

        this.name = name;
        this.rb = null;

        this.engine.addBE_Entity(name, this);

        this.currentAnim = null;
        this.currenFrame = 0;
    }

    updateEntityState(decodedEntityPacket){
        // update the entity with the new state
        if (decodedEntityPacket.animationData !== undefined) this.currentAnim = decodedEntityPacket.animationData.currentAnim;
        if (decodedEntityPacket.animationData !== undefined) this.currentFrame = decodedEntityPacket.animationData.frame;
    }

    addRigidBody({position, rotation, mass, bounce, colliders}){
        this.rb = this.BE_PhysicsModule.createRigidBody({position, rotation, mass, bounce, colliders});
    }

    start(){
        
    }

    update(dt){
        
    }
}

class BE_Input{
    constructor(name, defaultValue = 0){
        this.defaultValue = defaultValue;
        this.name = name;
        this.value = defaultValue;
        this.pressed = false;
    }

    inputDown(value){
        this.value = value;
        this.pressed = true;
    }

    inputUp(value){
        this.value = value;
        this.pressed = false;
    }
}


class BE_Player extends BE_Entity{
    constructor(engine, name){
        super(engine, name);

        this.inputs = {}
    }

    addInput(inputName, defaultValue = false){
        this.inputs[inputName] = new BE_Input(inputName, defaultValue);
    }

    inputDown(inputName, value){
        this.inputs[inputName].inputDown(value);
    }

    inputUp(inputName, value){
        this.inputs[inputName].inputUp(value);
    }

    isPressed(inputName){
        return this.inputs[inputName].value !== this.inputs[inputName].defaultValue;
    }

    getInput(inputName){
        return this.inputs[inputName].value;
    }

    alreadyPressed(inputName){
        return this.inputs[inputName].pressed;
    }

    start(){
        
    }

    update(dt){
        
    }
}



export class Engine {
    static BE_Entity = BE_Entity;
    static BE_Player = BE_Player;
    static BE_Input = BE_Input;

    constructor(io, room) {
        this.modules = {};
        this.io = io;
        this.room = room;

        this.dt = 0;
        this.lastUpdate = performance.now();

        this.BE_Enities = {};

        this.#loadModules();

        setInterval(() => {
            this.update();
        }, 1000 / 60);
    }

    #loadModules() {
        this.allModulesLoaded = false;
        return new Promise(async (resolve, reject) => {
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

            this.allModulesLoaded = true;
            resolve(this.modules);
        });
    }

    onConnection(socket){
        const moduleTimeOutId = setTimeout(() => {
            if (this.allModulesLoaded){
                for (let module in this.modules){
                    if (typeof this.modules[module].onConnection === "function"){
                        this.modules[module].onConnection(socket);
                    }
                }
                clearTimeout(moduleTimeOutId);
            }
        }, 50);
    }

    onDisconnection(socket){
       const moduleTimeOutId = setTimeout(() => {
            if (this.allModulesLoaded){
                for (let module in this.modules){
                    if (typeof this.modules[module].onDisconnection === "function"){
                        this.modules[module].onDisconnection(socket);
                    }
                }
                clearTimeout(moduleTimeOutId);
            }
        }, 50); 
    }

    addBE_Entity(name, BE_Entity){
        this.BE_Enities[name] = BE_Entity;
    }

    deleteEntity(name){
        if (this.BE_Enities[name] !== undefined) {
            if (this.BE_Enities[name].rb !== null) this.modules.physicsModule.physicsEngine.deleteRigidbody(this.BE_Enities[name].rb);
            delete this.BE_Enities[name];
        }
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