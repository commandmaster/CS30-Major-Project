const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');


class Game{
    constructor(context, canvas, width, height){
        this.ctx = context;
        this.canvas = canvas;

        this.init();
    }

    init(){
        this.renderer = new Renderer(this.ctx, this.canvas);

        this.player = new Player(this.ctx, this.canvas);
    
        this.update();
    }


    update(){
        this.player.update();

        this.renderer.render([this.player]);
        requestAnimationFrame(() => this.update());
    }
}

class Renderer{
    constructor(context, canvas){
        this.ctx = context;
        this.canvas = canvas;

        this.#init();
    }

    #init(){
        this.camera = new Camera(this.ctx, this.canvas);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    #background(){
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render(objectsToRender){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.ctx.save();
        this.#background();


        this.camera.cameraStart();
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, 100, 100);

        objectsToRender.forEach(obj => obj.render());

        this.camera.cameraEnd();



        this.ctx.restore();
    }
}

class Camera{
    #baseResolution = {width: 1920, height: 1080};
    
    constructor(context, canvas){
        this.x = 0;
        this.y = 0;

        this.ctx = context;
        this.canvas = canvas;
    }

    #update(){
        // set orgin to the center of the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        const minScale = Math.min(canvas.width / this.#baseResolution.width, canvas.height / this.#baseResolution.height);
        ctx.scale(minScale, minScale);

        ctx.translate(-this.x, -this.y);
    }

    cameraStart(){
        this.ctx.save();
        this.#update();
    }

    cameraEnd(){
        this.ctx.restore();
    }


    screenToWorld(x, y){
        const minScale = Math.min(canvas.width / this.#baseResolution.width, canvas.height / this.#baseResolution.height);

        const x2 = x / minScale + this.x;
        const y2 = y / minScale + this.y;
        return {x: x2, y: y2};
        
    }
}


class Player{
    spriteSheetPath = 'assets/spriteSheets/playerAnims.png';

    constructor(context, canvas, ){
        this.ctx = context;
        this.canvas = canvas;

        this.x = 0;
        this.y = 0;

        this.idleAnim = new Animation(this.ctx, this.canvas, this.spriteSheetPath, 132, 192, 8, 20);
        this.controller = new PlayerController(this);
    }

    update(){
        this.controller.update();
    }

    render(){
        this.idleAnim.render(this.x, this.y);
    }

  
}

class Animation{
    #lastFrameUpdate;
    constructor(context, canvas, spriteSheetPath, frameWidth, frameHeight, frameCount, frameRate){
        this.ctx = context;
        this.canvas = canvas;

        this.spriteSheet = new Image();
        this.spriteSheet.src = spriteSheetPath;

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        this.frameCount = frameCount;
        this.frameRate = frameRate;

        this.#lastFrameUpdate = performance.now();
        this.frameIndex = 0;
    }

    render(x, y){
        const now = performance.now();
        if(now - this.#lastFrameUpdate > 1000 / this.frameRate){
            this.frameIndex = (this.frameIndex + 1) % this.frameCount;
            this.#lastFrameUpdate = now;
        }
        
        this.ctx.drawImage(this.spriteSheet, this.frameIndex * this.frameWidth, 0, this.frameWidth, this.frameHeight, x, y, this.frameWidth, this.frameHeight);
    }
}

class PlayerController{
    constructor(player){
        this.player = player;

        this.inputs = {
            up: false,
            down: false,
            left: false,
            right: false
        }

        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'w':
                    this.inputs.up = true;
                    break;
                case 's':
                    this.inputs.down = true;
                    break;
                case 'a':
                    this.inputs.left = true;
                    break;
                case 'd':
                    this.inputs.right = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'w':
                    this.inputs.up = false;
                    break;
                case 's':
                    this.inputs.down = false;
                    break;
                case 'a':
                    this.inputs.left = false;
                    break;
                case 'd':
                    this.inputs.right = false;
                    break;
            }
        });
    }

    update(){
        if(this.inputs.up){
            this.player.y -= 1;
        }
        if(this.inputs.down){
            this.player.y += 1;
        }
        if(this.inputs.left){
            this.player.x -= 1;
        }
        if(this.inputs.right){
            this.player.x += 1;
        }
    }
}

class PhysicsWorld{

}

class PhysicsBody{
    acceleration = {x: 0, y: 0};
    velocity = {x: 0, y: 0};
    position = {x: 0, y: 0};
    rotation = 0;
    angularVelocity = 0;
    angularAcceleration = 0;
    momentum = 0;
    mass = 0;
    coliders = [];


    constructor(physicsWorld, x, y, mass, coliders){
        this.physicsWorld = physicsWorld;

        this.position.x = x;
        this.position.y = y;
        this.mass = mass;
        this.coliders = coliders;
    }
}



const game = new Game(ctx, canvas);
