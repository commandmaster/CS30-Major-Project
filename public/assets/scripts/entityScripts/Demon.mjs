import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs";
import { EntityAPI } from "../../../FrontendModules/entityModule.mjs";
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";
import { Vec2 } from "../../../SharedCode/physicsEngine.mjs";
const Physics = ScriptingAPI.Physics;


export default class Demon extends ScriptingAPI.Monobehaviour {
    #lastAttackTime = 0;

    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
        this.isDead = false;
        this.health = 2;
        this.speed = 200;

        this.#lastAttackTime = performance.now();

        this.entity.components.get('transform').position = {x: 750, y: 0};

        this.entity.createComponent({"type": "animator"});
        const animator = this.entity.components.get('animator'); 

        animator.createAnimation('idle', "./assets/spriteSheets/flyingDemonAnims/IDLE.png", 316/4, 69, 4, 10);
        animator.getAnimation('idle').pivotPoint = {x: -35, y: -35};
        animator.getAnimation('idle').flipPoint = {x: -35, y: -35};

        animator.createAnimation('attack', "./assets/spriteSheets/flyingDemonAnims/ATTACK.png", 632/8, 69, 8, 10);
        animator.getAnimation('attack').pivotPoint = {x: -25, y: -35};
        animator.getAnimation('attack').flipPoint = {x: -25, y: -35};

        animator.createAnimation('death', "./assets/spriteSheets/flyingDemonAnims/DEATH.png", 553/7, 69, 7, 8);
        animator.getAnimation('death').pivotPoint = {x: -28, y: -35};
        animator.getAnimation('death').flipPoint = {x: -28, y: -35};

        animator.createAnimation('hurt', "./assets/spriteSheets/flyingDemonAnims/HURT.png", 316/4, 69, 4, 10);
        animator.getAnimation('hurt').pivotPoint = {x: -28, y: -35};
        animator.getAnimation('hurt').flipPoint = {x: -28, y: -35};

        animator.playAnimation('idle');

        const transformPos = this.entity.components.get('transform').position;
        const rigidBody = new Physics.Rigidbody(new Vec2(transformPos.x, transformPos.y), 0, 5, 0.1, []);
        rigidBody.addCollider(new Physics.CircleCollider(rigidBody, 33, 35, 1, 30));

        rigidBody.onCollisionEnterFunc = (rigidBody, collisionData, otherBody) => {
            const collider1 = collisionData.collider1;
            const collider2 = collisionData.collider2;

            if (collider1.tags.has('bullet') || collider2.tags.has('bullet')) {
                this.health -= 1;
            }
        }

        this.entity.createComponent({"type": "rigidbody", "rigidBody": rigidBody});
    }

    Update(dt) {
        if (this.isDead) {
            const rb = this.entity.components.get('rigidbody').rigidBody;
            rb.velocity = new Vec2(0, 0);
            const currentFrame = this.entity.components.get('animator').currentAnimation.frameIndex;
            const lastFrame = this.entity.components.get('animator').currentAnimation.frameCount - 1;

            if (currentFrame >= lastFrame) {
                const level = this.engineAPI.getCurrentLevel();
                level.removeEntity(this.entity.name);
            }

            return;
        }

        if (this.health <= 0) {
            this.die();
            return;
        }

        this.flyToPlayer();

    }

    die() {
        this.entity.components.get('animator').playAnimation('death');
        this.isDead = true;
    }

    flyToPlayer() {
        const player = this.engineAPI.getCurrentLevel().getEntity('player');
        const playerPos = player.components.get('transform').position;

        const demonPos = this.entity.components.get('transform').position;

        // Get the direction to the player
        const direction = Vec2.sub(demonPos, Vec2.add(playerPos, new Vec2(50, 65))).normalize(); // Add some offset so it goes to the center of the player
        const angle = Math.atan2(direction.y, direction.x);
        const degrees = MathPlus.radToDeg(angle);

        // Flip the demon sprite if the player is to the right of the demon
        if (playerPos.x < demonPos.x) {
            this.entity.components.get('animator').currentAnimation.isFlipped = false
        } else {
            this.entity.components.get('animator').currentAnimation.isFlipped = true;
        }

        const currentAnimation = this.entity.components.get('animator').currentAnimation;
        this.entity.components.get('transform').rotation = currentAnimation.isFlipped ? -degrees : degrees + 180;

        if (Vec2.sub(demonPos, playerPos).mag < 400 || (Vec2.sub(demonPos, playerPos).mag < 480 && currentAnimation.name === 'attack')){
            if (Vec2.sub(demonPos, playerPos).mag < 250) {
                // Fly in the opposite direction
                this.entity.components.get('rigidbody').rigidBody.velocity = Vec2.scale(direction, -this.speed);
            }

            else {
                this.entity.components.get('rigidbody').rigidBody.velocity = new Vec2(0, 0);
            }



            if (currentAnimation.name !== 'attack') this.entity.components.get('animator').playAnimation('attack');

            if (currentAnimation.frameIndex > 3 || currentAnimation.frameIndex < 3 || performance.now() - this.#lastAttackTime < 200) return; // Attack animation is at frame 3 and prevents multiple attacks in one animation frame


            // Spawn a projectile
            this.#lastAttackTime = performance.now();

            const projectile = new EntityAPI.Entity(this.engineAPI.getAPI('entity'), 'demonsProjectile'+crypto.randomUUID());
            projectile.createComponent({"type": "scripting", "scriptNames": ["Bullet"]});
            projectile.createComponent({"type": "animator"});
            projectile.components.get('animator').createAnimation('idle', "./assets/spriteSheets/flyingDemonAnims/projectile.png", 48, 32, 1, 1);
            projectile.components.get('animator').getAnimation('idle').pivotPoint = {x: -15, y: -16};
            projectile.components.get('animator').getAnimation('idle').flipPoint = {x: -15, y: -16};
            projectile.components.get('animator').playAnimation('idle');

            const rb = new Physics.Rigidbody(new Vec2(demonPos.x, demonPos.y + 30), 0, 5, 0.1, []);
            rb.addCollider(new Physics.CircleCollider(rb, 16, 16, 1, 5)).isTrigger = true;
            rb.velocity = Vec2.scale(direction, 400);
            rb.acceleration = new Vec2(0, 0);

            projectile.createComponent({"type": "rigidbody", "rigidBody": rb});

            rb.onCollisionEnterFunc = (rigidBody, collisionData, otherBody) => {
                if (collisionData.collider1.tags.has('player') || collisionData.collider2.tags.has('player')) {
                    const scriptInstances = this.engineAPI.getCurrentLevel().getEntity('player').components.get('scripting').scripts;
                    scriptInstances.get('Movement').inflictDamage(1);
                    this.engineAPI.getCurrentLevel().removeEntity(projectile.name);
                }

                if (collisionData.collider1.tags.has('ground') || collisionData.collider2.tags.has('ground')) {
                    this.engineAPI.getCurrentLevel().removeEntity(projectile.name);
                }

                
            }

            projectile.components.get('transform').rotation = (Vec2.angle(Vec2.scale(direction, -1))) * 180 / Math.PI;

            this.engineAPI.getCurrentLevel().addEntity(projectile);


            
            return;
        }

        else if (currentAnimation.name !== 'idle') {
            this.entity.components.get('animator').playAnimation('idle');
        }

        this.entity.components.get('rigidbody').rigidBody.velocity = Vec2.scale(direction, this.speed);
    }
   
}




