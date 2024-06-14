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
        const range = 5000; // Range of bullet before it despawns

        const rbSpeed = this.entity.getComponent("rigidbody").rigidBody.velocity.mag; // get the speed of the bullet
        const timeToTarget = range / rbSpeed; // Calculate the time it will take for the bullet to reach the target

        const lifetime = timeToTarget; // seconds
        setTimeout(() => {
            this.engineAPI.getCurrentLevel().removeEntity(this.entity.name); // Remove the bullet after the lifetime
        }, lifetime * 1000 /* Convert seconds to milliseconds */);
    }

    Update(dt) {
        
    }
   
}


