import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs";
import { EntityAPI } from "../../../FrontendModules/entityModule.mjs";
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";
import { Vec2 } from "../../../SharedCode/physicsEngine.mjs";
const Physics = ScriptingAPI.Physics;


export default class Gun extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
       console.log("Gun Start");

        const inputAPI = this.engineAPI.getAPI("input");
        const inputModule = this.engineAPI.getModule("input");

        inputModule.addMouseInput("shoot", "bool").addKeybind(0);


        const assaultRifle = this.entity;

        const assaultAnimator = assaultRifle.components.get('animator');
        assaultAnimator.createAnimation('shoot', "./assets/spriteSheets/assaultShot.png", 109, 41, 16, 100).scale = 1.8;
        assaultAnimator.playAnimation('shoot');

        assaultAnimator.createAnimation('idle', "./assets/spriteSheets/assaultIdle.png", 96, 32, 1, 1).scale = 1.8;
        assaultAnimator.playAnimation('idle');

    }

    Update() {
        const currentAnimation = this.entity.components.get('animator').currentAnimation;

        if (this.engineAPI.getAPI('input').getMouseInput("shoot") && currentAnimation.name !== 'shoot'){
            const assaultRifle = this.entity;
            const assaultAnimator = assaultRifle.components.get('animator');
            assaultAnimator.playAnimation('shoot');
        }

        else if (!this.engineAPI.getAPI('input').getMouseInput("shoot") && currentAnimation.name !== 'idle'){
            const assaultRifle = this.entity;
            const assaultAnimator = assaultRifle.components.get('animator');
            assaultAnimator.playAnimation('idle');
        }


        

        const assaultRifle = this.entity; 
        const assaultPos = assaultRifle.components.get('transform').position

        const player = this.engineAPI.getCurrentLevel().getEntity('player');
        const playerPos = player.components.get('transform').position

        assaultPos.x = playerPos.x + 40;

        const currentAnimationName = currentAnimation.name;
        assaultPos.y = playerPos.y + (currentAnimationName === 'shoot' ? 100 : 120); 

        const mouseToRifle = this.engineAPI.getAPI('render').getCamera().screenToWorld(this.engineAPI.getAPI('input').getMousePosition().x, this.engineAPI.getAPI('input').getMousePosition().y);

        assaultRifle.components.get('transform').rotation = (Math.atan2(mouseToRifle.y - assaultPos.y, mouseToRifle.x - assaultPos.x) - Math.PI/2) * 180 / Math.PI + 90;

        if (currentAnimation.name === 'shoot' && currentAnimation.frameIndex === 7){
            const bullet = new EntityAPI.Entity(this.engineAPI.getAPI('entity'), 'bullet' + crypto.randomUUID());
            
            // get the rotated position of the gun barrel
            const bulletPos = Vec2.rotatePoint(new Vec2(assaultPos.x + 150, assaultPos.y), assaultPos, assaultRifle.components.get('transform').rotation * Math.PI / 180);

            

            bullet.createComponent({"type": "rigidbody", "rigidBody": new Physics.Rigidbody(bulletPos, 0, 1, 0.1, [])});
            bullet.getComponent('rigidbody').rigidBody.addCollider(new Physics.CircleCollider(bullet.getComponent('rigidbody').rigidBody, 0, 0, 1, 3));

            const bulletRb = bullet.getComponent('rigidbody').rigidBody;
            bulletRb.velocity = Physics.Vec2.sub(mouseToRifle, bulletPos).normalize().scale(-3000);


            const level = this.engineAPI.getCurrentLevel();
            level.addEntity(bullet);
        }

    }
}


