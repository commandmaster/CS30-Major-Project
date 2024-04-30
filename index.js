const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


class Game{
    constructor(context, canvas, width, height){
        this.ctx = context;
        this.canvas = canvas;

        this.init();
    }

    init(){
        this.moduleLoader = new ModuleLoader();

        // Set the canvas width and height
        this.canvas.width = 800;
        this.canvas.height = 600;

    
        requestAnimationFrame(() => this.update());
    }


    update(){
        this.#render();
    }

    #render(){
        // Clear the canvas by drawing a rectangle over the entire canvas
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
}

class ModuleLoader{
    constructor(){
        this.loadModules();
    }

    async loadModules(){
        const json = await fetch('GameModules/moduleConfig.json').then(response => response.json());
        console.log(json);
    }
}


const game = new Game(ctx, canvas);
