import { ModuleAPI, Module } from "./moduleBase.js";
import { Component } from "./entityModule.js";

import * as Physics from "../SharedCode/physicsEngine.mjs";
const { SAT, Vec2, RectangleCollider, CircleCollider, TriangleCollider, Rigidbody, CollisionSolver, PhysicsEngine } = Physics;












export class PhysicsAPI extends ModuleAPI {
    static SAT =  SAT;
    static Vec2 = Vec2;
    static RectangleCollider = RectangleCollider;
    static CircleCollider = CircleCollider;
    static Rigidbody = Rigidbody;
    static CollisionSolver = CollisionSolver;

    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}




export class PhysicsModule extends Module{
    #timeStepLimit = 50; // Maximum time step to prevent spiral of death (ms) 
    constructor(engineAPI){
        super(engineAPI);
        this.physicsAPI = engineAPI.getAPI('physics');

        this.rigidBodies = [];
        this.currentCollisions = [];
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
        rigidBody2.addCollider(new CircleCollider(rigidBody2, -250, 0, 1, 20));
        rigidBody3.addCollider(new TriangleCollider(rigidBody3, 0, 0, 0, 1, 100, 100));
        rigidBody3.addCollider(new RectangleCollider(rigidBody3, -150, 0, 0, 1, 100, 100));
        


        this.rigidBodies.push(rigidBody1);
        this.rigidBodies.push(rigidBody2);
        this.rigidBodies.push(rigidBody3);

        window.addEventListener('mousedown', (e) => {
            
            const camera = this.engineAPI.getAPI('render').getCamera();
            const worldPos = camera.screenToWorld(e.clientX, e.clientY);
            
            if (e.button === 0) {
                rigidBody2.position = new Vec2(worldPos.x, worldPos.y);
            
                rigidBody2.velocity = new Vec2(-100, 0);
            }

            if (e.button === 1){
                const newRB = new Rigidbody(new Vec2(worldPos.x, worldPos.y), 0, 1, 1, []);
                newRB.addCollider(new CircleCollider(newRB, 0, 0, 1, 20));
                this.rigidBodies.push(newRB);
                
            }
            
        });

        rigidBody1.velocity = new Vec2(100, 0);
        rigidBody3.velocity = new Vec2(0, -100);


        const ground = new Rigidbody(new Vec2(0, 500), 0, Infinity, 1, []);
        ground.addCollider(new RectangleCollider(ground, 0, 0, 0, 1, 2000, 100));
        
        this.rigidBodies.push(ground);
    }

    update(dt){
        dt = Math.min(dt, this.#timeStepLimit / 1000); // Limit the time step to prevent spiral of death
        this.currentCollisions = [];
        
        for (const body of this.rigidBodies){
            body.stepSimulation(dt);
        }


        for (let i = 0; i < this.rigidBodies.length; i++){
            for (let j = i + 1; j < this.rigidBodies.length; j++){
                const body1 = this.rigidBodies[i];
                const body2 = this.rigidBodies[j];

                for (const collider1 of body1.colliders){
                    for (const collider2 of body2.colliders){
                        if (collider1.type === 'circle' && collider2.type === 'convex'){
                            const collisionData = SAT.circleToPoly(collider1, collider2);

                            if (collisionData){
                                this.currentCollisions.push({body1, body2, collider1, collider2, collisionData});

                                body1.onCollisionEnter(collisionData, body2);
                                body2.onCollisionEnter(collisionData, body1);

                                CollisionSolver.resolveCollision(body1, body2, collisionData);

                                body1.onCollisionExit(collisionData, body2);
                                body2.onCollisionExit(collisionData, body1);
                            }
                        }
                        else if (collider1.type === 'convex' && collider2.type === 'circle'){
                            const collisionData = SAT.circleToPoly(collider1, collider2);

                            if (collisionData){
                                this.currentCollisions.push({body1, body2, collider1, collider2, collisionData});

                                body1.onCollisionEnter(collisionData, body2);
                                body2.onCollisionEnter(collisionData, body1);

                                CollisionSolver.resolveCollision(body1, body2, collisionData);

                                body1.onCollisionExit(collisionData, body2);
                                body2.onCollisionExit(collisionData, body1);
                            }
                        }
                        else if (collider1.type === 'convex' && collider2.type === 'convex'){
                            const collisionData = SAT.checkPolyToPoly(collider1, collider2);

                            if (collisionData){
                                this.currentCollisions.push({body1, body2, collider1, collider2, collisionData});

                                body1.onCollisionEnter(collisionData, body2);
                                body2.onCollisionEnter(collisionData, body1);

                                CollisionSolver.resolveCollision(body1, body2, collisionData);

                                body1.onCollisionExit(collisionData, body2);
                                body2.onCollisionExit(collisionData, body1);
                            }
                        }
                        else if (collider1.type === 'circle' && collider2.type === 'circle'){
                            const collisionData = SAT.circleToCircle(collider1, collider2);

                            if (collisionData){
                                this.currentCollisions.push({body1, body2, collider1, collider2, collisionData});

                                body1.onCollisionEnter(collisionData, body2);
                                body2.onCollisionEnter(collisionData, body1);

                                CollisionSolver.resolveCollision(body1, body2, collisionData);

                                body1.onCollisionExit(collisionData, body2);
                                body2.onCollisionExit(collisionData, body1);
                            }
                        }

                        
                    }
                }
               
            }
        }


        this.debugDraw();
    }

    debugDraw(){
        for (const body of this.rigidBodies){
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