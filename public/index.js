

import { Engine } from "./frontendModules/engine.js";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const engine = new Engine(ctx, canvas);
window.engine = engine;

engine.preload().then(() => {
    engine.start();
});