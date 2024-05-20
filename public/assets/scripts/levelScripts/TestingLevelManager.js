import { ScriptingAPI } from "../../../FrontendModules/scriptingModule.js";
import { EntityAPI } from "../../../FrontendModules/entityModule.js";
import { PhysicsAPI } from "../../../frontendModules/physicsModule.js";
import * as Physics from "../../../SharedCode/physicsEngine.mjs";


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
                console.log("Connected to server", 'Socket:', socket, 'ID:', socket.id);
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

