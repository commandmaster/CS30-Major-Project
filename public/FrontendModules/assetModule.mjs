import { ModuleAPI, Module } from "./moduleBase.mjs";

export class AssetAPI extends ModuleAPI {
    constructor(engineAPI) {
        super(engineAPI);
        this.assetConfigPath = "/assets/assetConfig.json";
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
                .then((response) => response.json())
                .then((json) => {
                    this.#assets[path] = json;
                    resolve(json);
                });
        });
    }
}
