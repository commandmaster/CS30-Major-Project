import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.mjs";
import { EntityAPI } from "../../../FrontendModules/entityModule.mjs";
import { PhysicsAPI } from "../../../FrontendModules/physicsModule.mjs";
import * as Physics from "../../../SharedCode/physicsEngine.mjs";
import { NetworkParser } from "../../../SharedCode/networkParsing.mjs";


export default class TestingLevelManager extends ScriptingAPI.LevelManager {
    constructor(engineAPI, level) {
        super(engineAPI, level);
    }

    Start() {
        const inputModule = this.engineAPI.getModule("input");
        const entityAPI = this.engineAPI.getAPI("entity");
        const newEntity = new EntityAPI.Entity(entityAPI, "testEntity");
        
        
        const rb = new Physics.Rigidbody(new Physics.Vec2(0, 0), 0, 1, 1, []);
        const collider = new Physics.CircleCollider(rb, 0, 0, 1, 10);
        rb.addCollider(collider);

        newEntity.createComponent({type: "scripting", scriptNames: ["Movement"]});


        newEntity.createComponent({rigidBody: rb, type: "rigidbody"});

        this.level.addEntity(newEntity);

        inputModule.addKeyboardInput('horizontal', 'axis').addKeybind('a', -1).addKeybind('d', 1);
        inputModule.addKeyboardInput('vertical', 'axis').addKeybind('w', -1).addKeybind('s', 1);
        inputModule.addKeyboardInput('jump', 'bool').addKeybind('space');
       
        const networkingModule = this.engineAPI.getModule("networking");
        try {
            networkingModule.connectToServer().then((socket) => {
                function host(){
                    socket.emit('hostGame', 'testRoom', (callback) => {
                        console.log(callback);
                    });
                }

                function join(){
                    socket.emit('joinGame', 'testRoom', (callback) => {
                        console.log(callback);
                    });
                }

                const joinBtn = document.createElement('button');
                joinBtn.innerText = 'Join Room';
                joinBtn.style.position = 'absolute';
                joinBtn.style.top = '0px';
                joinBtn.onclick = join;

                const hostBtn = document.createElement('button');
                hostBtn.innerText = 'Host Room';
                hostBtn.style.position = 'absolute';
                hostBtn.style.top = '25px';

                hostBtn.onclick = host;


                document.body.appendChild(joinBtn); 
                document.body.appendChild(hostBtn);

                socket.on('setSessionID', (sessionID) => {
                    console.log(`Session ID: ${sessionID}`);
                    sessionStorage.setItem('sessionID', sessionID);
                });

                socket.on('getSessionID', (socketID, callback) => {
                    const sessionID = sessionStorage.getItem('sessionID');
                    if (sessionID === null || sessionID === undefined) {
                        callback(null);
                    }
                    
                    callback(sessionID);
                });

                socket.on('joinedRoom', (roomName) => {
                    console.log(`Joined Room: ${roomName}`);
                });

                console.log("Connected to server", 'Socket:', socket, 'ID:', socket.id);

                socket.on('serverUpdate', (data, callback) => {
                    console.log(data);
                    // compress entity into a packet
                    const encodedEntityPacket = NetworkParser.encodeEntityIntoPacket(newEntity);
                    console.log(encodedEntityPacket);

                    const encodedInputsPacket = NetworkParser.encodeInputsIntoPacket(inputModule.exportInputs());
                    console.log(encodedInputsPacket);

                    const serverPacket = NetworkParser.createServerPacket(encodedEntityPacket, encodedInputsPacket);

                    callback(serverPacket); 
                });
            });
        }
        catch (err) {
            throw new Error(err);
        }


    }


    Update() {

    }


    End() {
        
    }
}

export class Backend{
    constructor(BE_engine){
        this.engine = BE_engine; // the Backend engine ran by the server
        this.io = this.engine.io; // the socket.io instance
    }

    preload(){
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    onConnection(socket){   
        console.log('socket connection detected', socket.id);
        this.engine.modules.physicsModule.createRigidBody({position: new Physics.Vec2(0, 0), rotation: 0, mass: 1, bounce: 1, colliders: []});
        console.log(this.engine.modules.physicsModule.physicsEngine.rigidBodies);
    }

    onDisconnection(socket){
        console.log(socket.id);            
    }

    start(){
        
    }

    update(){
        //console.log('update');

        // handle the physics communication between the server and the clients
       for (const clientID in this.engine.room.clients){
            const client = this.engine.room.clients[clientID];
            client.emit('serverUpdate', {data: 'test'}, (callback) => {
                console.log(callback);
            });
       }
    }

}