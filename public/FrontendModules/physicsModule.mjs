import { ModuleAPI, Module } from "./moduleBase.mjs";
import { Component } from "./moduleBase.mjs";

import * as Physics from "../SharedCode/physicsEngine.mjs";
const { Vec2, RectangleCollider, CircleCollider, TriangleCollider, ConvexCollider, Rigidbody, PhysicsEngine } = Physics;



export class TransformComponent extends Component{
    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);
        this.position = componentConfig.position;
        this.rotation = componentConfig.rotation;
    }

    static fromJSON(entity, parentModule, engineAPI, jsonObject){
        return new TransformComponent(entity, parentModule, engineAPI, jsonObject);
    }
}



export class RigidbodyComponent extends Component{
    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);

        this.rigidBody = componentConfig.rigidBody;
        
        const physicsEngine = this.parentModule.physicsEngine;
        physicsEngine.addRigidbody(this.rigidBody);

        

        const transformComponent = entity.getComponent('transform');
        if (transformComponent !== undefined && transformComponent !== null && transformComponent instanceof TransformComponent){
            transformComponent.position = this.rigidBody.position;
            transformComponent.rotation = this.rigidBody.rotation;
        }
        else {
            throw new Error(`
            The Rigidbody Component requires a 'TransformComponent' to be attached to the entity.
            This should not happen, check the entity creation code.`);
        }
    }

    update(){
        
    }

    end(){
        const physicsEngine = this.parentModule.physicsEngine;
        physicsEngine.deleteRigidbody(this.rigidBody);
    }

    static fromJSON(entity, moduleAPI, jsonObject){
        const rigidBody = new Rigidbody(new Vec2(jsonObject.rigidBody.position.x, jsonObject.rigidBody.position.y), jsonObject.rigidBody.rotation, jsonObject.rigidBody.mass, jsonObject.rigidBody.restitution, jsonObject.rigidBody.colliders);
        for (const colliderData of jsonObject.rigidBody.colliders){
            rigidBody.addCollider(createCollider(colliderData));
        }

        // Create the collider objects
        function createCollider(colliderData){
            switch(colliderData.type){
                case 'circle':
                    return new CircleCollider(rigidBody, colliderData.position.x, colliderData.position.y, colliderData.restitution, colliderData.radius);
                case 'rectangle':
                    return new RectangleCollider(rigidBody, colliderData.position.x, colliderData.position.y, colliderData.restitution, colliderData.width, colliderData.height);
                case 'triangle':
                    return new TriangleCollider(rigidBody, colliderData.position.x, colliderData.position.y, colliderData.restitution, colliderData.width, colliderData.height);
                case 'convex':
                    return new ConvexCollider(rigidBody, colliderData.position.x, colliderData.position.y, colliderData.restitution, colliderData.vertices);
            }
        }

        return new RigidbodyComponent(entity, moduleAPI, {rigidBody});
    } 
}








export class PhysicsAPI extends ModuleAPI {
    static Physics = Physics;
    static TransformComponent = TransformComponent;
    static RigidbodyComponent = RigidbodyComponent;

    constructor(engineAPI, module) {
        super(engineAPI, module); 
    }
}




export class PhysicsModule extends Module{
    #timeStepLimit = 20; // Maximum time step to prevent spiral of death (ms) 
    constructor(engineAPI){
        super(engineAPI);
        this.physicsAPI = engineAPI.getAPI('physics');

        this.physicsEngine = new PhysicsEngine(this.#timeStepLimit); 
    }

    preload(){
        
    }

    start(){
        this.shouldDebugDraw = false;

        window.addEventListener('enableDevMode', () => {
            // Enable debug draw - this event is triggered by the running devMode() in the chrome console
            this.shouldDebugDraw = true;
        });

        window.addEventListener('disableDevMode', () => {
            // Disable debug draw - this event is triggered by the running devMode() in the chrome console
            this.shouldDebugDraw = false;
        });

    }

    update(dt){
        this.physicsEngine.stepSimulation(dt);
        if (this.shouldDebugDraw){
            this.debugDraw();
        }
    }

    addRigidbody(rigidBody){
        this.physicsEngine.addRigidbody(rigidBody);
    }

    debugDraw(){
        // Draw the bounding boxes of the colliders using the render API

        const debugBoudingBox = false;

        for (const body of this.physicsEngine.rigidBodies){
            for (const collider of body.colliders){

                if (debugBoudingBox){
                    const boundingBox = collider.boundingBox;
                    const renderAPI = this.engineAPI.getAPI('render');
                    const renderFunc = (canvas, ctx) => {
                        ctx.beginPath();
                        ctx.strokeStyle = 'yellow';
                        ctx.rect(boundingBox.position.x, boundingBox.position.y, boundingBox.width, boundingBox.height);
                        ctx.stroke();
                        ctx.closePath();
                    }

                    const task = new renderAPI.constructor.RenderTask(renderFunc);
                    renderAPI.addTask(task);
                }


                if (collider.type === 'circle'){
                    const renderFunc = (canvas, ctx) => {
                        ctx.beginPath();
                        ctx.strokeWidth = 4;
                        ctx.strokeStyle = 'grey';
                        ctx.arc(collider.position.x, collider.position.y, collider.radius, 0, Math.PI * 2);
                        ctx.stroke();
                        ctx.closePath();
                    }

                    const renderAPI = this.engineAPI.getAPI('render');
                    const task = new renderAPI.constructor.RenderTask(renderFunc);
                    renderAPI.addTask(task);
                }

                else if (collider.type === 'convex'){
                    const renderFunc = (canvas, ctx) => {
                        ctx.beginPath();
                        ctx.strokeStyle = 'red';
                        ctx.strokeWidth = 5;
                        ctx.moveTo(collider.vertices[0].x, collider.vertices[0].y);
                        for (let i = 1; i < collider.vertices.length; i++){
                            ctx.lineTo(collider.vertices[i].x, collider.vertices[i].y);
                        }
                        ctx.lineTo(collider.vertices[0].x, collider.vertices[0].y);
                        ctx.stroke();
                        ctx.closePath();
                    }

                    const renderAPI = this.engineAPI.getAPI('render');
                    const task = new renderAPI.constructor.RenderTask(renderFunc);
                    renderAPI.addTask(task);
                }
            }
        }


    }
}