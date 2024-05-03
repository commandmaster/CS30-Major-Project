import { ModuleAPI, Module } from "./moduleBase.js";
import { Component } from "./entityModule.js";

const Engine = Matter.Engine,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Render = Matter.Render

class TransformComponent extends Component{
    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);

        this.position = componentConfig.position;
        this.rotation = componentConfig.rotation;
        this.scale = componentConfig.scale;
    }
}

class RigidbodyComponent extends Component{
    acceleration = {x: 0, y: 0};
    velocity = {x: 0, y: 0};
    position = {x: 0, y: 0};
    rotation = 0;
    angularVelocity = 0;
    angularAcceleration = 0;
    mass = 0;
    coliders = [];

    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);
        this.position = componentConfig.position;
        this.rotation = componentConfig.rotation;
        this.mass = componentConfig.mass;
        
        this.colliders = this.#generateColliders(componentConfig.colliders);
        
    }

    #generateColliders(colliders){
        return colliders.map(collider => {
            switch(collider.type){
                case 'rectangle':
                    return Bodies.rectangle(collider.x, collider.y, collider.width, collider.height);
                case 'circle':
                    return Bodies.circle(collider.x, collider.y, collider.radius);
            }
        });
    }
}



export class PhysicsAPI extends ModuleAPI {
    static RigidbodyComponent = RigidbodyComponent;

    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}


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

