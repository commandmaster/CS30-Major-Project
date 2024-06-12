import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs"; 

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
        this.texturesPath = "./assets/textures/tileMap1.png";
        this.tilesAcross = 30;
        this.tilesDown = 32;

        this.worldSize = {worldXMin: -100, worldXMax: 100, worldYMin: -100, worldYMax: 100};

        this.tileMappingPath = "./assets/textures/tileMap1.json";
        
        this.tileGridSize = 64; // The size of each tile in units (like pixels, you can chose how many pixels each unit is in the camera class)
        this.loadedTiles = [];
        this.loadedCoordinates = new Set();
        
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
        });

    }

    Update() {

    }

    fillBlankTiles(){
        for (let x = this.worldSize.worldXMin; x < this.worldSize.worldXMax; x += 1){
            for (let y = this.worldSize.worldYMin; y < this.worldSize.worldYMax; y += 1){
                const tileExists = this.loadedCoordinates.has(`${x},${y}`);
            
                if (!tileExists){
                    this.loadedTiles.push(new Tile(x, y, 0));
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
}

