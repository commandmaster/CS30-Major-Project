import { ModuleAPI, Module } from "./moduleBase.js";
import { Component } from "./moduleBase.js";

import * as Physics from "../SharedCode/physicsEngine.mjs";
const { Vec2, RectangleCollider, CircleCollider, TriangleCollider, Rigidbody, PhysicsEngine } = Physics;


console.log(Component)

export class TransformComponent extends Component{
    constructor(entity, moduleAPI, {position, rotation}){
        super(entity, moduleAPI, {});
        this.position = position;
        this.rotation = rotation;
    }

    static fromJSON(entity, moduleAPI, jsonObject){
        return new TransformComponent(entity, moduleAPI, {position: new Vec2(jsonObject.position.x, jsonObject.position.y), rotation: jsonObject.rotation});
    }
}



export class PhysicsComponent extends Component{
    constructor(entity, moduleAPI, {rigidBody, collider}){
        super(entity, moduleAPI, {});
        this.rigidBody = rigidBody;
        this.collider = collider;
    }

    static fromJSON(entity, moduleAPI, jsonObject){
        const rigidBody = new Rigidbody(new Vec2(jsonObject.rigidBody.position.x, jsonObject.rigidBody.position.y), jsonObject.rigidBody.rotation, jsonObject.rigidBody.mass, jsonObject.rigidBody.restitution, jsonObject.rigidBody.colliders);
        const collider = new CircleCollider(rigidBody, jsonObject.collider.position.x, jsonObject.collider.position.y, jsonObject.collider.restitution, jsonObject.collider.radius);
        return new PhysicsComponent(entity, moduleAPI, {rigidBody, collider});
    }
}








export class PhysicsAPI extends ModuleAPI {
    static Physics = Physics;
    static TransformComponent = TransformComponent;
    static PhysicsComponent = PhysicsComponent;

    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}




export class PhysicsModule extends Module{
    #timeStepLimit = 50; // Maximum time step to prevent spiral of death (ms) 
    constructor(engineAPI){
        super(engineAPI);
        this.physicsAPI = engineAPI.getAPI('physics');

        this.physicsEngine = new PhysicsEngine(this.#timeStepLimit); 
    }

    preload(){
        
    }

    start(){
        // setup test senario
        const rigidBody1 = new Rigidbody(new Vec2(100, 100), 0, 1, 1, []);
        const rigidBody2 = new Rigidbody(new Vec2(300, -100), 0, 1, 1, []);
        const rigidBody3 = new Rigidbody(new Vec2(200, 300), 0, 1, 1, []);


        rigidBody1.addCollider(new RectangleCollider(rigidBody1, 0, 0, 35, 1, 100, 100));
        rigidBody1.addCollider(new CircleCollider(rigidBody1, 50, 0, 1, 20));
        rigidBody2.addCollider(new RectangleCollider(rigidBody2, 0, 0, 0, 1, 100, 100));
        rigidBody2.addCollider(new CircleCollider(rigidBody2, -250, 0, 1, 50));
        rigidBody3.addCollider(new TriangleCollider(rigidBody3, 0, 0, 0, 1, 100, 100));
        rigidBody3.addCollider(new RectangleCollider(rigidBody3, -150, 0, 0, 1, 100, 100));
        


        window.addEventListener('mousedown', (e) => {
            
            const camera = this.engineAPI.getAPI('render').getCamera();
            const worldPos = camera.screenToWorld(e.clientX, e.clientY);
            
            if (e.button === 0) {
                rigidBody2.position = new Vec2(worldPos.x, worldPos.y);
            
                rigidBody2.velocity = new Vec2(-100, 0);
            }

            if (e.button === 1){
                for (let i = 0; i < 100; i++){
                    const newRB = new Rigidbody(new Vec2(worldPos.x + i * 5, worldPos.y + Math.random()*150 - 75), 0, 1, 1, []);
                    newRB.addCollider(new CircleCollider(newRB, 0, 0, 1, 20));
                    this.addRigidbody(newRB);
                }
                
            }
            
        });

        rigidBody1.velocity = new Vec2(100, 0);
        rigidBody3.velocity = new Vec2(0, -100);


        const ground = new Rigidbody(new Vec2(0, 500), 0, Infinity, 1, []);
        ground.addCollider(new RectangleCollider(ground, 0, 0, 0, 1, 2000, 100));

        this.addRigidbody(rigidBody1);
        this.addRigidbody(rigidBody2);
        this.addRigidbody(rigidBody3);
        this.addRigidbody(ground);

    }

    update(dt){
        this.physicsEngine.stepSimulation(dt);
        this.debugDraw();
    }

    addRigidbody(rigidBody){
        this.physicsEngine.addRigidbody(rigidBody);
    }

    debugDraw(){
        for (const body of this.physicsEngine.rigidBodies){
            for (const collider of body.colliders){
                if (collider.type === 'circle'){
                    const renderFunc = (canvas, ctx) => {
                        ctx.beginPath();
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
                        ctx.strokeStyle = 'grey';
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