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
                    // compress entity into a packet
                    const encodedEntityPacket = NetworkParser.encodePlayerIntoPacket(newEntity);
                    //console.log(encodedEntityPacket);

                    const encodedInputsPacket = NetworkParser.encodeInputsIntoPacket(inputModule.exportInputs());
                    //console.log(encodedInputsPacket);

                    const clientPacket = NetworkParser.createClientPacket(encodedEntityPacket, encodedInputsPacket);

                    callback(clientPacket); 

                    //console.log(data);
                    newEntity.updateEntityState(data.playerEntity);

                    for (const entityName in data.entities){
                        const entityData = data.entities[entityName];
                        const entity = this.level.getEntity(entityName);
                        entity.updateEntityState(entityData);
                    }
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
        const newPlayer = new this.engine.constructor.BE_Player(this.engine, String(socket.id)); // create a new entity for the client and setting it's name to be the socket id
        newPlayer.addRigidBody({position: new Physics.Vec2(0, 0), rotation: 0, mass: 1, bounce: 1, colliders: []});
        newPlayer.rb.addCollider(new Physics.CircleCollider(newPlayer.rb, 0, 0, 1, 10));

        newPlayer.addInput('horizontal', 0);
        newPlayer.addInput('vertical', 0); 

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


       
            const BE_Enities = this.engine.BE_Enities;

            const serverPacket = NetworkParser.createServerPacket(clientEntity, BE_Enities);
        

            client.emit('serverUpdate', serverPacket, (callback) => {
                const clientInputs = NetworkParser.decodeInputsFromPacket(callback);
                const clientState = NetworkParser.decodePlayerFromPacket(callback); 

                // update the backend entity with the client state and add the inputs to the physics body
                clientEntity.updateEntityState(clientState); // soecifically designed to update the animation data and other general data for the object, the inputs and physics are handled speratlly to prevent cheating or desync issues
                
                // update the physics body with the inputs
                const rb = clientEntity.rb;
                const inputs = clientInputs.keyboardInputs;

                if (inputs !== undefined){
                    if (inputs.horizontal !== undefined){
                        if (!clientEntity.alreadyPressed('horizontal')){
                            console.log(inputs.horizontal.value);
                            rb.applyImpulse(new Physics.Vec2(inputs.horizontal.value * 1000, 0));
                        }

                        clientEntity.inputDown('horizontal', inputs.horizontal.value);
                    } else {
                        clientEntity.inputUp('horizontal', 0);
                    }

                    if (inputs.vertical !== undefined){
                        if (!clientEntity.alreadyPressed('vertical')){
                            rb.applyImpulse(new Physics.Vec2(0, inputs.vertical.value * 1000));
                        }

                        clientEntity.inputDown('vertical', inputs.vertical.value);
                    } else {
                        clientEntity.inputUp('vertical', 0);
                    }
                }

                
            });
        }
    }

}