import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs";
import { EntityAPI } from "../../../FrontendModules/entityModule.mjs";
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";
import { Vec2 } from "../../../SharedCode/physicsEngine.mjs";
const Physics = ScriptingAPI.Physics;


export default class Gun extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    #weaponSway(){
        const inputAPI = this.engineAPI.getAPI("input");
        
        const player = this.engineAPI.getCurrentLevel().getEntity("player");
        const playerPos = player.components.get("transform").position;

    }



    Start() {
        this.rotationalRecoil = 0;
        this.verticalRecoil = 0;
        this.rotationBeforeRecoil = 0;
        this.verticalBeforeRecoil = 0;
        this.timeSinceStartedShooting = 0;
        this.rotationalRecoilSpeed = 0.3;
        this.verticalRecoilSpeed = 0.1;
        this.rotationMaxRecoil = 15;
        this.verticalMaxRecoil = 5;

        this.rotationalRecoilRandom = 10;
        this.verticalRecoilRandom = 5;
        this.recoilRandomInterval = 1;

        this.recoilRandomTimer = 0;
        this.recoilRandomRotationalTarget = 0;
        this.recoilRandomVerticalTarget = 0;


        const inputAPI = this.engineAPI.getAPI("input");
        const inputModule = this.engineAPI.getModule("input");

        inputModule.addMouseInput("shoot", "bool").addKeybind(0);


        const assaultRifle = this.entity;

        const assaultAnimator = assaultRifle.components.get('animator');
        assaultAnimator.createAnimation('shoot', "./assets/spriteSheets/assaultShot.png", 109, 41, 16, 100).scale = 1.8;
        assaultAnimator.getAnimation('shoot').pivotPoint = {x: -70, y: -30};
        assaultAnimator.getAnimation('shoot').flipPoint = {x: -70, y: -30};

        assaultAnimator.playAnimation('shoot');

        assaultAnimator.createAnimation('idle', "./assets/spriteSheets/assaultIdle.png", 96, 32, 1, 1).scale = 1.8;
        assaultAnimator.getAnimation('idle').pivotPoint = {x: -70, y: -30};
        assaultAnimator.getAnimation('idle').flipPoint = {x: -70, y: -30};
        assaultAnimator.playAnimation('idle');


    }

    Update(dt) {
        const assaultRifle = this.entity;
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

        if (currentAnimation.name === 'shoot'){
            this.timeSinceStartedShooting += dt;
            // apply recoil to the gun  
            this.rotationalRecoil += -this.rotationalRecoilSpeed + MathPlus.lerp(this.rotationalRecoil, this.recoilRandomRotationalTarget, this.recoilRandomTimer / this.recoilRandomInterval);
            this.verticalRecoil += -this.verticalRecoilSpeed + MathPlus.lerp(this.verticalRecoil, this.verticalRecoilRandom, this.recoilRandomTimer / this.recoilRandomInterval);
            this.rotationalRecoil = MathPlus.clamp(this.rotationalRecoil, -this.rotationMaxRecoil, this.rotationMaxRecoil);
            this.verticalRecoil = MathPlus.clamp(this.verticalRecoil, -this.verticalMaxRecoil, this.verticalMaxRecoil);
            this.recoilRandomTimer += dt;

            if (this.recoilRandomTimer >= this.recoilRandomInterval){
                this.recoilRandomTimer = 0;
                this.recoilRandomRotationalTarget = MathPlus.randomRange(-1, 1) * this.rotationalRecoilRandom;
                this.recoilRandomVerticalTarget = MathPlus.randomRange(-1, 1) * this.verticalRecoilRandom;
            }

        } else{
            this.timeSinceStartedShooting = 0;
            this.rotationalRecoil = 0;
            this.verticalRecoil = 0;
            this.recoilRandomTimer = 0;
            this.rotationBeforeRecoil = assaultRifle.components.get('transform').rotation;
            this.verticalBeforeRecoil = assaultRifle.components.get('transform').position.y;


        }

    
         
        const assaultPos = assaultRifle.components.get('transform').position

        const player = this.engineAPI.getCurrentLevel().getEntity('player');
        const playerPos = player.components.get('transform').position

        assaultPos.x = playerPos.x + 0;

        const currentAnimationName = currentAnimation.name;
        assaultPos.y = playerPos.y + (currentAnimationName === 'shoot' ? 100 : 120); 

        const mouseToRifle = this.engineAPI.getAPI('render').getCamera().screenToWorld(this.engineAPI.getAPI('input').getMousePosition().x, this.engineAPI.getAPI('input').getMousePosition().y);

        
        
        const rot = (Math.atan2(mouseToRifle.y - assaultPos.y, mouseToRifle.x - assaultPos.x) - Math.PI/2) * 180 / Math.PI + 90
        if (rot > 90 || rot < -90){
            currentAnimation.isFlipped = true;
        }
        else{
            currentAnimation.isFlipped = false;
        }

        assaultRifle.components.get('transform').rotation = (currentAnimation.isFlipped ? -1 : 1) * (Math.atan2(mouseToRifle.y - assaultPos.y, mouseToRifle.x - assaultPos.x) - Math.PI/2) * 180 / Math.PI + 90;

        assaultRifle.components.get('transform').rotation += this.rotationalRecoil; 
        assaultRifle.components.get('transform').position.y += this.verticalRecoil;
        

    

        if (currentAnimation.name === 'shoot' && currentAnimation.frameIndex === 7){
            


            const bullet = new EntityAPI.Entity(this.engineAPI.getAPI('entity'), 'bullet' + crypto.randomUUID());
            bullet.createComponent({"type":"animator"});
            const bulletAnimator = bullet.components.get('animator');

            const bulletAnim = bulletAnimator.createAnimation('bullet', './assets/spriteSheets/orangeBullet.png', 17, 12, 4, 8);
            bulletAnim.scale = 1.5;
            bulletAnim.pivotPoint = {x: -15, y: -8};
            bulletAnim.offset = {x: -12, y: -6};
            bulletAnimator.playAnimation('bullet');

            
            // get the rotated position of the gun barrel
            // get the translated pivot point of the gun barrel
            const pivotPoint = currentAnimation.pivotPoint;
            const flipPoint = currentAnimation.flipPoint;


            const gunCenter = new Vec2(assaultPos.x - pivotPoint.x , assaultPos.y - pivotPoint.y);

            const bulletPos = Vec2.rotatePoint(new Vec2(gunCenter.x + ((currentAnimation.isFlipped ? -1 : 1) * 90), gunCenter.y), new Vec2(gunCenter.x, gunCenter.y), (currentAnimation.isFlipped ? -1 : 1) * assaultRifle.components.get('transform').rotation * Math.PI / 180);
            
            

            bullet.createComponent({"type": "rigidbody", "rigidBody": new Physics.Rigidbody(bulletPos, 0, 1, 0.1, [])});
            bullet.getComponent('rigidbody').rigidBody.addCollider(new Physics.CircleCollider(bullet.getComponent('rigidbody').rigidBody, 0, 0, 1, 3));

            const bulletRb = bullet.getComponent('rigidbody').rigidBody;
            const playerRb = player.components.get('rigidbody').rigidBody;

            bulletRb.velocity = Physics.Vec2.sub(gunCenter, bulletPos).normalize().scale(2000);
            bullet.components.get('transform').rotation = Vec2.angle(bulletRb.velocity) * 180 / Math.PI;

            bulletRb.onCollisionEnterFunc = (rigidBody, collisionData, otherBody) => {
                if (collisionData.collider1.tags.has('enemy') || collisionData.collider2.tags.has('enemy')){
                    const level = this.engineAPI.getCurrentLevel();
                    level.removeEntity(rigidBody.entity);
                    level.removeEntity(otherBody.entity);
                }

                else {
                    const level = this.engineAPI.getCurrentLevel();
                    level.removeEntity(bullet.name);
                }
            }

            const level = this.engineAPI.getCurrentLevel();
            level.addEntity(bullet);
        }
    }
}


