import { ModuleAPI, Module } from "./moduleBase.mjs";
import { Component } from "./moduleBase.mjs";
import { EntityAPI } from "./entityModule.mjs";
import { Vec2 } from "../SharedCode/physicsEngine.mjs";

// Import everything so the scripts can use them as static mehtods of the scripting api class
// Namespace them so they can be accessed, Ex. ScriptingAPI.Physics, ScriptingAPI.Asset, etc.
import * as Physics from "../SharedCode/physicsEngine.mjs";
import * as Asset from "../FrontendModules/assetModule.mjs";
import * as Entity from "../FrontendModules/entityModule.mjs";
import * as Particle from "../FrontendModules/particleModule.mjs";
import * as Input from "../FrontendModules/inputModule.mjs";
import * as Render from "../FrontendModules/renderModule.mjs";
import * as Audio from "../FrontendModules/audioModule.mjs";



class ScriptingComponent extends Component {
    constructor(entity, parentModule, engineAPI, componentConfig) {
        super(entity, parentModule, engineAPI, componentConfig);
        
        this.scriptNames = componentConfig.scriptNames; // Array of script names

        this.scripts = new Map(); // Map of script names to script instances

        const scriptingAPI = this.engineAPI.getAPI("scripting"); // Get the scripting API
        for (const scriptName of componentConfig.scriptNames) {
            this.scripts.set(scriptName, scriptingAPI.instantiateEntityScript(entity, scriptName)); // Instantiate the script
        }
    }

    start(){
        for (const script of this.scripts.values()) {
            script.Start(); // Call the start method of the script
        }
    }

    update(dt){
        for (const script of this.scripts.values()) {
            script.Update(dt); // Call the update method of the script
        }
    }

    end(){
        for (const script of this.scripts.values()) {
            if (typeof script.End === 'function') script.End(); // Call the end method of the script
        }
    }
}



class Monobehaviour{
    constructor(engineAPI, entity){
        this.engineAPI = engineAPI;
        this.entity = entity;
        this.scriptingAPI = engineAPI.getAPI("scripting");
       
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

class LevelManager {
    constructor(engineAPI, level){
        this.engineAPI = engineAPI;
        this.level = level;
    }

    Start(){

    }

    Update(dt){
        
    }

    End(){

    }

}

export class ScriptingAPI extends ModuleAPI {
    static ScriptingComponent = ScriptingComponent;
    static Monobehaviour = Monobehaviour;
    static LevelManager = LevelManager;

    static Physics = Physics;
    static Asset = Asset;
    static Entity = Entity;
    static Particle = Particle;
    static Input = Input;
    static Render = Render;
    static Audio = Audio;

    static async loadScript(scriptPath) {
        // Load the script from the path
        // This is a helper function to load a script from a path

        return new Promise((resolve, reject) => {
            const url = new URL(scriptPath, window.location.href).href;

            import(".." + scriptPath).then((script) => {
                resolve(script.default);
            }).catch((error) => {
                console.error(`Error loading script: ${url}`);
                reject(error);
            });
        });
    }

    constructor(engineAPI) {
        super(engineAPI);
    }

    instantiateLevelManager(levelManagerName, level, engineAPI){
        const levelManagerClasses = this.engineAPI.getModule("scripting").levelManagerClasses; // Get the level manager classes
        if (!levelManagerClasses[levelManagerName]) throw new Error(`LevelManager ${levelManagerName} not found`); // Check if the level manager exists
        return new levelManagerClasses[levelManagerName](engineAPI, level); // Instantiate the level manager
    }

    instantiateEntityScript(entity, scriptName){
        const entityClasses = this.engineAPI.getModule("scripting").entityClasses; // Get the entity classes
        
        if (!entityClasses[scriptName]) throw new Error(`Entity script ${scriptName} not found`);
        return new entityClasses[scriptName](this.engineAPI, entity);
    }


}

export class ScriptingModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);

        this.levelManagerClasses = {};
        this.entityClasses = {};
    }

    async preload() {
        // Preload the scripting module

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
            
            // Wait for the asset module to load
            await waitForCondition(() => this.engineAPI.getModule("asset").assetConfig !== undefined);
            const scripts = this.engineAPI.getModule("asset").assetConfig.filter(asset => asset.type === "script" && asset.subType === "levelManager");
            for (const script of scripts) {
                const scriptClass = await ScriptingAPI.loadScript(script.path);
                this.levelManagerClasses[script.name] = scriptClass;
            }

            // Wait for the asset module to load
            const entityScripts = this.engineAPI.getModule("asset").assetConfig.filter(asset => asset.type === "script" && asset.subType === "entity");
            for (const script of entityScripts) {
                const scriptClass = await ScriptingAPI.loadScript(script.path);
                this.entityClasses[script.name] = scriptClass;
            }

            resolve();
        });
    }

    
}