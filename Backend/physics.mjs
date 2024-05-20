import * as Physics from '../public/SharedCode/physicsEngine.mjs'


export class PhysicsModule {
    constructor(engine){
        this.engine = engine;
        this.physicsEngine = new Physics.PhysicsEngine();
    }

    update(){
        const dt = this.engine.dt;
        this.physicsEngine.stepSimulation(dt);
    }
}