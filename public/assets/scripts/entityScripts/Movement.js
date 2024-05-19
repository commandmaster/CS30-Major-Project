import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.js";


export default class Movement extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
        console.log(this.entity)
    }

    Update() {
       
    }
}

