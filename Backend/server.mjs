// Import code from node_modules to setup the web server
import express from "express";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import * as fsPromises from "fs/promises";

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

// // Import the Engine
// import { Engine } from "./engine.mjs";


// const engine = new Engine(io);


class Room{
    constructor(name, engine){
        this.name = name;
        this.engine = engine;
        this.clients = {};
    }

    addClient(client){
        this.clients[client.id] = client;
    }

    removeClient(client){
        delete this.clients[client.id];
    }
}

class ServerHandler{
    constructor(io){
        this.io = io;
        this.rooms = {}; // Create different rooms for multiple games/rooms on a single server
        this.allowedToJoin = {};

        // Pull the server configuration from the serverConfig.json file
        this.serverConfig = fsPromises.readFile(path.join("./serverConfig.json"), "utf-8").then((config) => {
            this.serverConfig = JSON.parse(config);
            this.setupServer(this.serverConfig);
        });
    }

    async setupServer(serverConfig){
        const maxRoomSize = serverConfig.maxRoomSize;
        const maxRooms = serverConfig.maxRooms;
        const logs = serverConfig.logs;

        this.io.on('connection', (socket) => {
            const totalUsers = this.io.engine.clientsCount;
            console.log(`Total Users: ${totalUsers}`);

            // Create a new room if the max number of rooms has not been reached and the previous room is full
            if(Object.keys(this.rooms).length < maxRooms && totalUsers % maxRoomSize === 0){
                const roomName = crypto.randomUUID();
                this.rooms[roomName] = new Room(roomName);
                socket.emit('joinRoom', roomName);
            } else{
                // Check if any rooms have space
                let foundRoom = false;
                for(const room in this.rooms){
                    if(Object.keys(this.rooms[room].clients).length < maxRoomSize){
                        socket.emit('joinRoom', room);
                        foundRoom = true;
                        break;
                    }
                }

                // If no rooms have space, create a new room
                if(!foundRoom){
                    const roomName = crypto.randomUUID();
                    this.rooms[roomName] = new Room(roomName);
                    socket.emit('joinRoom', roomName);
                }

                this.allowedToJoin[socket.id] = {room: roomName, time: Date.now()};
            }



            console.log('a user connected');
            this.connect(socket);
            socket.on('disconnect', () => {
                this.disconnect(socket);
            });
        });
    }

    connect(socket){
        socket.on('joinRoom', (roomName) => {
            if(this.rooms[roomName]){
                this.rooms[roomName].addClient(socket);
            }else{
                this.rooms[roomName] = new Room(roomName);
                this.rooms[roomName].addClient(socket);
            }
        });
    }

    disconnect(socket){
        for(const room in this.rooms){
            if(this.rooms[room].clients[socket.id]){
                this.rooms[room].removeClient(socket);
            }
        }
    }


}

const serverHandler = new ServerHandler(io);