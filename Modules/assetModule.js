import { ModuleAPI } from "./moduleBase";
import { Module } from "./moduleBase";

export class AssetAPI extends ModuleAPI {
    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}

export class AssetModule extends Module {
    #assets = {};
    #pathToNameMap = new Map();
    constructor(engineAPI) {
        super(engineAPI);
    }

    preload() {
        this.#loadAllAssets("/assets/assetConfig.json");
    }

    #loadAllAssets(assetConfigPath) {
        fetch(assetConfigPath)
            .then(response => response.json())
            .then(json => {
                for (let asset of json) {
                    this.#loadAsset(asset.type, asset.path)
                        .then(asset => {
                            this.#pathToNameMap.set(asset.path, asset.name);
                        });
                }
            });
        
    }

    #loadAsset(assetType, path) {
        if (this.#assets[path] != null && this.#assets[path] !== undefined) {
            return this.#assets[path];
        }

        switch (assetType.toLowerCase()) {
            case "image":
                return this.#loadImage(path);
            case "audio":
                return this.#loadAudio(path);
            case "json":
                return this.#loadJSON(path);
            default:
                throw new Error(`Asset type ${assetType} not supported.`);
        }
    }

    #loadImage(path) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.src = path;
            image.onload = () => {
                this.#assets[path] = image;
                resolve(image);
            };
        });
    }

    #loadAudio(path) {
        return new Promise((resolve, reject) => {
            let audio = new Audio(path);
            audio.addEventListener("canplaythrough", () => {
                this.#assets[path] = audio;
                resolve(audio);
            });
        });
    }

    #loadJSON(path) {
        return new Promise((resolve, reject) => {
            fetch(path)
                .then(response => response.json())
                .then(json => {
                    this.#assets[path] = json;
                    resolve(json);
                });
        });
        
    }
}


