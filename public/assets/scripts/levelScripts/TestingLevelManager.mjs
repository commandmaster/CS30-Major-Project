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
    }

    Update(dt) {
        if (!this.started) {
            const inputAPI = this.engineAPI.getAPI('input');
            if (inputAPI.getInputDown('start')) {
                this.started = true;
                this.startLevel();
            }

            // // Create Start Screen
            const renderAPI = this.engineAPI.getAPI('render');
            const camera = renderAPI.getCamera();
            const fov = camera.frameOfView;

            const renderFunc = (canvas, ctx) => {

                ctx.fillStyle = "black";
                ctx.fillRect(-fov.width/2 , -fov.height/2, fov.width, fov.height);

                ctx.fillStyle = `rgb(${Math.sin(performance.now()/600)*70 + 180}, 0, ${Math.sin(performance.now()/600)*255}, ${Math.random() + 0.8})`;
                ctx.font = "80px Monospace";
                ctx.textAlign = "center";
                ctx.fillText("Tower Jump", 0, Math.sin(performance.now()/600)*80 - 200);

                ctx.font = "42px Monospace";
                ctx.fillText("Press Space to Start", 0, Math.sin(performance.now()/600)*30 + 100);


            }
            const renderTask = new RenderAPI.RenderTask(renderFunc);
            renderAPI.addTask(renderTask);
        }

        else {
            this.levelUpdate(dt);
        }

    }


    End() {
        
    }

    levelUpdate(dt) {

    }


    startLevel() {
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


       
        
        // Enemy Logic
        const demon1 = new EntityAPI.Entity(entityAPI, 'demon1');
        demon1.createComponent({"type": "scripting", "scriptNames": ["Demon"]});
        
        this.level.addEntity(demon1);
    }
}



