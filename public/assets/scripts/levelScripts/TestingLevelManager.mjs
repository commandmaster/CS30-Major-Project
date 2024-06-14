import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs";
import { EntityAPI } from "../../../FrontendModules/entityModule.mjs";
import { PhysicsAPI } from "../../../FrontendModules/physicsModule.mjs";
import * as Physics from "../../../SharedCode/physicsEngine.mjs";
import { RenderAPI } from "../../../FrontendModules/renderModule.mjs";
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";


export default class TestingLevelManager extends ScriptingAPI.LevelManager {
    constructor(engineAPI, level) {
        super(engineAPI, level);
    }

    Start() {
        this.isDevMode = false;
        window.devMode = () => {
            this.isDevMode = !this.isDevMode;
            if (this.isDevMode){
                const event = new CustomEvent('enableDevMode', {detail: {enabled: true}});
                window.dispatchEvent(event);
                return "DEVELOPER MODE ACTIVATED"
            } else {
                const event = new CustomEvent('disableDevMode', {detail: {enabled: false}});
                window.dispatchEvent(event);
                return "DEVELOPER MODE DEACTIVATED"
            }
        }

        const inputModule = this.engineAPI.getModule('input');
        inputModule.addKeyboardInput("start", "bool").addKeybind(" ");
        this.started = false;

        this.gameOver = false;
    }

    Update(dt) {
        if (this.gameOver) {
            if (this.level.entities.length > 0) this.level.clearEntities();

            const inputAPI = this.engineAPI.getAPI('input');
            if (inputAPI.getInputDown('start')) {
                this.gameOver = false;
                this.started = false;
                this.level.clearEntities();
            }


            this.gameOverScreen();
            return;
        }

        if (!this.started) {
            const inputAPI = this.engineAPI.getAPI('input');
            if (inputAPI.getInputDown('start')) {
                this.started = true;
                this.startLevel();
            }

            // // Create Start Screen
            const renderAPI = this.engineAPI.getAPI('render');
            const camera = renderAPI.getCamera();
  

            const renderFunc = (canvas, ctx) => {

                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.fillStyle = `rgb(${Math.sin(performance.now()/600)*70 + 180}, 0, ${Math.sin(performance.now()/600)*255}, ${Math.random() + 0.8})`;
                ctx.font = "65px Monospace";
                ctx.textAlign = "center";
                ctx.fillText("Tower Jump", canvas.width/2, Math.sin(performance.now()/600)*80 + 200);

                ctx.font = "42px Monospace";
                ctx.fillText("Press Space to Start", canvas.width/2, Math.sin(performance.now()/600)*30 + 500);


            }
            const renderTask = new RenderAPI.RenderTask(renderFunc);
            renderAPI.addTask(renderTask, true);
        }

        else {
            this.levelUpdate(dt);
        }

    }


    End() {
        // Clear demon interval
        clearInterval(this.demonInterval);
    }

    initiateGameOver() {
        this.gameOver = true;
        this.level.end();
    }

    levelUpdate(dt) {
        this.timer += dt;
        this.height = -1 * this.level.getEntity('player').components.get('transform').position.y;
        this.height = Math.max(0, this.height);

        const renderAPI = this.engineAPI.getAPI('render');
      
        const renderFunc = (canvas, ctx) => {
            ctx.fillStyle = "white";
            ctx.font = "24px Monospace";
            ctx.textAlign = "left";
            ctx.fillText(`Height: ${Math.floor(this.height)}`, 0, 20);

            ctx.fillText(`Time: ${this.timer.toFixed(1)}`, 0, 40);

        }

        const renderTask = new RenderAPI.RenderTask(renderFunc);
        renderAPI.addTask(renderTask, true);
    }

    gameOverScreen() {
        const renderAPI = this.engineAPI.getAPI('render');
        const camera = renderAPI.getCamera();
        const fov = camera.frameOfView;

        const renderFunc = (canvas, ctx) => {

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = `rgb(${Math.sin(performance.now()/600)*70 + 180}, 0, ${Math.sin(performance.now()/600)*255}, ${Math.random() + 0.8})`;
            ctx.font = "80px Monospace";
            ctx.textAlign = "center";
            ctx.fillText("Game Over", canvas.width/2, Math.sin(performance.now()/600)*30 + 200);

            ctx.font = "42px Monospace";
            ctx.fillText("Press Space to Restart", canvas.width/2, Math.sin(performance.now()/600)*20 + 350);    

            ctx.font = "24px Monospace";
            ctx.fillText(`Height: ${Math.floor(this.height)}`, canvas.width/2, 550);
            ctx.fillText(`Time: ${this.timer.toFixed(1)}`, canvas.width/2, 600);
        }

        const renderTask = new RenderAPI.RenderTask(renderFunc);
        renderAPI.addTask(renderTask, true);
    }

    startLevel() {
        this.height = 0;
        this.timer = 0;



        const entityAPI = this.engineAPI.getAPI('entity')
        const player = new EntityAPI.Entity(entityAPI, 'player')
       
        const rigidBody = new Physics.Rigidbody(new Physics.Vec2(0, 0), 0, 1, 0.1, [])
        const bodyCollider = new Physics.CircleCollider(rigidBody, 70, 120, 1,70)
        bodyCollider.tags.add('player')
        rigidBody.addCollider(bodyCollider)
        rigidBody.applyImpulse(new Physics.Vec2(0, -1000), 2)

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


        const gameOver = new EntityAPI.Entity(entityAPI, 'gameOver');
        const gameOverRigidBody = new Physics.Rigidbody(new Physics.Vec2(8330, -7725), 0, Infinity, 0.1, []);
        const gameOverCollider = new Physics.CircleCollider(gameOverRigidBody, 0, 0, 1, 50);
        gameOverCollider.isTrigger = true;
        gameOverRigidBody.addCollider(gameOverCollider);
        gameOverRigidBody.onCollisionEnterFunc = (rigidBody, collisionData, otherBody) => {
            if (collisionData.collider1.tags.has('player') || collisionData.collider2.tags.has('player')) {
                this.gameOver = true;
                this.level.clearEntities();
            }
        }

        gameOver.createComponent({"type": "rigidbody", "rigidBody": gameOverRigidBody});
        this.level.addEntity(gameOver);
       
        
        // Enemy Logic

        this.demonInterval = setInterval(() => {
            this.spawnDemon();
        }, 6000);

    }

    spawnDemon() {
        const entityAPI = this.engineAPI.getAPI('entity');
        const demon = new EntityAPI.Entity(entityAPI, `demon${crypto.randomUUID()}}`);
        demon.createComponent({"type": "scripting", "scriptNames": ["Demon"]});
        this.level.addEntity(demon);
    }
}



