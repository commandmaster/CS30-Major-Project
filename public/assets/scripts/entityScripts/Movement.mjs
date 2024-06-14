import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs"; 
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";
import { RenderAPI } from "../../../FrontendModules/renderModule.mjs";
const Physics = ScriptingAPI.Physics;


export default class Movement extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
        this.canPlayerJump = true;
        this.maxHealth = 100;
        this.health = this.maxHealth;

        const inputAPI = this.engineAPI.getAPI("input");
        const inputModule = this.engineAPI.getModule("input");

        /////////////////////////////
        /// TESTING ONLY ///////////
        /////////////////////////////

        inputModule.addKeyboardInput("teleport", "bool").addKeybind("t");

        /////////////////////////////  
        /////////////////////////////
        /////////////////////////////

        inputModule.addKeyboardInput("horizontal", "axis").addKeybind("a", -1).addKeybind("d", 1);
        inputModule.addKeyboardInput("jump", "bool").addKeybind(" ").addKeybind("ArrowUp");

        const rigidBody = this.entity.getComponent("rigidbody").rigidBody;
        rigidBody.acceleration = new Physics.Vec2(0, 2600); // Gravity
        rigidBody.linearDrag = 0.15;
        rigidBody.ignoreVerticalDrag = true;

        const groundCheckCollider = new Physics.CircleCollider(rigidBody, 70, 200, 0.000001, 30);
        groundCheckCollider.isTrigger = true;
    
        groundCheckCollider.tags.add('groundCheck');
        rigidBody.addCollider(groundCheckCollider);

        // This code is to prevent a momentum build up bug where the player will glitch through the ground
        rigidBody.onCollisionEnterFunc = (rigidBody, collisionData, otherBody) => {
            const cData = collisionData;
            if (cData.collider1.tags.has('ground') || cData.collider2.tags.has('ground')){
                // check if the y position of the player is decreasing or staying the same relatively the same
                // If it is, then the player might be accelerating into the ground and we should stop the player from moving
                // Eventually the player will phase through the ground
                const yPositions = this.previousYPositions;
                let yMin = yPositions[0];
                let yMax = yPositions[0];

                for (let i = 1; i < yPositions.length; i++){
                    if (yPositions[i] < yMin){
                        yMin = yPositions[i];
                    }

                    if (yPositions[i] > yMax){
                        yMax = yPositions[i];
                    }
                }

                if (yMax - yMin < 3 && rigidBody.velocity.y > 5){
                    rigidBody.velocity.y = 0;
                }

            }
        }


        this.isInDevMode = false;

        this.previousYPositions = [];
    }

    Update(dt) {
        this.health += 0.005; // Regeneration
        this.health = MathPlus.clamp(this.health, 0, this.maxHealth);

        if (this.health <= 0){
            this.health = 0;
            this.engineAPI.getCurrentLevel().levelManager.initiateGameOver();
        }

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
 
        const maxSpeed = 1150;
        const acceleration = 200;
        const jumpForce = 1350;
    
        this.entity.getComponent("rigidbody").rigidBody.applyImpulse(new Physics.Vec2(inputAPI.getKeyboardInput("horizontal") * acceleration, 0));
        this.entity.getComponent("rigidbody").rigidBody.velocity.x = MathPlus.clamp(this.entity.getComponent("rigidbody").rigidBody.velocity.x, -maxSpeed, maxSpeed);

        const currentCollisions = rb.currentCollisions; // Get the current collisions set

        this.canPlayerJump = false;
        for (let collision of currentCollisions){
            const cData = collision.collisionData;
            if ((cData.collider1.tags.has('groundCheck') || cData.collider2.tags.has('groundCheck')) && (cData.collider1.tags.has('ground') || cData.collider2.tags.has('ground'))){
                this.canPlayerJump = true;
            }
        }

        if (inputAPI.getInputDown("jump") && this.canPlayerJump){
            this.canPlayerJump = false;
            rb.velocity.y = 0;
            rb.applyImpulse(new Physics.Vec2(0, -jumpForce));
        }
        

        const camera = this.engineAPI.getAPI("render").getCamera();
        const mousePos = inputAPI.getMousePosition();
        const worldPos = camera.screenToWorld(mousePos.x, mousePos.y);

        // Create health bar
        const renderAPI = this.engineAPI.getAPI("render");
        const renderFunc = (canvas, ctx) => {
            ctx.beginPath();
            ctx.fillStyle = `rgb(${MathPlus.mapRange(this.health, this.maxHealth, 0, 0, 255)}, ${MathPlus.mapRange(this.health, this.maxHealth, 0, 255, 0)}, 0)`;

            // Hug right side of screen 

            // Round the corners of the health bar
            ctx.roundRect(canvas.width - 200 * this.health/this.maxHealth, 0, 200 * this.health/this.maxHealth, 20, 4);
            
            ctx.fill();
            ctx.closePath();
        }

        const task = new RenderAPI.RenderTask(renderFunc);
        renderAPI.addTask(task, true);


        /////////////////////////////
        /// TESTING ONLY ///////////
        /////////////////////////////


        if (inputAPI.getInputDown("teleport") && this.isInDevMode){
            rb.position = new Physics.Vec2(worldPos.x, worldPos.y);
            rb.velocity = new Physics.Vec2(0, 0);
            this.entity.getComponent("transform").position = rb.position;
        }

        this.previousYPositions.push(rb.position.y);
        if (this.previousYPositions.length > 10){
            this.previousYPositions.shift();
        }


        
        window.addEventListener('enableDevMode', () => {
            this.isInDevMode = true; 
            this.entity.components.get('animator').hide(); // Hide the player animation
        });

        window.addEventListener('disableDevMode', () => {
            this.isInDevMode = false;
            this.entity.components.get('animator').show(); // Show the player animation
        });

        if (!this.isInDevMode) {
            camera.x = this.entity.getComponent("rigidbody").rigidBody.position.x;
            camera.y = this.entity.getComponent("rigidbody").rigidBody.position.y;
        }
        

        /////////////////////////////
        /////////////////////////////
        /////////////////////////////
    }

    inflictDamage(damage){
        this.health -= damage;
    }
}

