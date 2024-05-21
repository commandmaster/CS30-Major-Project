// Import code from node_modules to setup the web server
import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const __dirname = import.meta.dirname;

const app = express();
const port = 3000;

// const localIP = '0.0.0.0'
const localIP = "localhost"; // temporary fix for testing purposes

console.log(__dirname);
const publicPath = path.join(__dirname, "..", "public"); // Path to the public folder containing the client-side code


// Serve the public folder and the Modules folder
app.use(express.static(publicPath));


// Set the app to listen on the port and IP
const server = app.listen(port, localIP, () => {
    console.log(`Server is running on port ${port}`);
});

// Import socket.io and create a new instance of it using the created web server
import {Server} from "socket.io";
const io = new Server(server);

// Import the Engine
import { Engine } from "./engine.mjs";


const engine = new Engine(io);


