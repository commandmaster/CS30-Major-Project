import { ModuleAPI, Module } from "./moduleBase.js";
import { Component } from "./moduleBase.js";
import { EntityAPI } from "./entityModule.js";
import { Vec2 } from "../SharedCode/physicsEngine.mjs";


class ScriptingComponent extends Component {
    constructor(entity, parentModule, engineAPI, componentConfig) {
        super(entity, parentModule, engineAPI, componentConfig);
    }
}



class Monobehaviour{
    constructor(engineAPI, entity){
        this.engineAPI = engineAPI;
        this.entity = entity;
        this.ScriptingAPI = engineAPI.getAPI("scripting");
       
    }

    start(){

    }

    update(){
        
    }

    instantiate(serializedEntity, position, rotation, velocity=Vec2.zero){
        if (typeof serializedEntity === 'string') serializedEntity = JSON.parse(serializedEntity);

        if (!position instanceof Vec2) throw new Error("Position must be a Vec2");
        if (!rotation instanceof Number) throw new Error("Rotation must be a a valid Number");

        return EntityAPI.Entity.fromJSON(serializedEntity, this.engineAPI, {position, rotation, velocity});
    }

    onCollisionEnter(){

    }

    onCollisionExit(){

    }

    
    
}

export class ScriptingAPI extends ModuleAPI {
    static ScriptingComponent = ScriptingComponent;
    static Monobehaviour = Monobehaviour;

    static async loadScript(scriptPath) {
        return new Promise((resolve, reject) => {
            import(scriptPath).then((script) => {
                resolve(script);
            }).catch((error) => {
                console.error(`Error loading script: ${scriptPath}`);
                reject(error);
            });
        });
    }

    constructor(engineAPI) {
        super(engineAPI);
    }

    instantiateLevelManager(levelManagerName, level, engineAPI){
        if (!this.levelManagerClasses[levelManagerName]) throw new Error(`LevelManager ${levelManagerName} not found`);
        return new this.levelManagerClasses[levelManagerName](engineAPI, level);
    }


}

export class ScriptingModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);

        this.levelManagerClasses = {};
    }

    async preload() {
        // Load scripts
        return new Promise(async (resolve, reject) => {
            function waitForCondition(condition) {
                return new Promise((resolve) => {
                    const intervalId = setInterval(() => {
                    if (condition()) {
                        clearInterval(intervalId);
                        resolve();
                    }
                    }, 20);
                });
            }
            
            await waitForCondition(() => this.engineAPI.getModule("asset").assetConfig !== undefined);
            const scripts = this.engineAPI.getModule("asset").assetConfig.filter(asset => asset.type === "script" && asset.subType === "levelManager");
            for (const script of scripts) {
                const scriptClass = await this.loadScript(script.path);
                this.levelManagerClasses[script.name] = scriptClass;
            }
            resolve();
        });
    }

    
}