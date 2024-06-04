import { ModuleAPI, Module } from "./moduleBase.mjs";

export class InputAPI extends ModuleAPI {
    constructor(engineAPI) {
        super(engineAPI);
    }

    getKeyboardInput(name){
        return this.engineAPI.getModule('input').keyboardInputs[name].value;
    }

    getMouseInput(name){
        return this.engineAPI.getModule('input').mouseInputs[name].value;
    }

    getInputDown(name){
        // frame allowance is the number a buffer of frames to allow the input to be considered down
       
        const inputModule = this.engineAPI.getModule('input');

        const input = inputModule.keyboardInputs[name] || inputModule.mouseInputs[name];

        if (input){
            if (!input.needsReset && input.value !== input.defaultValue){
                input.needsReset = true;
                return input.value;
            }
            else {
                return input.defaultValue;
            }
        }
    }

    getGamepadInput(name){
        console.warn('Gamepad input not implemented');
        return this.engineAPI.getModule('input').gamepadInputs[name].value;
    }
}

export class InputModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }

    exportInputs(){
        const inputAPI = this.engineAPI.getAPI('input');

        for (const input of Object.values(this.keyboardInputs)){
            input.pressed = inputAPI.getInputDown(input.name) !== input.defaultValue;
        }

        for (const input of Object.values(this.mouseInputs)){
            input.pressed = inputAPI.getInputDown(input.name) !== input.defaultValue;
        }

        // for (const input of Object.values(this.gamepadInputs)){
        //     input.pressesed = this.engineAPI.getAPI('input').getInputDown(input.name);
        // }

        return {
            keyboardInputs: this.keyboardInputs,
            mouseInputs: this.mouseInputs,
            gamepadInputs: this.gamepadInputs
        };
    }

    async preload() {
        this.keyboardInputs = {};
        this.mouseInputs = {};

        this.#setupListeners();

        this.gamePads = navigator.getGamepads();

        
    }

    #setupListeners(){
        window.addEventListener('keydown', (event) => {
            // loop through all keyboard inputs and check if the key that was pressed is bound to any of them
            const key = event.key;
            for (const input of Object.values(this.keyboardInputs)){
                for (const bind of input.binds){
                    if (bind.key === key){
                        input.value = bind.value;
                    }
                }
            }
        });

        window.addEventListener('keyup', (event) => {
            // loop through all keyboard inputs and check if the key that was released is bound to any of them
            const key = event.key;
            for (const input of Object.values(this.keyboardInputs)){
                for (const bind of input.binds){
                    if (bind.key === key){
                        input.value = input.defaultValue;
                        input.needsReset = false;
                    }
                }
            }
        });

        window.addEventListener('mousedown', (event) => {
            // loop through all mouse inputs and check if the button that was pressed is bound to any of them
            const button = event.button;
            for (const input of Object.values(this.mouseInputs)){
                for (const bind of input.binds){
                    if (bind.button === button){
                        input.value = bind.value;
                    }
                }
            }
        });

        window.addEventListener('mouseup', (event) => {
            // loop through all mouse inputs and check if the button that was released is bound to any of them
            const button = event.button;
            for (const input of Object.values(this.mouseInputs)){
                for (const bind of input.binds){
                    if (bind.button === button){
                        input.value = input.defaultValue;
                        input.needsReset = false;
                    }
                }
            }
        });

        window.addEventListener('gamepadconnected', (event) => {
            this.gamePads = navigator.getGamepads();
        });
    }

    addKeyboardInput(name, type='bool'){
        if (type === 'bool') {
            this.keyboardInputs[name] = new BoolInput(name);
        } else if (type === 'axis') {
            this.keyboardInputs[name] = new AxisInput(name);
        }

        return this.keyboardInputs[name];
    } 

    addMouseInput(name){
        this.mouseInputs[name] = new MouseInput(name);

        return this.mouseInputs[name];
    }

    addGamepadInput(name, button){
        throw new Error('Not implemented');
    }
}

class BoolInput {
    constructor(name){
        this.name = name;
        this.value = false;

        this.defaultValue = false;
        this.needsReset = false;

        this.binds = [];
    }

    addKeybind(key){
        this.binds.push({key, value: true});
        return this;
    }

    removeKeybind(key){
        this.binds = this.binds.filter(b => b.key !== key);
        return this;
    }
}

class AxisInput {
    constructor(name){
        this.name = name;
        this.value = 0;

        this.defaultValue = 0;
        this.needsReset = false;

        this.binds = [];
    }

    addKeybind(key, axisValue){
        if (axisValue > 1 || axisValue < -1) throw new Error('Axis value must be between -1 and 1');
        if (typeof axisValue !== 'number') throw new Error('Axis value must be a number');

        this.binds.push({key, value: axisValue});

        return this;
    }

    removeKeybind(key){
        this.binds = this.binds.filter(b => b.key !== key);

        return this;
    }
}

class MouseInput {
    constructor(name){
        this.name = name;
        this.value = false;

        this.defaultValue = false;
        this.needsReset = false;

        this.binds = [];
    }

    addKeybind(button){
        this.binds.push({button, value: true});
        return this;
    }

    removeKeybind(button){
        this.binds = this.binds.filter(b => b.button !== button);
        return this;
    }
}

