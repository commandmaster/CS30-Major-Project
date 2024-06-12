import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs";
import { EntityAPI } from "../../../FrontendModules/entityModule.mjs";
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";
import { Vec2 } from "../../../SharedCode/physicsEngine.mjs";
const Physics = ScriptingAPI.Physics;


export default class Bullet extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
        const range = 5000;

        const rbSpeed = this.entity.getComponent("rigidbody").rigidBody.velocity.mag;
        const timeToTarget = range / rbSpeed;

        const lifetime = timeToTarget; // seconds
        setTimeout(() => {
            this.engineAPI.getCurrentLevel().removeEntity(this.entity.name);
        }, lifetime * 1000);
    }

    Update(dt) {
        
    }
   
}


