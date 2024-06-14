import { Level } from "./FrontendModules/engine.mjs"; 
import * as Physics from "./SharedCode/physicsEngine.mjs" 

export default class GameManager {
    constructor(engineAPI) {
        this.engineAPI = engineAPI;
        this.ctx = engineAPI.ctx;
        this.canvas = engineAPI.canvas;
        this.engine = engineAPI.engine;
    }

    async Preload(){
        return new Promise(async (resolve, reject) => {
            resolve();
        });
    }

    Start(){
        const entityAPI = this.engineAPI.getAPI("entity");
        const testLevel = new Level(this.engineAPI, [], "testLevel");    
        entityAPI.engine.loadLevel(testLevel);  
    }

    Update(dt){

    }
}