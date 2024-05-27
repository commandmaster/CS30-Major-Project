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
const io = new Server(server, {pingTimeout: 1000, pingInterval: 2000});

// Import the Engine
import { Engine } from "./engine.mjs";


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
        this.serverConfig = serverConfig;
        this.io.on('connection', async (socket) => {
            
            console.log('a user connected');
            this.connect(socket);
            socket.on('disconnect', () => {
                this.disconnect(socket);
            });
        });
    }

    async connect(socket){
        const maxRooms = this.serverConfig.maxRooms;
        const maxRoomSize = this.serverConfig.maxRoomSize;
        const logs = this.serverConfig.logs;        
        

        
        const totalUsers = this.io.engine.clientsCount;
        console.log(`Total Users: ${totalUsers}`);

        function getSessionID(socket){
            console.log('Getting session ID');
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(null);
                }, 500);

                socket.emit('getSessionID', socket.id, (sessionID) => {
                    resolve(sessionID);
                });
                
            });
        }

      


        socket.on('requestJoin', async () => {
            let sessionID = await getSessionID(socket);

            console.log(`Session ID: ${sessionID}`);
            if (sessionID === null){
                sessionID = crypto.randomUUID();
                socket.emit('setSessionID', sessionID);
            }

            // Create a new room if the max number of rooms has not been reached and the previous room is full
            if(Object.keys(this.rooms).length < maxRooms && totalUsers % maxRoomSize === 0){
                const roomName = crypto.randomUUID();
                this.rooms[roomName] = new Room(roomName, new Engine(this.io));
                socket.emit('joinedRoom', roomName);
            } else{
                // Check if any rooms have space
                let foundRoom = false;
                for(const room in this.rooms){
                    if(Object.keys(this.rooms[room].clients).length < maxRoomSize){
                        socket.emit('joinedRoom', room);
                        foundRoom = room;
                        break;
                    }
                }
                // If no rooms have space, create a new room
                if(!foundRoom){
                    const roomName = crypto.randomUUID();
                    this.rooms[roomName] = new Room(roomName, new Engine(this.io));
                    socket.emit('joinedRoom', roomName);
                    foundRoom = roomName;
                }
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