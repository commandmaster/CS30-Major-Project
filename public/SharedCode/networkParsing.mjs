export class NetworkParser{
    static encodePlayerIntoPacket(playerEntity){
        // encode physics data, animation state, and other relevant data into a packet
       const packet = {
            name: playerEntity.name,
            physicsData: {
                
            },
            animationData: {
                    
            }
       } 

        // physics data
        const rigidBody = playerEntity.getComponent('rigidbody');
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
        const animationComponent = playerEntity.getComponent('animation');
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

            if (input.value === input.defaultValue) continue;

            packet.keyboardInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
                pressed: input.pressed,
            }
        }

        for (const inputName in exportedInputs.mouseInputs){
            const input = exportedInputs.mouseInputs[inputName];

            if (input.value === input.defaultValue) continue;

            packet.mouseInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
                pressed: input.pressed,
            }
        }

        for (const inputName in exportedInputs.gamepadInputs){
            const input = exportedInputs.gamepadInputs[inputName];

            if (input.value === input.defaultValue) continue;

            packet.gamepadInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
                pressed: input.pressed,
            }
        }

        return packet;
    }

    encodeEntitiesIntoPacket(entities){
        // encode the entities into a packet
        const packet = {
            entities: []
        }

        for (const entity of entities){
            const encodedEntity = this.encodeEntityIntoPacket(entity);
            packet.entities.push(encodedEntity);
        }

        return packet;
    }

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

    static encodeServerEntitesIntoPacket(entities){
        // encode the entities into a packet
        const packet = {
            entities: {}
        }


        for (const entityName in entities){
            const encodedEntity = this.encodeServerEntityIntoPacket(entities[entityName]);
            packet.entities[entityName] = encodedEntity;
        }

        return packet;
    }

    static createClientPacket(playerPacket, inputsPacket){
        const clientPacket = {
            playerPacket,
            inputsPacket
        }

        return clientPacket; 
    }

    static createServerPacket(BE_player, BE_entities){
        const serverPacket = {
            playerEntity: this.encodeServerEntityIntoPacket(BE_player),
            otherEntities: this.encodeServerEntitesIntoPacket(BE_entities)
        }

        if (typeof serverPacket.otherEntities === 'array') serverPacket.otherEntities.filter(entity => entity.name !== BE_player.name);
        if (typeof serverPacket.otherEntities === 'object') delete serverPacket.otherEntities[BE_player.name];

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
                pressed: input.pressed,
            }
        }

        for (const inputName in inputsPacket.mouseInputs){
            const input = inputsPacket.mouseInputs[inputName];
            inputs.mouseInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
                pressed: input.pressed,
            }
        }

        for (const inputName in inputsPacket.gamepadInputs){
            const input = inputsPacket.gamepadInputs[inputName];
            inputs.gamepadInputs[inputName] = {
                value: input.value,
                needsReset: input.needsReset,
                pressed: input.pressed,  
            }
        }

        return inputs;
    }

    static decodePlayerFromPacket(serverPacket){
        // return the entity packet as a state that can be used to update the BACKEND entity (the server-side entity) 
        const playerPacket = serverPacket.playerPacket;

        const entityState = {
            name: playerPacket.name,
            physicsData: playerPacket.physicsData,
            animationData: playerPacket.animationData
        }

        return entityState;
    }
}