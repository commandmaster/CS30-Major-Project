import { ScriptingAPI } from "../../../frontendModules/scriptingModule.mjs"; 
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";
const Physics = ScriptingAPI.Physics;


export default class Movement extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
        const inputAPI = this.engineAPI.getAPI("input");
        const inputModule = this.engineAPI.getModule("input");

        inputModule.addKeyboardInput("horizontal", "axis").addKeybind("a", -1).addKeybind("d", 1);
        inputModule.addKeyboardInput("jump", "bool").addKeybind(" ").addKeybind("ArrowUp");

        const rigidBody = this.entity.getComponent("rigidbody").rigidBody;
        rigidBody.acceleration = new Physics.Vec2(0, 2600); // Gravity
        rigidBody.linearDrag = 0.1;
        rigidBody.ignoreVerticalDrag = true;
    }

    Update() {
        const inputAPI = this.engineAPI.getAPI("input");
        const rigidbody = this.entity.getComponent("rigidbody");

        const rb = rigidbody.rigidBody;

        if (inputAPI.getKeyboardInput("horizontal") > 0.1){
            const animation = this.entity.components.get("animator").currentAnimation;
            animation.isFlipped = false;
        }

        else if (inputAPI.getKeyboardInput("horizontal") < -0.1){
            const animation = this.entity.components.get("animator").currentAnimation;
            animation.isFlipped = true;
        }
 
        const maxSpeed = 1050;
        const acceleration = 175;
        const jumpForce = 1350;
    
        this.entity.getComponent("rigidbody").rigidBody.applyImpulse(new Physics.Vec2(inputAPI.getKeyboardInput("horizontal") * acceleration, 0));
        this.entity.getComponent("rigidbody").rigidBody.velocity.x = MathPlus.clamp(this.entity.getComponent("rigidbody").rigidBody.velocity.x, -maxSpeed, maxSpeed);

        if (inputAPI.getInputDown("jump")){
            rb.velocity.y = 0;
            rb.applyImpulse(new Physics.Vec2(0, -jumpForce));
        }
        

        const camera = this.engineAPI.getAPI("render").getCamera();

        camera.x = this.entity.getComponent("rigidbody").rigidBody.position.x;
        camera.y = this.entity.getComponent("rigidbody").rigidBody.position.y;
    }
}

