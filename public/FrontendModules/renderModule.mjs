import { ModuleAPI, Module } from "./moduleBase.mjs";
import { Component } from "./moduleBase.mjs";

class Camera{
    #targetEntity;
    #baseResolution;
    constructor(renderAPI){
        this.x = 0;
        this.y = 0;

        this.renderAPI = renderAPI;

        this.ctx = renderAPI.ctx;
        this.canvas = renderAPI.canvas;
        this.#baseResolution = renderAPI.baseResolution; // The resolution the game was designed for

        this.scale = 1;

        this.frameOfView = this.#baseResolution // The frame of view of the camera

        this.#targetEntity = null;
    }

    #update(){
        // set orgin to the center of the canvas
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);

        
        const minScale = Math.min(this.canvas.width / this.#baseResolution.width, this.canvas.height / this.#baseResolution.height); // The minimum scale to fit the game in the screen
        this.scale = minScale;
        this.ctx.scale(minScale, minScale);

        this.frameOfView = {width: this.canvas.width / minScale, height: this.canvas.height / minScale}; // The frame of view of the camera

        this.ctx.translate(-this.x, -this.y); // Translate the camera to the position of the camera
    }

    

    cameraStart(){
        
        this.ctx.save();
        this.#update();
    }

    cameraEnd(){
        this.ctx.restore();
    }


    screenToWorld(x, y){
        const minScale = Math.min(this.canvas.width / this.#baseResolution.width, this.canvas.height / this.#baseResolution.height); // The minimum scale to fit the game in the screen
        this.scale = minScale;

        const x2 = x / minScale + this.x - this.canvas.width / 2 / minScale; // Convert the screen position to world position
        const y2 = y / minScale + this.y - this.canvas.height / 2 / minScale; // Convert the screen position to world position
        return {x: x2, y: y2};
        
    }
}

class AnimatorComponent extends Component{
    #isHidden = false;

    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);

        this.animations = {};
        this.currentAnimation = null;
    }

    createAnimation(name, spriteSheetPath, frameWidth, frameHeight, frameCount, frameRate){
        this.animations[name] = new Animation(spriteSheetPath, frameWidth, frameHeight, frameCount, frameRate); // Create a new animation
        this.animations[name].name = name;  
        return this.animations[name];
    }

    hide(){
        this.#isHidden = true;
    }

    show(){
        this.#isHidden = false;
    }

    playAnimation(animation){
        // Check if the animation exists
        if (this.animations[animation] === undefined) throw new Error(`Animation ${animation} does not exist`);

        this.currentAnimation = this.animations[animation];
        this.currentAnimation.frameIndex = 0;
    }

    getAnimation(name){
        return this.animations[name]; // Get the animation by name
    }

    render(x, y, angle = 0){    
        if (this.#isHidden) return;

        const renderFunc = (canvas, ctx) => {
            if (this.currentAnimation !== null) this.currentAnimation.render(ctx, x, y, angle); // Render the current animation
        }

        const renderTask = new RenderTask(renderFunc);
        this.engineAPI.getAPI('render').addTask(renderTask);
    }

    update(dt){
        const transform = this.entity.components.get('transform');
        this.render(transform.position.x, transform.position.y, transform.rotation); // Render the animation at the position of the entity
    }

}

class Animation{
    scale = 1; // scale of the animation
    isFlipped = false; // flip the animation
    pivotPoint = {x: 0, y: 0}; // pivot point of the animation
    flipPoint = {x: 0, y: 0}; // point to flip the animation
    offset = {x: 0, y: 0}; // offset of the animation

    #lastFrameUpdate;
    constructor(spriteSheetPath, frameWidth, frameHeight, frameCount, frameRate){
        this.spriteSheet = new Image();
        this.spriteSheet.src = spriteSheetPath;

        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;

        this.frameCount = frameCount;
        this.frameRate = frameRate;

        this.#lastFrameUpdate = performance.now();
        this.frameIndex = 0;

    }

    render(ctx, x, y, angle = 0){
        // Use the ctx and it's matrix to render the animation using transformations to rotate, scale, and translate the animation
        const now = performance.now();
        if(now - this.#lastFrameUpdate > 1000 / this.frameRate){
            this.frameIndex = (this.frameIndex + 1) % this.frameCount;
            this.#lastFrameUpdate = now;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.translate(this.offset.x, this.offset.y);

        ctx.translate(-this.flipPoint.x, -this.flipPoint.y); // Translate the flip point
   
        if (this.isFlipped){
            ctx.scale(-1, 1);
        }

        ctx.translate(this.flipPoint.x, this.flipPoint.y)

        ctx.translate(-this.pivotPoint.x, -this.pivotPoint.y); // Translate the pivot point


        ctx.rotate(angle * Math.PI / 180);
        ctx.translate(this.pivotPoint.x, this.pivotPoint.y); // Translate the pivot point


        ctx.scale(this.scale, this.scale);

        // Draw the image by taking the frame index and multiplying it by the frame width to get the x position of the frame which is a segment of the sprite sheet
        ctx.drawImage(this.spriteSheet, this.frameIndex * this.frameWidth, 0, this.frameWidth, this.frameHeight, 0, 0, this.frameWidth, this.frameHeight);

        ctx.restore();


        // Draw the flip point and pivot point
        // Do it after the image is drawn so it is on top
        const shoudlDrawPoints = false;
        if (!shoudlDrawPoints) return;

        // Draw the flip point and pivot point
        ctx.save();
        ctx.translate(x, y);
        ctx.translate(this.offset.x, this.offset.y);
        ctx.translate(-this.flipPoint.x, -this.flipPoint.y);
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 5, 5);
        ctx.translate(this.flipPoint.x, this.flipPoint.y);
        ctx.translate(-this.pivotPoint.x, -this.pivotPoint.y);
        ctx.fillStyle = 'blue';
        ctx.fillRect(0, 0, 5, 5);
        ctx.translate(this.pivotPoint.x, this.pivotPoint.y);
        ctx.restore();

    }
}

class SpriteRendererComponent extends Component{
    /**
     * 
     * @param {Entity} entity The entity this component is attached to
     * @param {Module} parentModule The module this component is attached to
     * @param {EngineAPI} engineAPI The engine API
     * @param {Object} componentConfig The configuration of the component
     * @param {String} componentConfig.texturePath The path to the texture
     * @param {Number} componentConfig.width The width of the tile
     * @param {Number} componentConfig.height The height of the tile
     * @param {Object} componentConfig.positionOffset The offset of the position
     * @param {Number} componentConfig.positionOffset.x The x offset
    */
    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);
        this.tileTexture = null;
        this.isLoaded = false;

        this.width = 0;
        this.height = 0;
        this.height = 0;
        this.positionOffset = {x: 0, y: 0};
        this.angleOffset = 0;
        this.scale = 1;
    }

    /**
     * 
     * @param {String} texturePath The path to the texture
     * @param {Number} width The width of the tile
     * @param {Number} height The height of the tile
     * @param {Object} postitionOffset The offset of the position
     * @param {Number} postitionOffset.x The x offset
     * @param {Number} postitionOffset.y The y offset
     * @param {Number} angleOffset The angle offset
     * @param {Number} scale The scale of the tile
    */
    setTileRender(texturePath, width, height, postitionOffset = {x: 0, y: 0}, angleOffset = 0, scale = 1){
        this.tileTexture = new Image();
        this.tileTexture.src = texturePath;
        this.isLoaded = false;

        this.tileTexture.onload = () => {
            this.isLoaded = true;
        }
    
        this.width = width; // Set the width of the tile
        this.height = height; // Set the height of the tile
        this.positionOffset = postitionOffset; // Set the position offset
        this.angleOffset = angleOffset; // Set the angle offset
        this.scale = scale; // Set the scale
    }

    render(x, y, angle = 0){
        if (this.tileTexture === null) return;
        if (!this.isLoaded) return;

        const renderFunc = (canvas, ctx) => {
            // Use the ctx and it's matrix to render the tile using transformations to rotate, scale, and translate the tile
            ctx.save();
            ctx.translate(x, y);
            ctx.translate(this.positionOffset.x, this.positionOffset.y);
            ctx.rotate(angle + this.angleOffset * Math.PI / 180);
            ctx.translate(-this.width / 2, -this.height / 2);
            ctx.scale(this.scale, this.scale);
            ctx.drawImage(this.tileTexture, 0, 0, this.width, this.height);
        }

        const renderTask = new RenderTask(renderFunc);
        this.engineAPI.getAPI('render').addTask(renderTask);
    }

    update(dt){
        const transform = this.entity.components.get('transform');
        this.render(transform.position.x, transform.position.y, transform.rotation);
    }
}

class RenderTask{
    constructor(renderingFunction){
        this.renderingFunction = renderingFunction;
    }

    render(canvas, ctx){
        ctx.save();
        this.renderingFunction(canvas, ctx);
        ctx.restore();
    }
}

export class RenderAPI extends ModuleAPI {
    static Camera = Camera;
    static AnimatorComponent = AnimatorComponent;
    static SpriteRendererComponent = SpriteRendererComponent;
    static RenderTask = RenderTask;

    permenantRenderTaskIdentifiers = new Map();
    baseResolution = {width: 1920, height: 1080};
    constructor(engineAPI) {
        super(engineAPI);
    }

    /**
     * 
     * @param {RenderTask} renderTask The render task to add
     * @param {Boolean} ignoreCamera Whether to ignore the camera or not
     * @returns {void}
     */
    addTask(renderTask, ignoreCamera = false){
        renderTask.ignoreCamera = ignoreCamera;
        const module = super.getModule('render');
        module.renderTasks.push(renderTask);
    }

    /**
     * 
     * @param {RenderTask} renderTask The render task to add
     * @param {String} identifier The identifier of the render task
     * @returns {void}
     */
    addPermenantTask(renderTask, identifier){
        const module = super.getModule('render');
        module.permenantRenderTasks.push(renderTask);

        this.permenantRenderTaskIdentifiers.set(identifier, renderTask);
    }

    /**
     * 
     * @param {String} identifier The identifier of the render task, a key in a map
     * @returns {void}
    */
    removePermenantTask(identifier){
        const module = super.getModule('render');
        const task = this.permenantRenderTaskIdentifiers.get(identifier);
        const index = module.permenantRenderTasks.indexOf(task);
        module.permenantRenderTasks.splice(index, 1);
        this.permenantRenderTaskIdentifiers.delete(identifier);
    }

    /**
     * 
     * @returns {Camera} The camera
    */
    getCamera(){
        const module = super.getModule('render');
        return module.camera;
    }
}

export class RenderModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
        this.ctx = engineAPI.ctx;
        this.canvas = engineAPI.canvas;
        this.renderAPI = engineAPI.getAPI('render');
        this.renderTasks = [];
        this.permenantRenderTasks = [];
    }

    preload(){
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera = new Camera(this.renderAPI);

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCanvasPosition = {x: 0, y: 0};
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
        this.#resizeCanvas();

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.camera.cameraStart();

        // Draw the offscreen canvas to the main canvas, this is used to improve performance of non updating elements
        this.ctx.drawImage(this.offscreenCanvas, this.offscreenCanvasPosition.x, this.offscreenCanvasPosition.y);

        for(const renderTask of this.renderTasks){
            if (typeof renderTask.render !== 'function' || typeof renderTask.render === 'undefined' || renderTask.render === null) throw new Error("Render task is not valid.");
            if (renderTask.ignoreCamera) this.camera.cameraEnd();

            // Render the task
            renderTask.render(this.canvas, this.ctx);

            if (renderTask.ignoreCamera) this.camera.cameraStart();
        }

        for(const renderTask of this.permenantRenderTasks){
            if (typeof renderTask.render !== 'function' || typeof renderTask.render === 'undefined' || renderTask.render === null) throw new Error("Render task is not valid.");

            // Render the task
            renderTask.render(this.canvas, this.ctx);
        }

        this.camera.cameraEnd();
        this.renderTasks = [];

        
    } 

    #resizeCanvas(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
}