import { EntityAPI } from "./frontendModules/entityModule.js";
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
        const newEntity = new EntityAPI.Entity(entityAPI, "testEntity");
        newEntity.createComponent({position: {x: 0, y: 0}, rotation: 0, type: "transform"});
        console.log(newEntity);
    }

    Update(dt){

    }
}