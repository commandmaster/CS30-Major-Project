import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.js";
import { EntityAPI } from "../../../FrontendModules/entityModule.js";
import { PhysicsAPI } from "../../../frontendModules/physicsModule.js";
import * as Physics from "../../../SharedCode/physicsEngine.mjs";


export default class TestingLevelManager extends ScriptingAPI.LevelManager {
    constructor(engineAPI, level) {
        super(engineAPI, level);
    }

    Start() {
       console.log("TestingLevelManager Start() called!"); 
       console.log(this.engineAPI)
        console.log(this.level)

        const entityAPI = this.engineAPI.getAPI("entity");
        const newEntity = new EntityAPI.Entity(entityAPI, "testEntity");
        
        
        const rb = new Physics.Rigidbody(new Physics.Vec2(0, 0), 0, 1, 1, []);
        const collider = new Physics.CircleCollider(rb, 0, 0, 1, 10);
        rb.addCollider(collider);

        const scriptingComponent = new ScriptingAPI.ScriptingComponent(newEntity, this.engineAPI, ["Movement"]);

        newEntity.createComponent({rigidBody: rb, type: "rigidbody"});
        // newEntity.createComponent({position: {x: 0, y: 0}, rotation: 0, type: "transform"});

        this.level.addEntity(newEntity);
    }

    Update() {
        
    }

    End() {
        
    }
}

