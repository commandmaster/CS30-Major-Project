import { ModuleAPI, Module } from "./moduleBase.js";
import { Component } from "./entityModule.js";

import engineLoader from "./physicsEngine.mjs"; // Weird import syntax because of the .mjs extension


class TransformComponent extends Component{
    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);

        this.position = componentConfig.position;
        this.rotation = componentConfig.rotation;
        this.scale = componentConfig.scale;
    }
}

class RigidbodyComponent extends Component{
    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);
        this.position = componentConfig.position;
        this.rotation = componentConfig.rotation;
        this.mass = componentConfig.mass;
        
        this.colliders = this.#generateColliders(componentConfig.colliders);
        
    }

    #generateColliders(colliders){
        
    }
}







export class PhysicsAPI extends ModuleAPI {
    static RigidbodyComponent = RigidbodyComponent;
    static TransformComponent = TransformComponent;


    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}



export class PhysicsModule extends Module{
    constructor(engineAPI){
        super(engineAPI);
        this.physicsAPI = engineAPI.getAPI('physics');

        const maxTimeStep = 50;


        this.physicsEngine = engineLoader(maxTimeStep).engine // create a new physics engine with a max timestep of 50ms
        this.physicsEngineClass = this.physicsEngine.constructor;

        this.Vec2 = this.physicsEngineClass.Vec2;

    }

    preload(){
        
    }

    start(){
        console.log("Physics module started");
        const r1 = new this.physicsEngineClass.Rigidbody(new this.Vec2(0, 0), 0, 1);
        const c1 = new this.physicsEngineClass.CircleCollider(r1, 0, 0, 10, 10);
        r1.addCollider(c1);
        this.addRigidbody(r1);

        const ground = new this.physicsEngineClass.Rigidbody(new this.Vec2(0, 500), 0, Infinity, 1, []);
        const groundCollider = new this.physicsEngineClass.RectangleCollider(ground, 0, 0, 0, 1, 2000, 200);
        
        ground.addCollider(groundCollider);
        this.addRigidbody(ground);

        window.addEventListener('mousedown', (e) => {
            
            const camera = this.engineAPI.getAPI('render').getCamera();
            const worldPos = camera.screenToWorld(e.clientX, e.clientY);
            
            if (e.button === 0) {
                const r1 = new this.physicsEngineClass.Rigidbody(new this.Vec2(worldPos.x, worldPos.y), 0, 1);
                const c1 = new this.physicsEngineClass.CircleCollider(r1, 0, 0, 10, 10);
                r1.addCollider(c1);
                this.addRigidbody(r1);
            }

            if (e.button === 1){
                
            
            }
            
        });

    
    }

    addRigidbody(rigidBody){
        this.physicsEngine.addRigidbody(rigidBody);
    }

    update(dt){
        this.physicsEngine.stepSim(dt);
        this.debugDraw();
    }

    debugDraw(){
        const renderAPI = this.engineAPI.getAPI('render');
        const renderFunc = (canvas, ctx) => {
            for (const body of this.physicsEngine.rigidBodies){
                for (const collider of body.colliders){
                    if (collider.type === 'circle'){
                        ctx.beginPath();
                        ctx.arc(collider.position.x, collider.position.y, collider.radius, 0, 2 * Math.PI);
                        ctx.stroke();
                    }

                    if (collider.type === 'convex'){
                        ctx.beginPath();
                        ctx.moveTo(collider.vertices[0].x, collider.vertices[0].y);
                        for (let i = 1; i < collider.vertices.length; i++){
                            ctx.lineTo(collider.vertices[i].x, collider.vertices[i].y);
                        }
                        ctx.lineTo(collider.vertices[0].x, collider.vertices[0].y);
                        ctx.stroke();
                    }
                }
            }
        }
        const task = new renderAPI.constructor.RenderTask(renderFunc); // Create a new render task
        renderAPI.addTask(task); // Add the render task to the render module
        
    }
}