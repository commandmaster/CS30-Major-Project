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
                position: Number(rigidBody.rigidBody.position.toFixed(2)),
                rotation: Number(rigidBody.rigidBody.rotation.toFixed(2)),
                velocity: Number(rigidBody.rigidBody.velocity.toFixed(2)),
                acceleration: Number(rigidBody.rigidBody.acceleration.toFixed(2)),
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

    }

    static parseEntityPacket(packet){  

    }
}