export default class GameManager {
    constructor(engineAPI) {
        this.engineAPI = engineAPI;
        this.ctx = engineAPI.ctx;
        this.canvas = engineAPI.canvas;
        this.engine = engineAPI.engine;
    }

    async Preload(){
        return new Promise(async (resolve, reject) => {
            resolve();
        });
    }

    Start(){

    }

    Update(dt){

    }
}