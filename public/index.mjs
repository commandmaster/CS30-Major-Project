

import { Engine } from "./FrontendModules/engine.mjs"; 

const canvas = document.getElementById('gameCanvas'); // get the canvas element from the DOM
const ctx = canvas.getContext('2d'); // get the 2d rendering context from the canvas element
const engine = new Engine(ctx, canvas); // create a new engine instance
window.engine = engine; // make the engine instance available globally

engine.preload().then(() => {
    engine.start();
});