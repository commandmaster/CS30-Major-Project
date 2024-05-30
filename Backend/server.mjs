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





class Room{
    constructor(name, engine, host = null){
        this.name = name;
        this.engine = engine;
        this.clients = {};
        this.host = host;
        this.cashedClients = new Map(); // Store the clients that have left the room (their reconnection ids) 
    }

    addClient(socket, isHost = false){
        this.clients[socket.id] = socket;
        
        if (isHost){
            this.host = socket;
        }

        this.cashedClients.delete(socket.id);
    }

    removeClient(socket){
        if (this.host === socket){
            this.host = null;
            for (const client in this.clients){
                client.disconnect();
            }
        }

        

        delete this.clients[socket.id];
        this.cashedClients.set(socket.id, socket.id);
    }
}

class ServerHandler{
    constructor(io){
        this.io = io;
        this.rooms = {}; // Create different rooms for multiple games/rooms on a single server

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
        const maxRooms = this.serverConfig.maxRooms; // Maximum number of rooms that can be created
        const maxRoomSize = this.serverConfig.maxRoomSize; // Maximum number of players that can join a room
        const logs = this.serverConfig.logs;  // Boolean to determine if logs should be printed to the console
        

        
        const totalUsers = this.io.engine.clientsCount; // Get the total number of users connected to the server
        console.log(`Total Users: ${totalUsers}`);

        /**
         * Get the session ID of the user
         * @typedef {Object} Socket - A socket.io object representing a connected client
         * @param {Socket} socket - The socket of the user
         * @returns {Promise} - The session ID of the user
         * @async
         * @function getSessionID
         * @memberof ServerHandler
        */
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

        socket.on('hostGame', (roomName, callback) => {
            roomName = roomName.trim();

            const matchRegex = new RegExp(/[^a-zA-Z0-9_]/g);
            
            if (matchRegex.test(roomName)){
                callback('Room name can only contain letters, numbers and underscores');
                return;
            }

            if (this.rooms[roomName]){
                callback('Room already exists');
                return;
            }

            callback('Room created');
            this.rooms[roomName] = new Room(roomName, new Engine(this.io), socket);
            socket.emit('joinedRoom', roomName);
            this.rooms[roomName].addClient(socket, true);
            console.log(`Created new room: ${roomName}`);
        });

        socket.on('joinGame', (roomName) => {
            if(this.rooms[roomName]){
                this.rooms[roomName].addClient(socket, false);
                socket.emit('joinedRoom', roomName);
            } else{
                socket.emit('roomNotFound');
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

const serverHandler = new ServerHandler(io); // Create a new instance of the ServerHandler class all server-client game logic using socket.io