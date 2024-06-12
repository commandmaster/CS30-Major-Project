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
       
        const rigidBody = new Physics.Rigidbody(new Physics.Vec2(0, 0), 0, 1, 0.1, [])
        rigidBody.addCollider(new Physics.CircleCollider(rigidBody, 70, 120, 1,70))

        const tileMapGenerator = new EntityAPI.Entity(entityAPI, 'tileMapGenerator')
        tileMapGenerator.createComponent({"type": "scripting", "scriptNames": ["TileGenerator"]});
        this.level.addEntity(tileMapGenerator);


        player.createComponent({"type": "rigidbody", "rigidBody": rigidBody});
        player.createComponent({"type": "scripting", "scriptNames": ["Movement"]});
        player.createComponent({"type": "animator"});

        const assaultRifle = new EntityAPI.Entity(entityAPI, 'assaultRifle');
        assaultRifle.createComponent({"type": "animator"});
        assaultRifle.createComponent({"type": "scripting", "scriptNames": ["Combat"]});

        const animator = player.components.get('animator')
        animator.createAnimation('idle', "./assets/spriteSheets/playerAnims.png", 1056/8, 192, 8, 10)
        animator.getAnimation('idle').pivotPoint = {x: -70, y: -70};
        animator.getAnimation('idle').flipPoint = {x: -70, y: -70};
        animator.playAnimation('idle');

        this.level.addEntity(player);
        this.level.addEntity(assaultRifle);


        const ground = new EntityAPI.Entity(entityAPI, 'ground')
        const groundRigidBody = new Physics.Rigidbody(new Physics.Vec2(0, 500), 0, Infinity, 1, [])
        groundRigidBody.addCollider(new Physics.RectangleCollider(groundRigidBody, 0, 0, 0, 1, 1200, 630)).tags.add('ground')
        // ground.createComponent({"type": "rigidbody", "rigidBody": groundRigidBody})

        // ground.createComponent({"type": "spriteRenderer"});

        // const groundRenderer = ground.components.get('spriteRenderer')

        // groundRenderer.setTileRender(
        //     './assets/textures/groundTexture.jpg',
        //     1200,
        //     630,
        //     0, 
        //     0,
        //     1
        // )
        this.level.addEntity(ground) 



    }

    Update() {
        
         
    }


    End() {
        
    }
}



