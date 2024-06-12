import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs"; 
import { RenderAPI } from "../../../FrontendModules/renderModule.mjs";
import { InputAPI } from "../../../FrontendModules/inputModule.mjs";
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";
import * as Physics from "../../../SharedCode/physicsEngine.mjs";

class Tile{
    constructor(x, y, textureCoordinate){
        this.x = x;
        this.y = y;
        this.textureCoordinate = textureCoordinate;
    }
}

export default class TileGenerator extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
        const inputModule = this.engineAPI.getModule("input");
        inputModule.addMouseInput("tileEdit").addKeybind(0);

        this.texturesPath = "./assets/textures/tileMap1.png";
        this.tileTexture = new Image();
        this.tileTexture.src = this.texturesPath;

        this.tilesAcross = 32;
        this.tilesDown = 32;

        this.selectionImageScale = 1;

        this.worldSize = {worldXMin: -100, worldXMax: 100, worldYMin: -100, worldYMax: 100};

        this.tileMappingPath = "./assets/textures/tileMap1.json";
        
        this.tileGridSize = 32; // The size of each tile in units (like pixels, you can chose how many pixels each unit is in the camera class)
        this.loadedTiles = [];
        this.loadedCoordinates = new Set();
        this.currentEditorPiece = -1;
        
        // Load the tile map
        fetch(this.tileMappingPath).then(response => response.json()).then(data => {
            this.tileMap = data;

            for (let tile of this.tileMap.tiles){
                this.loadedTiles.push(new Tile(tile.x, tile.y, tile.textureCoordinate));
                this.loadedCoordinates.add(`${tile.x},${tile.y}`);
            }

            this.fillBlankTiles();

            //this.saveTileMapping();
            //console.log(this.loadedTiles);

            this.generateColliders();
        });

    }

    editor(){
        // Create a tile edit mode where you can click on a tile and change its texture coordinate to a different tile visually from the texture
        const inputAPI = this.engineAPI.getAPI("input");
        const inputModule = this.engineAPI.getModule("input");
        const mouseCoords = inputAPI.getMousePosition();
        const mouseToWorld = this.engineAPI.getAPI("render").getCamera().screenToWorld(mouseCoords.x, mouseCoords.y);
        const pressingMouse = inputAPI.getMouseInput("tileEdit");
    
        // Draw the tileMap Image in the top right corner of the screen
        const renderAPI = this.engineAPI.getAPI("render");
        const renderFunc = (canvas, ctx) => {
            const topLeft = {x: 0, y: 0};
            ctx.translate(topLeft.x, topLeft.y);
            ctx.scale(this.selectionImageScale, this.selectionImageScale);
            ctx.drawImage(this.tileTexture, 0, 0, this.tileTexture.width, this.tileTexture.height);
        }
        const renderTask = new RenderAPI.RenderTask(renderFunc);
        renderAPI.addTask(renderTask, true);
       

        // Create the save button
        const saveButton = {x: 0, y: this.tileTexture.width * this.selectionImageScale, width: 70, height: 50};
        const saveRenderFunc = (canvas, ctx) => {
            ctx.fillStyle = "grey";
            ctx.fillRect(saveButton.x, saveButton.y, saveButton.width, saveButton.height);
            ctx.fillStyle = "white";
            ctx.font = "20px Arial";
            ctx.fillText("Save", saveButton.x + 10, saveButton.y + 30);
        }
        const saveRenderTask = new RenderAPI.RenderTask(saveRenderFunc);
        renderAPI.addTask(saveRenderTask, true);
            

        if (inputAPI.getInputDown("tileEdit")){
            if (mouseCoords.x > saveButton.x && mouseCoords.x < saveButton.x + saveButton.width && mouseCoords.y > saveButton.y && mouseCoords.y < saveButton.y + saveButton.height){
                    this.saveTileMapping();
            } 
        }

        if (pressingMouse){
            if (mouseCoords.x < this.tileTexture.width * this.selectionImageScale && mouseCoords.y < this.tileTexture.height * this.selectionImageScale){   
                const imageWidth = this.tileTexture.width * this.selectionImageScale;
                const imageHeight = this.tileTexture.height * this.selectionImageScale;
                const tileWidth = imageWidth / this.tilesAcross;
                const tileHeight = imageHeight / this.tilesDown;

         

                console.log(imageWidth, imageHeight);

                // draw a rectangle around the selected at image width and height
                const renderFunc = (canvas, ctx) => {
                    ctx.strokeStyle = "red";
                    ctx.strokeRect(0, 0, imageWidth, imageHeight);
                }
                const renderTask = new RenderAPI.RenderTask(renderFunc);
                renderAPI.addTask(renderTask, true);

                const x = Math.floor(mouseCoords.x / tileWidth);
                const y = Math.floor(mouseCoords.y / tileHeight);

                console.log(x, y);

                const newTextureCoordinate = y * this.tilesAcross + x;



                this.currentEditorPiece = newTextureCoordinate;

            }

            else{
                const x = Math.floor(mouseToWorld.x / this.tileGridSize);
                const y = Math.floor(mouseToWorld.y / this.tileGridSize);

                const tileExists = this.loadedCoordinates.has(`${x},${y}`);
                if (!tileExists){
                    this.loadedTiles.push(new Tile(x, y, this.currentEditorPiece));
                    this.loadedCoordinates.add(`${x},${y}`);
                }
                else{
                    for (let tile of this.loadedTiles){
                        if (tile.x === x && tile.y === y){
                            tile.textureCoordinate = this.currentEditorPiece;
                        }
                    }
                }
            }

        }


    }

    Update() {
        //this.editor(); 

        this.renderTiles(); 
    }

    renderTiles(){
        for (let tile of this.loadedTiles){
            if (tile.textureCoordinate < 0){
                continue;
            }

            const x = tile.x * this.tileGridSize;
            const y = tile.y * this.tileGridSize;


            // Get take the texture coordinate and convert it to the x and y coordinates of the texture
            const imageTileWidth = Math.ceil(this.tileTexture.width / this.tilesAcross);
            const imageTileHeight = Math.ceil(this.tileTexture.height / this.tilesDown);

            const textureCoordinateToX = (tile.textureCoordinate % this.tilesAcross) * imageTileWidth;
            const textureCoordinateToY = Math.floor(tile.textureCoordinate / this.tilesAcross) * imageTileHeight;


            const renderAPI = this.engineAPI.getAPI("render");
            const renderFunc = (canvas, ctx) => {
                // Draw the tile at the correct position
                
                // Remove the any white space around the tile


                
                ctx.drawImage(this.tileTexture, textureCoordinateToX, textureCoordinateToY, imageTileWidth, imageTileHeight, x, y, this.tileGridSize + 1, this.tileGridSize + 1);
            }

            const renderTask = new RenderAPI.RenderTask(renderFunc);
            renderAPI.addTask(renderTask);
        }
    }


    fillBlankTiles(){
        for (let x = this.worldSize.worldXMin; x < this.worldSize.worldXMax; x += 1){
            for (let y = this.worldSize.worldYMin; y < this.worldSize.worldYMax; y += 1){
                const tileExists = this.loadedCoordinates.has(`${x},${y}`);
            
                if (!tileExists){
                    this.loadedTiles.push(new Tile(x, y, -1));
                }
            }
        }
    }

    saveTileMapping(){
        const tileMap = {
            tiles: []
        }

        for (let tile of this.loadedTiles){
            tileMap.tiles.push({x: tile.x, y: tile.y, textureCoordinate: tile.textureCoordinate});
        }


        const json = JSON.stringify(tileMap);
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.download = 'tileMap.json';
        a.href = url;
        a.click();
    }

    generateColliders(){
        const startCollider = (x, y, alreadyCheckedSet) => {
            let startPos = {x: x, y: y};
            for (let tile of this.loadedTiles){
                if (alreadyCheckedSet.has(`${tile.x},${tile.y}`)){
                    continue;
                }

                alreadyCheckedSet.add(`${tile.x},${tile.y}`);

                if (tile.textureCoordinate < 0){
                    return {startPos: startPos, endPos: {x: tile.x, y: tile.y}, alreadyCheckedSet: alreadyCheckedSet};
                }

            }
        }

        let alreadyCheckedSet = new Set();  
        for (let tile of this.loadedTiles){
            if (alreadyCheckedSet.has(`${tile.x},${tile.y}`)){
                continue;
            }

            if (tile.textureCoordinate < 0){
                alreadyCheckedSet.add(`${tile.x},${tile.y}`);
                continue;
            }

            const start = startCollider(tile.x, tile.y, alreadyCheckedSet);
            alreadyCheckedSet = start.alreadyCheckedSet;

            const width = start.endPos.x - start.startPos.x;
            const height = start.endPos.y - start.startPos.y;

            const x = start.startPos.x * this.tileGridSize;
            const y = start.startPos.y * this.tileGridSize;

            const rigidBody = new Physics.Rigidbody(new Physics.Vec2(0, 0), 0, Infinity, 1, []);
            const collider = new Physics.RectangleCollider(rigidBody, x, y, 0, 1, width * this.tileGridSize, height * this.tileGridSize);
            collider.tags.add('ground');

            rigidBody.addCollider(collider);
            
            const physicsEngine = this.engineAPI.getModule("physics"); 
            physicsEngine.addRigidbody(rigidBody);
        }
    }
}

