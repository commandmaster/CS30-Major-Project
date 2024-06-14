import { ModuleAPI, Module } from "./moduleBase.mjs";

// NOTE: There are no gamepad inputs implemented in the current version of the engine.
export class InputAPI extends ModuleAPI {
    constructor(engineAPI) {
        super(engineAPI);
    }

    // Get the current mouse position
    getMousePosition(){
        return this.engineAPI.getModule('input').mousePosition;
    }

    // Get the value of a keyboard input
    getKeyboardInput(name){
        return this.engineAPI.getModule('input').keyboardInputs[name].value;
    }

    // Get the value of a mouse input
    getMouseInput(name){
        return this.engineAPI.getModule('input').mouseInputs[name].value;
    }

    // Get the value of a gamepad input
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

    // NOTE: This is a placeholder function for getting gamepad input. Gamepad input is not implemented in the current version of the engine.
    getGamepadInput(name){
        console.warn('Gamepad input not implemented');
        return this.engineAPI.getModule('input').gamepadInputs[name].value;
    }
}

export class InputModule extends Module {
    constructor(engineAPI) {
        super(engineAPI);
    }

    // export the inputs so they can be compressed (ussally used for networking) <---- I Did not implement the server side of the engine so this is not needed but I will leave it in for future use
    exportInputs(){
        const inputAPI = this.engineAPI.getAPI('input');

        for (const input of Object.values(this.keyboardInputs)){
            input.pressed = inputAPI.getInputDown(input.name) !== input.defaultValue;
        }

        for (const input of Object.values(this.mouseInputs)){
            input.pressed = inputAPI.getInputDown(input.name) !== input.defaultValue;
        }


        return {
            keyboardInputs: this.keyboardInputs,
            mouseInputs: this.mouseInputs,
            gamepadInputs: this.gamepadInputs
        };
    }

    async preload() {
        this.mousePosition = {x: 0, y: 0};

        this.keyboardInputs = {};
        this.mouseInputs = {};

        this.#setupListeners();

        this.gamePads = navigator.getGamepads(); // get the gamepads that are connected to the system <---- NOTE: This is not implemented in the current version of the engine (Gamepad input is not implemented in the current version of the engine.)
    }

    #setupListeners(){
        document.addEventListener('contextmenu', (event) => event.preventDefault());

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

        window.addEventListener('mousemove', (event) => {
            this.mousePosition = {x: event.clientX, y: event.clientY};
        });

        window.addEventListener('gamepadconnected', (event) => {
            this.gamePads = navigator.getGamepads();
        });
    }

    addKeyboardInput(name, type='bool'){    
        // Add a new input to the keyboard inputs

        if (type === 'bool') {
            this.keyboardInputs[name] = new BoolInput(name);
        } else if (type === 'axis') {
            this.keyboardInputs[name] = new AxisInput(name);
        }

        return this.keyboardInputs[name];
    } 

    addMouseInput(name){
        // Add a new input to the mouse inputs
        this.mouseInputs[name] = new MouseInput(name);

        return this.mouseInputs[name];
    }

    // NOTE: This is a placeholder function for adding gamepad input. Gamepad input is not implemented in the current version of the engine.
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

    // Add a keybind to the bool input
    addKeybind(key){
        this.binds.push({key, value: true});
        return this;
    }

    // Remove a keybind from the bool input
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

    // Add a keybind to the axis input
    addKeybind(key, axisValue){
        if (axisValue > 1 || axisValue < -1) throw new Error('Axis value must be between -1 and 1');
        if (typeof axisValue !== 'number') throw new Error('Axis value must be a number');

        this.binds.push({key, value: axisValue});

        return this;
    }

    // Remove a keybind from the axis input
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
        // Add a keybind to the mouse input

        if (typeof button === 'string') button = parseInt(button);
        if (button > 2 || button < 0) throw new Error('Mouse button must be between 0 and 2');
        if (typeof button !== 'number') throw new Error('Mouse button must be a number (or a string that can be parsed to a number)');

        this.binds.push({button, value: true});
        return this;
    }

    removeKeybind(button){
        // Remove a keybind from the mouse input

        this.binds = this.binds.filter(b => b.button !== button);
        return this;
    }
}

