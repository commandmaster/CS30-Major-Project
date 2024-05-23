import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs";
const Physics = ScriptingAPI.Physics;


export default class Movement extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
        
    }

    Update() {
        const inputAPI = this.engineAPI.getAPI("input");
        const rigidbody = this.entity.getComponent("rigidbody");
    
        this.entity.getComponent("rigidbody").rigidBody.applyImpulse(new Physics.Vec2(inputAPI.getInputDown("horizontal") * 1000, inputAPI.getInputDown("vertical") * 1000));

    }
}

export class Backend{
    constructor(BE_engine){
        this.engine = BE_engine; // the Backend engine ran by the server
    }

    preload(){
         
    }

    start(){
        
    }

    update(){

    }
}