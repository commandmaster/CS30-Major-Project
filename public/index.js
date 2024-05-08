console.log("Hello from index.js");

import {Engine} from "/FrontendModules/engine.js"

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const engine = new Engine(ctx, canvas);

engine.preload().then(() => {
    engine.start();
});