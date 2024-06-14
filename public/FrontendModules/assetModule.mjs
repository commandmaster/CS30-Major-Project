import { ModuleAPI, Module } from "./moduleBase.mjs";

export class AssetAPI extends ModuleAPI {
    constructor(engineAPI) {
        super(engineAPI);
        this.assetConfigPath = "./assets/assetConfig.json";
    }

    // a way to fetch an image from the asset module
    getImage(path) {
        return this.engineAPI.getModule("asset").getImage(path);
    }
}

export class AssetModule extends Module {
    #assets = {};
    #pathToNameMap = new Map();
    constructor(engineAPI) {
        super(engineAPI);
    }

    preload() {
        // load all assets from the assetConfig.json file
        this.#loadAllAssets("./assets/assetConfig.json");
    }

    // load all assets from the assetConfig.json file
    #loadAllAssets(assetConfigPath) {
        fetch(assetConfigPath)
            .then((response) => response.json())
            .then((json) => {
                this.assetConfig = json;
                for (let asset of json) {
                    if (asset.type === "script") {
                        continue;
                    }
                    this.#loadAsset(asset.type, asset.path).then((asset) => {
                        this.#pathToNameMap.set(asset.path, asset.name);
                    });
                }
            });
    }

    // load an asset of a specific type
    #loadAsset(assetType, path) {
        if (this.#assets[path] != null && this.#assets[path] !== undefined) {
            return this.#assets[path];
        }

        switch (assetType.toLowerCase()) {
            case "image":
                return this.#loadImage(path); // load an image
            case "audio":
                return this.#loadAudio(path); // load an audio
            case "json":
                return this.#loadJSON(path); // load a json file
            case "script":
                return new Promise((resolve, reject) => {
                  resolve();
                });
                // will be handeled by the scripting module
            default:
                return new Promise((resolve, reject) => {
                    resolve();
                });

                console.warn(`Asset type '${assetType}' not supported in asset module`);
        }
    }

    // load an image from a path
    #loadImage(path) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            path = "." + path;
            image.src = path;
            image.onload = () => {
                this.#assets[path] = image;
                resolve(image);
            };
        });
    }

    // load an audio from a path
    #loadAudio(path) {
        return new Promise((resolve, reject) => {
            path = "." + path;
            let audio = new Audio(path);
            audio.addEventListener("canplaythrough", () => {
                this.#assets[path] = audio;
                resolve(audio);
            });
        });
    }

    // load a json file from a path
    #loadJSON(path) {
        return new Promise((resolve, reject) => {
            fetch(path)
                .then((response) => response.json())
                .then((json) => {
                    this.#assets[path] = json;
                    resolve(json);
                });
        });
    }

    // get an image from a path
    getImage(path) {
        return this.#assets[path];
    }
}
