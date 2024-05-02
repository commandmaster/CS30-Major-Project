import { ModuleAPI } from "./moduleBase";
import { Module } from "./moduleBase";



export class PhysicsAPI extends ModuleAPI {
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}


const Engine = Matter.Engine,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Render = Matter.Render

export class PhysicsModule extends Module {
      //#region Private Fields
      #lastPhysicsUpdate = performance.now();
      #timeStepLimit = 50; //Unit: ms, Prevents spiral of death and a bug when alt tabbing causes dt to be very large and the physics to break
      //#endregion
      
    constructor(engineAPI) {
        super(engineAPI);

        this.matterEngine = Engine.create({gravity: {x: 0, y: 1}});
        this.matterWorld = this.matterEngine.world;
        
        this.debugMode = true;

        this.rigidBodies = [];
    }

    start() {
        
    }

    update(dt) {
        const timeSinceLastUpdate = Math.min(performance.now() - this.#lastPhysicsUpdate, this.#timeStepLimit); // Prevents spiral of death and a bug when alt tabbing causes dt to be very large and the physics to break
        Engine.update(this.matterEngine, timeSinceLastUpdate);
        this.#lastPhysicsUpdate = performance.now();
        

        for (const body of this.rigidBodies){
            body.Update(this.debugMode);
        }
    }



    // called from within the rigidbody component
    addRigidBody(rigidBodyComponent){
        this.rigidBodies.push(rigidBodyComponent);
        Matter.World.add(this.matterWorld, rigidBodyComponent.composite);
    }

    debug(enable=true){
        this.debugMode = enable;
    }

    enableDebug(){
        this.debug(true);
    }

    disableDebug(){
        this.debug(false);
    }

}



class PhysicsBody{
    acceleration = {x: 0, y: 0};
    velocity = {x: 0, y: 0};
    position = {x: 0, y: 0};
    rotation = 0;
    angularVelocity = 0;
    angularAcceleration = 0;
    momentum = 0;
    mass = 0;
    coliders = [];

    constructor(physicsModule, x, y, mass, coliders){
        this.physicsModule = physicsModule;

        this.position.x = x;
        this.position.y = y;
        this.mass = mass;
        this.coliders = coliders;
    }
}


