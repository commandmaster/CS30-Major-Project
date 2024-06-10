import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs";
import { EntityAPI } from "../../../FrontendModules/entityModule.mjs";
import { PhysicsAPI } from "../../../FrontendModules/physicsModule.mjs";
import * as Physics from "../../../SharedCode/physicsEngine.mjs";


export default class TestingLevelManager extends ScriptingAPI.LevelManager {
    constructor(engineAPI, level) {
        super(engineAPI, level);
    }

    Start() {
        const entityAPI = this.engineAPI.getAPI('entity')
        const player = new EntityAPI.Entity(entityAPI, 'player')
       
        const rigidBody = new Physics.Rigidbody(new Physics.Vec2(0, 0), 0, 1, 1, [])
        rigidBody.addCollider(new Physics.CircleCollider(rigidBody, 0, 0, 1, 20))

        player.createComponent({"type": "rigidbody", "rigidBody": rigidBody})
        player.createComponent({"type": "scripting", "scriptNames": ["Movement"]})
        player.createComponent({"type": "animator"})

        const assetAPI = this.engineAPI.getAPI('asset')
        const animator = player.components.get('animator')
        animator.createAnimation('idle', "./assets/spriteSheets/playerAnims.png", 1056/8, 192, 8, 10)
        animator.playAnimation('idle')

        this.level.addEntity(player)


        const ground = new EntityAPI.Entity(entityAPI, 'ground')
        const groundRigidBody = new Physics.Rigidbody(new Physics.Vec2(0, 500), 0, Infinity, 1, [])
        groundRigidBody.addCollider(new Physics.RectangleCollider(groundRigidBody, 0, 0, 0, 1, 3000, 200))
        ground.createComponent({"type": "rigidbody", "rigidBody": groundRigidBody})
        this.level.addEntity(ground)

    }

    Update() {

    }


    End() {
        
    }
}



