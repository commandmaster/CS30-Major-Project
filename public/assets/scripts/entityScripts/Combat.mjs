import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs";
import { EntityAPI } from "../../../FrontendModules/entityModule.mjs";
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";
import { Vec2 } from "../../../SharedCode/physicsEngine.mjs";
const Physics = ScriptingAPI.Physics;

class RecoilData{
    constructor({knockBackStrength, rotationalRecoilSpeed, verticalRecoilSpeed, rotationalMaxRecoil, verticalMaxRecoil, rotationalRecoilRandom, verticalRecoilRandom, recoilRandomInterval}){
        this.knockBackStrength = knockBackStrength;
        this.rotationalRecoilSpeed = rotationalRecoilSpeed;
        this.verticalRecoilSpeed = verticalRecoilSpeed;
        this.rotationalMaxRecoil = rotationalMaxRecoil;
        this.verticalMaxRecoil = verticalMaxRecoil;
        this.rotationalRecoilRandom = rotationalRecoilRandom;
        this.verticalRecoilRandom = verticalRecoilRandom;
        this.recoilRandomInterval = recoilRandomInterval;
    }
}

class GunAnimationData{
    constructor(name, spriteSheet, width, height, frames, frameRate, pivotPoint, flipPoint, offset, scale = 1){
        this.name = name;
        this.spriteSheet = spriteSheet;
        this.width = width;
        this.height = height;
        this.frames = frames;
        this.frameRate = frameRate;
        this.pivotPoint = pivotPoint;
        this.flipPoint = flipPoint;
        this.offset = offset;
        this.scale = scale;
    }
}

class BulletAnimationData{
    constructor(name, spriteSheet, width, height, frames, frameRate, pivotPoint, flipPoint, offset, scale = 1){
        this.name = name;
        this.spriteSheet = spriteSheet;
        this.width = width;
        this.height = height;
        this.frames = frames;
        this.frameRate = frameRate;
        this.pivotPoint = pivotPoint;
        this.flipPoint = flipPoint;
        this.offset = offset;
        this.scale = scale;
    }
}

class Gun {
    constructor({gunPositionOffset, recoilData, fireRate, bulletSize, bulletSpeed, bulletDamage}, gunAnimationDataArray, bulletAnimationData){
        this.gunPositionOffset = gunPositionOffset;
        this.recoilData = recoilData;
        this.bulletSize = bulletSize;
        this.bulletSpeed = bulletSpeed;
        this.bulletDamage = bulletDamage;
        this.fireRate = fireRate;

        this.gunAnimationDataArray = gunAnimationDataArray;
        this.bulletAnimationData = bulletAnimationData;
    }
}

export default class Combat extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }


    Start() {
   
        this.timeSinceStartedShooting = 0;
        this.recoilRandomTimer = 0;
        this.recoilRandomRotationalTarget = 0;
        this.recoilRandomVerticalTarget = 0;
        this.rotationalRecoil = 0;
        this.verticalRecoil = 0;


        const inputAPI = this.engineAPI.getAPI("input");
        const inputModule = this.engineAPI.getModule("input");

        inputModule.addMouseInput("shoot", "bool").addKeybind(0);


        this.guns = new Map();
        this.equippedWeapon = 'assaultRifle';

        const assaultRifleData = new Gun(
            {
                gunPositionOffset: {x: 0, y: 100},
                recoilData: new RecoilData({
                    knockBackStrength: 100,
                    rotationalRecoilSpeed: 0.3,
                    verticalRecoilSpeed: 0.1,
                    rotationalMaxRecoil: 30,
                    verticalMaxRecoil: 5,
                    rotationalRecoilRandom: 1.1,
                    verticalRecoilRandom: 0.2,
                    recoilRandomInterval: 0.35
                }),
                fireRate: 8,
                bulletSize: 3,
                bulletSpeed: 2200,
                bulletDamage: 1
            },
            [
                new GunAnimationData("shooting", "./assets/spriteSheets/assaultShot.png", 109, 41, 16, 100, {x: -70, y: -30}, {x: -70, y: -30}, {x: 0, y: 0}, 1.8),
                new GunAnimationData("idle", "./assets/spriteSheets/assaultIdle.png", 96, 32, 1, 1, {x: -70, y: -30}, {x: -70, y: -30}, {x: 0, y: 10}, 1.8)
            ],
            new BulletAnimationData("bullet", "./assets/spriteSheets/orangeBullet.png", 17, 12, 4, 8, {x: -15, y: -8}, {x: -15, y: -8}, {x: -12, y: -6}, 1.5)
        );

        this.guns.set('assaultRifle', assaultRifleData);


        // setup the weapon 
        const weaponEntity = this.entity;
        weaponEntity.createComponent({"type": "animator"});

        const allowedAnimNames = new Set(['idle', 'shooting', 'reload', 'inspect']);

        for (const gun of this.guns){
            const gunAnimationDataArray = gun[1].gunAnimationDataArray;
            for (const gunAnimationData of gunAnimationDataArray){
                const gunAnimation = gunAnimationData;
                const gunAnimator = weaponEntity.components.get('animator');

                // check if the animation name is allowed
                if (!allowedAnimNames.has(gunAnimation.name)){
                    console.error(`Animation name: ${gunAnimation.name} is not allowed`);
                    continue;
                }

                gunAnimator.createAnimation(gun[0] + gunAnimation.name, gunAnimation.spriteSheet, gunAnimation.width, gunAnimation.height, gunAnimation.frames, gunAnimation.frameRate).scale = gunAnimation.scale;
                gunAnimator.getAnimation(gun[0] + gunAnimation.name).pivotPoint = gunAnimation.pivotPoint;
                gunAnimator.getAnimation(gun[0] + gunAnimation.name).flipPoint = gunAnimation.flipPoint;
                gunAnimator.getAnimation(gun[0] + gunAnimation.name).offset = gunAnimation.offset;
            }
            
        }

        weaponEntity.components.get('animator').playAnimation(this.equippedWeapon + 'idle');
    }

    Update(dt) {
        const weaponEntity = this.entity;
        const currentAnimation = this.entity.components.get('animator').currentAnimation;

        if (this.engineAPI.getAPI('input').getMouseInput("shoot") && currentAnimation.name !== this.equippedWeapon + 'shooting'){
            const weaponEntity = this.entity;
            const weaponAnimator = weaponEntity.components.get('animator');
            weaponAnimator.playAnimation(this.equippedWeapon + 'shooting');
        }

        else if (!this.engineAPI.getAPI('input').getMouseInput("shoot") && currentAnimation.name !== this.equippedWeapon + 'idle'){
            const weaponEntity = this.entity;
            const weaponAnimator = weaponEntity.components.get('animator');
            weaponAnimator.playAnimation(this.equippedWeapon + 'idle');
        }

        if (currentAnimation.name === this.equippedWeapon + 'shooting'){
            this.recoilRandomTimer += dt;

            const shootingAnim = weaponEntity.components.get('animator').getAnimation(this.equippedWeapon + 'shooting');

            // set frame rate to match fire rate of the gun (one complete animation cycle per shot)
            const totalFrames = shootingAnim.frameCount; // total frames in the animation
            
            const fireRate = this.guns.get(this.equippedWeapon).fireRate; // fire rate of the gun

            // adjust the frame rate (fps) to match the fire rate of the gun
            shootingAnim.frameRate =  fireRate * totalFrames;


            // get recoil data from the gun
            const recoilData = this.guns.get(this.equippedWeapon).recoilData;
            const rotationalRecoilSpeed = recoilData.rotationalRecoilSpeed;
            const verticalRecoilSpeed = recoilData.verticalRecoilSpeed;
            const rotationalMaxRecoil = recoilData.rotationalMaxRecoil;
            const verticalMaxRecoil = recoilData.verticalMaxRecoil;
            const rotationalRecoilRandom = recoilData.rotationalRecoilRandom;
            const verticalRecoilRandom = recoilData.verticalRecoilRandom;
            const recoilRandomInterval = recoilData.recoilRandomInterval;
            
            


            this.timeSinceStartedShooting += dt;
            // apply recoil to the gun  
            this.rotationalRecoil += -rotationalRecoilSpeed;
            this.verticalRecoil += -verticalRecoilSpeed;

            
            this.rotationalRecoil = MathPlus.clamp(this.rotationalRecoil, -rotationalMaxRecoil, rotationalMaxRecoil);
            this.verticalRecoil = MathPlus.clamp(this.verticalRecoil, -verticalMaxRecoil, verticalMaxRecoil);

            this.rotationalRecoil = MathPlus.lerp(this.rotationalRecoil, this.rotationalRecoil + this.recoilRandomRotationalTarget , this.recoilRandomTimer / recoilRandomInterval);
            this.verticalRecoil = MathPlus.lerp(this.verticalRecoil, this.verticalRecoil + this.recoilRandomVerticalTarget, this.recoilRandomTimer / recoilRandomInterval);


            if (this.recoilRandomTimer >= recoilRandomInterval){
                this.recoilRandomTimer = 0;
                this.recoilRandomRotationalTarget = MathPlus.randomRange(0.6, 1) * rotationalRecoilRandom * (this.recoilRandomRotationalTarget > 0 ? -1 : 1);
                this.recoilRandomVerticalTarget =  MathPlus.randomRange(0.6, 1) * verticalRecoilRandom * (this.recoilRandomVerticalTarget > 0 ? -1 : 1);
            }

        } else{
            this.timeSinceStartedShooting = Infinity;
            this.rotationalRecoil = 0;
            this.verticalRecoil = 0;
            this.recoilRandomTimer = 0; 
        }

    
         
        const weaponPos = weaponEntity.components.get('transform').position

        const player = this.engineAPI.getCurrentLevel().getEntity('player');
        const playerPos = player.components.get('transform').position

        weaponPos.x = playerPos.x + this.guns.get(this.equippedWeapon).gunPositionOffset.x;

        const currentAnimationName = currentAnimation.name;
        weaponPos.y = playerPos.y + this.guns.get(this.equippedWeapon).gunPositionOffset.y;

        const mouseToweapon = this.engineAPI.getAPI('render').getCamera().screenToWorld(this.engineAPI.getAPI('input').getMousePosition().x, this.engineAPI.getAPI('input').getMousePosition().y);

        
        
        const rot = (Math.atan2(mouseToweapon.y - weaponPos.y, mouseToweapon.x - weaponPos.x) - Math.PI/2) * 180 / Math.PI + 90
        if (rot > 90 || rot < -90){
            currentAnimation.isFlipped = true;
        }
        else{
            currentAnimation.isFlipped = false;
        }

        weaponEntity.components.get('transform').rotation = (currentAnimation.isFlipped ? -1 : 1) * (Math.atan2(mouseToweapon.y - weaponPos.y, mouseToweapon.x - weaponPos.x) - Math.PI/2) * 180 / Math.PI + 90;

        weaponEntity.components.get('transform').rotation += this.rotationalRecoil; 
        weaponEntity.components.get('transform').position.y += this.verticalRecoil;
        

        if (currentAnimation.name === this.equippedWeapon + 'shooting' && this.timeSinceStartedShooting >= 1 / this.guns.get(this.equippedWeapon).fireRate){
            // Have to run at the end of the frame to fix bug where the gun rotation is not updated is time and fires a bullet in the wrong direction
            this.shootBullet();
        }
    }

    shootBullet(){
        this.timeSinceStartedShooting = 0;


        const bullet = new EntityAPI.Entity(this.engineAPI.getAPI('entity'), 'bullet' + crypto.randomUUID());
        bullet.createComponent({"type":"animator"});
        const bulletAnimator = bullet.components.get('animator');

        const bulletAnimationData = this.guns.get(this.equippedWeapon).bulletAnimationData;

        const bulletAnim = bulletAnimator.createAnimation(bulletAnimationData.name, bulletAnimationData.spriteSheet, bulletAnimationData.width, bulletAnimationData.height, bulletAnimationData.frames, bulletAnimationData.frameRate);
        bulletAnim.scale = bulletAnimationData.scale;
        bulletAnim.pivotPoint = bulletAnimationData.pivotPoint;
        bulletAnim.offset = bulletAnimationData.offset;
        bulletAnimator.playAnimation(bulletAnimationData.name);

        
        // get the rotated position of the gun barrel
        // get the translated pivot point of the gun barrel
        const weaponEntity = this.entity;
        const weaponPos = weaponEntity.components.get('transform').position;
        const currentAnimation = weaponEntity.components.get('animator').currentAnimation;

        
        const pivotPoint = currentAnimation.pivotPoint;

        const gunCenter = new Vec2(weaponPos.x - pivotPoint.x , weaponPos.y - pivotPoint.y);

        const bulletPos = Vec2.rotatePoint(new Vec2(gunCenter.x + ((currentAnimation.isFlipped ? -1 : 1) * 90), gunCenter.y), new Vec2(gunCenter.x, gunCenter.y), (currentAnimation.isFlipped ? -1 : 1) * weaponEntity.components.get('transform').rotation * Math.PI / 180);
        
        
        const bulletSize = this.guns.get(this.equippedWeapon).bulletSize;
        bullet.createComponent({"type": "rigidbody", "rigidBody": new Physics.Rigidbody(bulletPos, 0, 1, 0.1, [])});
        bullet.createComponent({"type": "scripting", "scriptNames": ["Bullet"]});   
        bullet.getComponent('rigidbody').rigidBody.addCollider(new Physics.CircleCollider(bullet.getComponent('rigidbody').rigidBody, 0, 0, 1, bulletSize)).tags.add('bullet');

        const bulletRb = bullet.getComponent('rigidbody').rigidBody;
        

        bulletRb.acceleration = new Vec2(0, 0);

        bulletRb.velocity = Physics.Vec2.sub(gunCenter, bulletPos).normalize().scale(this.guns.get(this.equippedWeapon).bulletSpeed);
        const playerRb = this.engineAPI.getCurrentLevel().getEntity('player').components.get('rigidbody').rigidBody;

        const recoilVector = new Vec2(bulletRb.velocity.x, bulletRb.velocity.y).normalize().scale(this.guns.get(this.equippedWeapon).recoilData.knockBackStrength);
        recoilVector.y = 0;

        playerRb.velocity.sub(recoilVector);

        bullet.components.get('transform').rotation = Vec2.angle(bulletRb.velocity) * 180 / Math.PI;

        bulletRb.onCollisionEnterFunc = (rigidBody, collisionData, otherBody) => {
            const level = this.engineAPI.getCurrentLevel();
            level.removeEntity(bullet.name);
        }

        const level = this.engineAPI.getCurrentLevel();
        level.addEntity(bullet);
    }
}


