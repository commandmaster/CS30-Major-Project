import { EntityAPI } from "./frontendModules/entityModule.js";
import { Level } from "./frontendModules/engine.js";
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
        const newEntity = new EntityAPI.Entity(entityAPI, "testEntity");
        const rb = new Physics.Rigidbody(new Physics.Vec2(0, 0), 0, 1, 1, []);
        const collider = new Physics.CircleCollider(rb, 0, 0, 1, 10);
        rb.addCollider(collider);

        newEntity.createComponent({rigidBody: rb, type: "rigidbody"});
        // newEntity.createComponent({position: {x: 0, y: 0}, rotation: 0, type: "transform"});

        const testLevel = new Level(this.engineAPI, [newEntity], "testLevel");    
        entityAPI.engine.loadLevel(testLevel);  
    }

    Update(dt){

    }
}