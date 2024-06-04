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
        // this.engine.modules.physicsModule.createRigidBody({position: new Physics.Vec2(0, 0), rotation: 0, mass: 1, bounce: 1, colliders: []});
        const newEntity = new this.engine.constructor.BE_Enity(this.engine, String(socket.id)); // create a new entity for the client and setting it's name to be the socket id
        newEntity.addRigidBody({position: new Physics.Vec2(0, 0), rotation: 0, mass: 1, bounce: 1, colliders: []});
        newEntity.rb.addCollider(new Physics.CircleCollider(newEntity.rb, 0, 0, 1, 10));

        console.log(this.engine.modules.physicsModule.physicsEngine.rigidBodies);
    }

    onDisconnection(socket){
        console.log(socket.id);            
    }

    start(){
        
    }

    update(){
        // handle the physics communication between the server and the clients

        for (const clientID in this.engine.room.clients){
            if (clientID === undefined) throw new Error('Client ID is undefined (this should not happen!)');

            const client = this.engine.room.clients[clientID];

            

            const clientEntity = this.engine.BE_Enities[String(clientID)];

            if (clientEntity === undefined) continue;

            const serializedBackendEntity = NetworkParser.encodeServerEntityIntoPacket(clientEntity);

            client.emit('serverUpdate', {playerEntity: serializedBackendEntity}, (callback) => {
                const clientInputs = NetworkParser.decodeInputsFromPacket(callback);
                const clientState = NetworkParser.decodeEntityFromPacket(callback); 

                // update the backend entity with the client state and add the inputs to the physics body
                clientEntity.updateEntityState(clientState); // soecifically designed to update the animation data and other general data for the object, the inputs and physics are handled speratlly to prevent cheating or desync issues
                
                // update the physics body with the inputs
                const rb = clientEntity.rb;
                const inputs = clientInputs.keyboardInputs;
                if (inputs !== undefined){
                    if (inputs.horizontal !== undefined){
                        rb.applyImpulse(new Physics.Vec2(inputs.horizontal.value * 1000, 0));
                    }
                    if (inputs.vertical !== undefined){
                        rb.applyImpulse(new Physics.Vec2(0, inputs.vertical.value * 1000));
                    }
                    if (inputs.jump !== undefined){
                        if (inputs.jump.value === true){
                            rb.velocity.y = 10;
                        }
                    }
                }



            });
        }
    }

}