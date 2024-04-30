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
        this.moduleClasses = [];
        this.moduleInstances = [];
        this.loadModules();
    }

    async loadModules(){
        const json = await fetch('GameModules/moduleConfig.json').then(response => response.json());
        console.log(json);

        for(const module of json.modules){
            await this.loadModule(module);
        }

        console.log(this.moduleClasses);
    }

    async loadModule(module){
        const path = './GameModules' + module.path;
        
        const moduleClass = await import(path);
        
        if (module.exportType === "default"){
            this.moduleClasses.push(moduleClass.default);
            this.moduleInstances.push(new moduleClass.default());
        }

    }
}


const game = new Game(ctx, canvas);
