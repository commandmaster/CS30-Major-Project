import { ModuleAPI, Module } from "./moduleBase";
import { Component } from "./entityModule";

class Camera{
    #baseResolution;
    constructor(renderAPI){
        this.x = 0;
        this.y = 0;

        this.renderAPI = renderAPI;

        this.ctx = renderAPI.ctx;
        this.canvas = renderAPI.canvas;
        this.#baseResolution = renderAPI.baseResolution;
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

class AnimatorComponent extends Component{
    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);
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

class SpriteRendererComponent extends Component{
    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);
    }
}


export class RenderAPI extends ModuleAPI {
    static Camera = Camera;
    static AnimatorComponent = AnimatorComponent;
    static SpriteRendererComponent = SpriteRendererComponent;

    baseResolution = {width: 1920, height: 1080};
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}

export class RenderModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }

    preload(){
        this.camera = new Camera(this);
    }

    preloadLevel(level){
        
    }   

    setupLevel(level){
        
    }

    endLevel(level){
        
    }

    start(){
        
    }

    update(dt){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.camera.cameraStart();
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, 100, 100);

        this.camera.cameraEnd();
    } 
}