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
        
       
        const networkingModule = this.engineAPI.getModule("networking");
        try {
            networkingModule.connectToServer().then((socket) => {
                const inputModule = this.engineAPI.getModule("input");
                const entityAPI = this.engineAPI.getAPI("entity");
                const newEntity = new EntityAPI.Entity(entityAPI, socket.id);
                
                
                const rb = new Physics.Rigidbody(new Physics.Vec2(0, 0), 0, 1, 1, []);
                const collider = new Physics.CircleCollider(rb, 0, 0, 1, 10);
                rb.addCollider(collider);

                newEntity.createComponent({type: "scripting", scriptNames: ["Movement"]});


                newEntity.createComponent({rigidBody: rb, type: "rigidbody"});

                console.log(newEntity.serialize());

                this.level.addEntity(newEntity);

                inputModule.addKeyboardInput('horizontal', 'axis').addKeybind('a', -1).addKeybind('d', 1);
                inputModule.addKeyboardInput('vertical', 'axis').addKeybind('w', -1).addKeybind('s', 1);
                inputModule.addKeyboardInput('jump', 'bool').addKeybind('space');   



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
               

                    const compressedEntities = data.compressedEntities;
                    for (const entityName in compressedEntities){
                        const entityData = compressedEntities[entityName];
                        console.log(entityData);
                        if (this.level.getEntity(entityName) === undefined){

                            const newEntity = new EntityAPI.Entity(entityAPI, entityName);
                            const rb = new Physics.Rigidbody(new Physics.Vec2(entityData.position.x, entityData.position.y), entityData.rotation, 1, 1, []);
                            const collider = new Physics.CircleCollider(rb, 0, 0, 1, 10);
                            rb.addCollider(collider);
                            newEntity.createComponent({rigidBody: rb, type: "rigidbody"});
                            this.level.addEntity(newEntity);
                        }

                        const entity = this.level.getEntity(entityName);
                        const rb = entity.getComponent('rigidbody');
                        rb.position = new Physics.Vec2(entityData.position.x, entityData.position.y);
                        rb.rotation = entityData.rotation;
                        rb.velocity = new Physics.Vec2(entityData.velocity.x, entityData.velocity.y);
                    }
                });

               

          

                const physEngine = this.engineAPI.getModule("physics").physicsEngine;

                const floorRB = new Physics.Rigidbody(new Physics.Vec2(500, 1500), 0, Infinity, 1, []);
                const floorCollider = new Physics.ConvexCollider(floorRB, 0, 0, 0, 1, [new Physics.Vec2(0, 0), new Physics.Vec2(1000, 0), new Physics.Vec2(1000, 1000), new Physics.Vec2(0, 1000)]);
                floorRB.addCollider(floorCollider);
                

                console.log(physEngine)

                physEngine.addRigidbody(floorRB);
  
        

               
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

class CompressedEntity{
    constructor(name, position, rotation, velocity, animationFrame=0, currentAnimationName=null){
        this.name = name;
        this.position = position;
        this.rotation = rotation;
        this.velocity = velocity;
        this.animationFrame = animationFrame;
        this.currentAnimationName = currentAnimationName;
    }
}

export class Backend{
    constructor(BE_engine){
        this.engine = BE_engine; // the Backend engine ran by the server
        this.io = this.engine.io; // the socket.io instance
    }

    preload(){
        this.compressedEntities = {};

        return new Promise((resolve, reject) => {
            // create the map and send the associated entities to the clients 
            console.log(this.engine.constructor)
            const entityClass = this.engine.constructor.BE_Entity;

            console.log(entityClass)

            const floor = new entityClass(this.engine, 'floor');
            floor.addRigidBody({position: new Physics.Vec2(500, 1500), rotation: 0, mass: Infinity, bounce: 1, colliders: []});
            floor.rb.addCollider(new Physics.ConvexCollider(floor.rb, 0, 0, 0, 1, [new Physics.Vec2(0, 0), new Physics.Vec2(1000, 0), new Physics.Vec2(1000, 1000), new Physics.Vec2(0, 1000)]));

            this.compressedEntities['floor'] = new CompressedEntity('floor', {x: 500, y: 1500}, 0, {x: 0, y: 0}, 0, null);
    
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

        this.compressedEntities[String(socket.id)] = new CompressedEntity(String(socket.id), {x: 0, y: 0}, 0, {x: 0, y: 0}, 0, null);
    }

    onDisconnection(socket){
        console.log(socket.id);            
        this.engine.deleteEntity(String(socket.id));
    }

    start(){
       
    }

    update(){
        // handle the physics communication between the server and the clients

        //Update the compressed entities
        for (const entityName in this.engine.BE_Enities){
            const entity = this.engine.BE_Enities[entityName];
            const rb = entity.rb;
            const position = rb.position;
            const rotation = rb.rotation;
            const velocity = rb.velocity;
            const animationFrame = entity.currentFrame;
            const currentAnimationName = entity.currentAnim;

            if (this.compressedEntities[entityName] === undefined) this.compressedEntities[entityName] = new CompressedEntity(entityName, {x: 0, y: 0}, 0, {x: 0, y: 0}, 0, null);
            this.compressedEntities[entityName].position = {x: position.x, y: position.y};
            this.compressedEntities[entityName].rotation = rotation;
            this.compressedEntities[entityName].velocity = {x: velocity.x, y: velocity.y};
            this.compressedEntities[entityName].animationFrame = animationFrame;
            this.compressedEntities[entityName].currentAnimationName = currentAnimationName;
        }
        

        for (const clientID in this.engine.room.clients){
            if (clientID === undefined) throw new Error('Client ID is undefined (this should not happen!)');

            const client = this.engine.room.clients[clientID];

            

            const clientEntity = this.engine.BE_Enities[String(clientID)];

            if (clientEntity === undefined) continue;



            const BE_Enities = this.engine.BE_Enities;

            const serverPacket = NetworkParser.createServerPacket(clientEntity, BE_Enities);
            serverPacket.compressedEntities = this.compressedEntities;

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
                            console.log(inputs.vertical.value, "applied Impulse");
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

