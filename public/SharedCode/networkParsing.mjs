export class NetworkParser{
    static encodeEntityIntoPacket(entity){
        // encode physics data, animation state, and other relevant data into a packet
       const packet = {
            name: entity.name,
            physicsData: {
                
            },
            animationData: {
                    
            }
       } 

        // physics data
        const rigidBody = entity.getComponent('rigidbody');
        if (rigidBody !== undefined){
            const rigidBodyData = {
                position: rigidBody.rigidBody.position.toFixed(2),
                rotation: Number(rigidBody.rigidBody.rotation.toFixed(2)),
                velocity: rigidBody.rigidBody.velocity.toFixed(2),
                acceleration: rigidBody.rigidBody.acceleration.toFixed(2),
                angularVelocity: Number(rigidBody.rigidBody.angularVelocity.toFixed(2)),
            }

            packet.physicsData = rigidBodyData;
        }

        // animation data
        const animationComponent = entity.getComponent('animation');
        if (animationComponent !== undefined){
            const animationData = {
                currentAnim: animationComponent.currentAnimationName,
                frame: animationComponent.currentFrame,
            }

            packet.animationData = animationData;
        }

        if (Object.keys(packet.physicsData).length === 0) delete packet.physicsData;
        if (Object.keys(packet.animationData).length === 0) delete packet.animationData;

        return packet;
    }

    static encodeInputsIntoPacket(exportedInputs){
        // the exported inputs are the inputs that are exported by the InputModule using it's built-in method

        // encode the inputs into a packet
        const packet = {
            keyboardInputs: {},
            mouseInputs: {},
            gamepadInputs: {}
        }

        for (const inputName in exportedInputs.keyboardInputs){
            const input = exportedInputs.keyboardInputs[inputName];
            packet.keyboardInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
            }
        }

        for (const inputName in exportedInputs.mouseInputs){
            const input = exportedInputs.mouseInputs[inputName];
            packet.mouseInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
            }
        }

        for (const inputName in exportedInputs.gamepadInputs){
            const input = exportedInputs.gamepadInputs[inputName];
            packet.gamepadInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
            }
        }

        return packet;
    }

    static encodeServerEntityIntoPacket(entity){
        // encode physics data, animation state, and other relevant data into a packet
        // similar to the encodeEntityIntoPacket method but this is used to encode the server-side entity (the backend entity)
        // The backend entity has a slightly different structure than the frontend entity which is why this method is needed


        const packet = {
            name: entity.name,
            physicsData: {
                
            },
            animationData: {
                    
            }
       } 

        // physics data
        const rigidBody = entity.rb;
        if (rigidBody !== undefined){
            const rigidBodyData = {
                position: rigidBody.position.toFixed(2),
                rotation: Number(rigidBody.rotation.toFixed(2)),
                velocity: rigidBody.velocity.toFixed(2),
                acceleration: rigidBody.acceleration.toFixed(2),
                angularVelocity: Number(rigidBody.angularVelocity.toFixed(2)),
            }

            packet.physicsData = rigidBodyData;
        }

        // animation data
        const animationComponent = entity.animationComponent;
        if (animationComponent !== undefined){
            const animationData = {
                currentAnim: animationComponent.currentAnimationName,
                frame: animationComponent.currentFrame,
            }

            packet.animationData = animationData;
        }

        if (Object.keys(packet.physicsData).length === 0) delete packet.physicsData;
        if (Object.keys(packet.animationData).length === 0) delete packet.animationData;

        return packet;
    }

    static createServerPacket(entityPacket, inputsPacket){
        const serverPacket = {
            entityPacket,
            inputsPacket
        }

        return serverPacket; 
    }

    static decodeInputsFromPacket(serverPacket){
        // not sticktly nessary now but will be very usefull in the future if the complexity of the inputs increases
        const inputsPacket = serverPacket.inputsPacket;

        const inputs = {
            keyboardInputs: {},
            mouseInputs: {},
            gamepadInputs: {}
        }

        for (const inputName in inputsPacket.keyboardInputs){
            const input = inputsPacket.keyboardInputs[inputName];
            inputs.keyboardInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
            }
        }

        for (const inputName in inputsPacket.mouseInputs){
            const input = inputsPacket.mouseInputs[inputName];
            inputs.mouseInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
            }
        }

        for (const inputName in inputsPacket.gamepadInputs){
            const input = inputsPacket.gamepadInputs[inputName];
            inputs.gamepadInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
            }
        }

        return inputs;
    }

    static decodeEntityFromPacket(serverPacket){
        // return the entity packet as a state that can be used to update the BACKEND entity (the server-side entity) 
        const entityPacket = serverPacket.entityPacket;

        const entityState = {
            name: entityPacket.name,
            physicsData: entityPacket.physicsData,
            animationData: entityPacket.animationData
        }

        return entityState;
    }
}