import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.js";

export default class Movement extends ScriptingAPI.Monobehavior {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
        console.log("Movement Start() called!");
        console.log(this.engineAPI);
        console.log(this.entity);    
    }

    Update() {
        
    }
}

