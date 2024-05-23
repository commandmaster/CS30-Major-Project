import * as Physics from '../public/SharedCode/physicsEngine.mjs'



export class PhysicsModule {
    constructor(engine){
        this.engine = engine;
        this.physicsEngine = new Physics.PhysicsEngine();
    }

    start(){
        
    }

    update(dt){
        this.physicsEngine.stepSimulation(dt);
    }

    createRigidBody({position, rotation, mass, bounce, colliders}){
        const rb = new Physics.Rigidbody(position, rotation, mass, bounce, colliders);
        this.physicsEngine.addRigidbody(rb);
        return rb;
    }
}