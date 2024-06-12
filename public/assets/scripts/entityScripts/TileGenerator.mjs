import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs"; 
import { RenderAPI } from "../../../FrontendModules/renderModule.mjs";
import { InputAPI } from "../../../FrontendModules/inputModule.mjs";
import { MathPlus } from "../../../SharedCode/mathPlus.mjs";
import * as Physics from "../../../SharedCode/physicsEngine.mjs";

class Tile{
    constructor(x, y, textureCoordinate, noPhysics = false){
        this.x = x;
        this.y = y;
        this.textureCoordinate = textureCoordinate;
        this.noPhysics = noPhysics;
    }
}

export default class TileGenerator extends ScriptingAPI.Monobehaviour {
    constructor(engineAPI, entity) {
        super(engineAPI, entity);
    }

    Start() {
        const inputModule = this.engineAPI.getModule("input");
        inputModule.addMouseInput("tileEdit").addKeybind(0);
        inputModule.addKeyboardInput("eraser").addKeybind("e");
        inputModule.addMouseInput("selectionBox").addKeybind(2); // Create selection box to remove the physics from the tile, or change the texture
        inputModule.addMouseInput("panCamera").addKeybind(1);
        inputModule.addKeyboardInput("shiftRemove", "bool").addKeybind("Shift"); // Remove the physics from the tile
        inputModule.addKeyboardInput("ctrlAdd", "bool").addKeybind("Control"); // Add the physics to the tile


        this.editorMode = false;

        this.texturesPath = "./assets/textures/tileMap1.png";
        this.tileTexture = new Image();
        this.tileTexture.src = this.texturesPath;

        this.tileRB = null;

        this.tilesAcross = 32;
        this.tilesDown = 32;

        this.selectionImageScale = 1;

        this.worldSize = {worldXMin: -300, worldXMax: 300, worldYMin: -100, worldYMax: 100};

        this.tileMappingPath = "./assets/textures/tileMap1.json";
        
        this.tileGridSize = 32; // The size of each tile in units (like pixels, you can chose how many pixels each unit is in the camera class)
        this.loadedTiles = [];
        this.loadedCoordinates = new Set();
        this.currentEditorPiece = -1;
        this.removeStartPosition = null;
        this.lastMousePosition = {x: 0, y: 0};
        
        // Load the tile map
        fetch(this.tileMappingPath).then(response => response.json()).then(data => {
            this.tileMap = data;

            for (let tile of this.tileMap.tiles){
                this.loadedTiles.push(new Tile(tile.x, tile.y, tile.textureCoordinate, tile.noPhysics));
                this.loadedCoordinates.add(`${tile.x},${tile.y}`);
            }

            this.fillBlankTiles();

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
            
        if (inputAPI.getInputDown("eraser")){
            this.currentEditorPiece = -1;
        }

        if (inputAPI.getInputDown("tileEdit")){
            if (mouseCoords.x > saveButton.x && mouseCoords.x < saveButton.x + saveButton.width && mouseCoords.y > saveButton.y && mouseCoords.y < saveButton.y + saveButton.height){
                    this.saveTileMapping();
                    return;
            } 
        }

        if (inputAPI.getInputDown("panCamera")){
            this.lastMousePosition = {x: mouseCoords.x, y: mouseCoords.y};
        }
        
        if (inputAPI.getMouseInput("panCamera")){
            const sensitivity = 1.3;

            const endPan = {x: mouseCoords.x, y: mouseCoords.y};
            const camera = this.engineAPI.getAPI("render").getCamera();

            const deltaPan = {x: endPan.x - this.lastMousePosition.x, y: endPan.y - this.lastMousePosition.y};

            camera.x -= deltaPan.x * sensitivity;
            camera.y -= deltaPan.y * sensitivity;

            this.lastMousePosition = {x: endPan.x, y: endPan.y};
        }

        


        if (inputAPI.getInputDown("selectionBox")){
            this.removeStartPosition = mouseToWorld;
        }

        if (this.removeStartPosition !== null && inputAPI.getMouseInput("selectionBox") === false){
            const endPosition = mouseToWorld;
        
            // get tiles that are within the start and end position
            const xMin = Math.min(this.removeStartPosition.x, endPosition.x);
            const xMax = Math.max(this.removeStartPosition.x, endPosition.x);
            const yMin = Math.min(this.removeStartPosition.y, endPosition.y);
            const yMax = Math.max(this.removeStartPosition.y, endPosition.y);

            for (let tile of this.loadedTiles){
                tile.x += 0.5;
                tile.y += 0.5;
                if ((tile.x) * this.tileGridSize > xMin && (tile.x) * this.tileGridSize < xMax && (tile.y) * this.tileGridSize > yMin && (tile.y) * this.tileGridSize < yMax){
                    if (inputAPI.getKeyboardInput("ctrlAdd") && inputAPI.getKeyboardInput("shiftRemove")){
                        if (tile.noPhysics === undefined){
                            tile.noPhysics = true;
                        }

                        tile.noPhysics = !tile.noPhysics;
                    }

                    else if (inputAPI.getKeyboardInput("ctrlAdd")){
                        if (tile.noPhysics === undefined){
                            tile.noPhysics = false;
                        }

                        tile.noPhysics = false;
                    }

                    else if (inputAPI.getKeyboardInput("shiftRemove")){
                        if (tile.noPhysics === undefined){
                            tile.noPhysics = true;
                        }

                        tile.noPhysics = true; 
                    }

                    else {
                        tile.noPhysics = false;
                        tile.textureCoordinate = this.currentEditorPiece;
                    }
                }

                tile.x -= 0.5;
                tile.y -= 0.5;
            }

            this.generateColliders();
        

            this.removeStartPosition = null;
        }

        if (pressingMouse){
            if (mouseCoords.x < this.tileTexture.width * this.selectionImageScale && mouseCoords.y < this.tileTexture.height * this.selectionImageScale){   
                const imageWidth = this.tileTexture.width * this.selectionImageScale;
                const imageHeight = this.tileTexture.height * this.selectionImageScale;
                const tileWidth = imageWidth / this.tilesAcross;
                const tileHeight = imageHeight / this.tilesDown;

         

                // draw a rectangle around the selected at image width and height
                const renderFunc = (canvas, ctx) => {
                    ctx.strokeStyle = "red";
                    ctx.strokeRect(0, 0, imageWidth, imageHeight);
                }
                const renderTask = new RenderAPI.RenderTask(renderFunc);
                renderAPI.addTask(renderTask, true);

                const x = Math.floor(mouseCoords.x / tileWidth);
                const y = Math.floor(mouseCoords.y / tileHeight);

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
                            tile.noPhysics = false;
                        }
                    }
                }

                this.generateColliders();
            }

        }


    }

    Update() {
        if (this.editorMode) this.editor(); 

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

                // check if tile is in range of the camera
                const camera = renderAPI.getCamera();
                const cameraX = camera.x;
                const cameraY = camera.y;
                const cameraFrameOfView = camera.frameOfView;

                const extraSpace = 100;

                // Check if the tile is in the camera view
                if (x < cameraX - cameraFrameOfView.width / 2 - extraSpace || x > cameraX + cameraFrameOfView.width / 2 + extraSpace || y < cameraY - cameraFrameOfView.height / 2 - extraSpace || y > cameraY + cameraFrameOfView.height / 2 + extraSpace){
                    return;
                }

                
                ctx.drawImage(this.tileTexture, textureCoordinateToX, textureCoordinateToY, imageTileWidth, imageTileHeight, x, y, this.tileGridSize + 1, this.tileGridSize + 1);

                if (this.editorMode){
                    // Draw a outline rectangle around the tile
                    ctx.strokeStyle = "green";
                    ctx.strokeRect(x, y, this.tileGridSize, this.tileGridSize);
                }
                

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
            tileMap.tiles.push({x: tile.x, y: tile.y, textureCoordinate: tile.textureCoordinate, noPhysics: tile.noPhysics});
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
        const mergedBlocks = new Map();
        // fill merged blocks with the loaded tiles
        for (let tile of this.loadedTiles){
            if (tile.textureCoordinate !== -1 && !tile.noPhysics){
                mergedBlocks.set(`${tile.x},${tile.y}`, `${tile.x},${tile.y},1,1`);
            }
        }

        const mergeRows = () => {
            const searchNeighbours = (block) => {
                const blockSplit = block.split(",");
                const x = parseInt(blockSplit[0]);
                const y = parseInt(blockSplit[1]);
                const width = parseInt(blockSplit[2]);
                const height = parseInt(blockSplit[3]);

                const hasRightNeighbour = mergedBlocks.has(`${x + width},${y}`);     
               

                if (hasRightNeighbour){
                    const rightNeighbour = mergedBlocks.get(`${x + width},${y}`);
                    const rightNeighbourSplit = rightNeighbour.split(",");
                    const rightNeighbourWidth = parseInt(rightNeighbourSplit[2]);
                    const rightNeighbourHeight = parseInt(rightNeighbourSplit[3]);

                    if (rightNeighbourHeight === height){
                        mergedBlocks.delete(`${x + width},${y}`);
                        mergedBlocks.set(`${x},${y}`, `${x},${y},${width + rightNeighbourWidth},${height}`);
                        return searchNeighbours(`${x},${y},${width + rightNeighbourWidth},${height}`)
                    }
                }    

                return false;
            
            }

            for (let block of mergedBlocks){
                searchNeighbours(block[1]);
            }
        }

        const mergeSameWidthRows = () => {
            const searchNeighbours = (block) => {
                const blockSplit = block.split(",");
                const x = parseInt(blockSplit[0]);
                const y = parseInt(blockSplit[1]);
                const width = parseInt(blockSplit[2]);
                const height = parseInt(blockSplit[3]);

                const hasBelowNeighbour = mergedBlocks.has(`${x},${y + height}`);     
               

                if (hasBelowNeighbour){
                    const belowNeighbour = mergedBlocks.get(`${x},${y + height}`);
                    const belowNeighbourSplit = belowNeighbour.split(",");
                    const belowNeighbourWidth = parseInt(belowNeighbourSplit[2]);
                    const belowNeighbourHeight = parseInt(belowNeighbourSplit[3]);

                    if (belowNeighbourWidth === width){
                        mergedBlocks.delete(`${x},${y + height}`);
                        mergedBlocks.set(`${x},${y}`, `${x},${y},${width},${height + belowNeighbourHeight}`);
                        return searchNeighbours(`${x},${y},${width},${height + belowNeighbourHeight}`)
                    }
                }    

                return false;
            
            }


            for (let block of mergedBlocks){
                searchNeighbours(block[1]);
            }
        }

        //console.log(mergedBlocks);
        mergeRows();
        mergeSameWidthRows();


        if (this.tileRB !== null){
            const physModule = this.engineAPI.getModule("physics")
            physModule.physicsEngine.deleteRigidbody(this.tileRB);
            this.tileRB = null;   
        }

        const rigidBody = new Physics.Rigidbody(new Physics.Vec2(0, 0), 0, Infinity, 1, []);
        for (const colliderShape of mergedBlocks){
            const colliderSplit = colliderShape[1].split(",");
            let x = parseInt(colliderSplit[0])
            let y = parseInt(colliderSplit[1]) 
            const width = parseInt(colliderSplit[2]);
            const height = parseInt(colliderSplit[3]);

            // move the collider to match the correct postition
            x *= -this.tileGridSize;
            y *= -this.tileGridSize;

            x -= width * this.tileGridSize / 2;
            y -= height * this.tileGridSize / 2;

            rigidBody.addCollider(new Physics.RectangleCollider(rigidBody, x, y, 0, 1, width * this.tileGridSize, height * this.tileGridSize)).tags.add('ground');
        }

        this.tileRB = rigidBody;


        const physModule = this.engineAPI.getModule("physics")
        physModule.addRigidbody(rigidBody);
       
    }
}

