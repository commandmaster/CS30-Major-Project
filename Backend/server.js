// Import code from node_modules to setup the web server
const express = require("express");
const fs = require("fs");
const path = require("path");

// Used to create unique IDs
const crypto = require("crypto");

const app = express();
const port = 3000;

// const localIP = '0.0.0.0'
const localIP = "localhost"; // temporary fix for testing purposes

const publicPath = path.join(__dirname, "..", "public"); // Path to the public folder containing the client-side code


// Serve the public folder and the Modules folder
app.use(express.static(publicPath));


// Set the app to listen on the port and IP
const server = app.listen(port, localIP, () => {
    console.log(`Server is running on port ${port}`);
});

// Import socket.io and create a new instance of it using the created web server
const socket = require("socket.io");
const io = socket(server);
