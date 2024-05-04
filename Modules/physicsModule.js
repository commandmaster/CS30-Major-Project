import { ModuleAPI, Module } from "./moduleBase.js";
import { Component } from "./entityModule.js";

const Engine = Matter.Engine,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Render = Matter.Render

class TransformComponent extends Component{
    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);

        this.position = componentConfig.position;
        this.rotation = componentConfig.rotation;
        this.scale = componentConfig.scale;
    }
}

class RigidbodyComponent extends Component{
    acceleration = {x: 0, y: 0};
    velocity = {x: 0, y: 0};
    position = {x: 0, y: 0};
    rotation = 0;
    angularVelocity = 0;
    angularAcceleration = 0;
    mass = 0;
    coliders = [];

    constructor(entity, parentModule, engineAPI, componentConfig){
        super(entity, parentModule, engineAPI, componentConfig);
        this.position = componentConfig.position;
        this.rotation = componentConfig.rotation;
        this.mass = componentConfig.mass;
        
        this.colliders = this.#generateColliders(componentConfig.colliders);
        
    }

    #generateColliders(colliders){
        return colliders.map(collider => {
            switch(collider.type){
                case 'rectangle':
                    return Bodies.rectangle(collider.x, collider.y, collider.width, collider.height);
                case 'circle':
                    return Bodies.circle(collider.x, collider.y, collider.radius);
            }
        });
    }
}









class Vec2{
    static normalize(v){
        // Normalize a vector and return the result as a new Vec2
        const mag = v.mag;
        return Vec2.divide(v, mag);
    }

    static dot(v1, v2){
        // |v1| * |v2| * cos(theta)

        // dot product of two vectors
        // returns the projection of v1 onto v2
        const slope = (v2.y - v1.y) / (v2.x - v1.x);
        const optimizedRatio = (Math.sqrt(1 + slope ** 2) / (1 + slope ** 2)) // Faster then running cos(tan^-1(slope)) - returns the same value
        return v1.mag * v2.mag * optimizedRatio;
    }

    static sub(v1, v2){
        // Subtract two vectors and return the result as a new Vec2
        return new Vec2(v2.x - v1.x, v2.y - v1.y);
    }

    static add(v1, v2){
        // Add two vectors and return the result as a new Vec2
        return new Vec2(v1.x + v2.x, v1.y + v2.y);
    }

    static scale(v, scalar){
        // Scale a vector by a scalar value and return the result as a new Vec2
        return new Vec2(v.x * scalar, v.y * scalar);
    }

    static divide(v, scalar){
        // Divide a vector by a scalar value and return the result as a new Vec2
        return new Vec2(v.x / scalar, v.y / scalar);
    }

    constructor(x, y){
        this.x = x;
        this.y = y;

        // Calculate the magnitude of the vector
        this.mag = this.#calculateMag();
        this.isNormalized = false;
        this.normalized = this.#calculateNormalized();
    }

    sub(v){
        // Subtract a vector from this vector
        this.x -= v.x;
        this.y -= v.y;

        return this;
    }

    add(v){
        // Add a vector to this vector
        this.x += v.x;
        this.y += v.y;

        return this;
    }

    scale(scalar){
        // Scale this vector by a scalar value
        this.x *= scalar;
        this.y *= scalar;

        return this;
    }

    divide(scalar){
        // Divide this vector by a scalar value
        this.x /= scalar;
        this.y /= scalar;

        return this;
    }

    normalize(){
        // Normalize this vector
        const mag = this.mag;
        this.divide(mag);

        return this;
    }

    dot(v){
        // Dot product of this vector and another vector
        // Returns the projection of this vector onto the other vector
        const slope = (v.y - this.y) / (v.x - this.x);
        const optimizedRatio = (Math.sqrt(1 + slope ** 2) / (1 + slope ** 2)) // Faster then running cos(tan^-1(slope)) - returns the same value
        return this.mag * v.mag * optimizedRatio;
    }

    clone(){
        // Clone this vector and return the new vector
        return new Vec2(this.x, this.y);
    }

    serialize(precision=2){
        // Serialize this vector
        const x = this.x.toFixed(precision); // Round the x value to the specified precision
        const y = this.y.toFixed(precision); // Round the y value to the specified precision
        return {x, y};
    }

    #calculateMag(){
        // Pythagorean theorem to calculate the magnitude of the vector
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    #calculateNormalized(){
        // Calculate the normalized vector
        const mag = this.mag;
        return new Vec2(this.x / mag, this.y / mag);
    }

    
    get mag(){
        this.mag = this.#calculateMag();
        return this.mag;
    }

    get normalized(){
        this.normalized = this.#calculateNormalized();
        return this.normalized;
    }

    get x(){
        return this.x;
    }

    get y(){
        return this.y;
    }

    set x(value){
        this.x = value;
        this.mag = this.#calculateMag();
        this.normalized = this.#calculateNormalized();
    }

    set y(value){
        this.y = value;
        this.mag = this.#calculateMag();
        this.normalized = this.#calculateNormalized();
    }
}

class ConvexCollider{
    constructor(x, y, rotation, vertices){
        this.x = x;
        this.y = y;
        this.rotation = 0; // Rotation of the collider
        this.vertices = vertices; // the vertices of the collider relative to (0, 0) <- the center of the collider
    }

    addVertex(vertex){
        this.vertices.push(vertex);
    }

    #calculateVertices(){
        // Calculate the vertices of the collider
        const vertices = [];
        for (let i = 0; i < this.vertices.length; i++){
            const vertex = this.vertices[i];
            // compute 2d transformation to get the vertex relative to the center of the collider
            // translate the origin to the center of the collider
            // then using x = x * cos(theta) - y * sin(theta) and y = x * sin(theta) + y * cos(theta)

            const point1 = Vec2.sub(vertex, new Vec2(this.x, this.y)); // Translate the vertex to the center of the collider
            const x = point1.x * Math.cos(this.rotation) - point1.y * Math.sin(this.rotation); // Rotate the vertex
            const y = point1.x * Math.sin(this.rotation) + point1.y * Math.cos(this.rotation); // Rotate the vertex

            vertices.push(new Vec2(x, y)); // Add the vertex to the vertices array
        }

        return vertices;
    }

    get vertices(){
        // Calculate the vertices of the collider
        return this.#calculateVertices();
    }

    set vertices(value){
        this.vertices = value; // Set the vertices of the collider
    }

    get x(){
        return this.x;
    }

    set x(value){
        this.x = value; // Set the x position of the collider
    }

    get y(){
        return this.y;
    }

    set y(value){
        this.y = value; // Set the y position of the collider
    }
}



class RectangleCollider extends ConvexCollider{
    constructor(x, y, rotation, width, height){
        super(x, y, rotation, [
            new Vec2(-width / 2, -height / 2),
            new Vec2(width / 2, -height / 2),
            new Vec2(width / 2, height / 2),
            new Vec2(-width / 2, height / 2)
        ]);
    }
}

class CircleCollider{
    constructor(x, y, radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}

class Rigidbody{
    velocity = new Vec2(0, 0); // Linear velocity
    acceleration = new Vec2(0, 0); // Linear acceleration
    angularVelocity = 0; // Angular velocity
    angularAcceleration = 0; // Angular acceleration
    constructor(position, rotation, mass, bounce, colliders){
        // Initialize the rigidbody with it's basic properties
        this.position = (position instanceof Vec2) ? position : new Vec2(position.x, position.y); // Position of the rigidbody (make sure it is a Vec2 by checking if it is an instance of Vec2)
        this.rotation = rotation;
        this.mass = mass;
        this.bounce = bounce; // Coefficient of restitution (bounciness) of the rigidbody, 0 = no bounce, 1 = perfect bounce,  1 < = gain energy
        this.colliders = colliders; // Must be an array of collider class instances

        // Calculate the transform of the rigidbody (inertia tensor, etc...)
        this.#calculateTransform();
    }

    #calculateTransform(){
        this.inertiaTensor = this.#calculateInertiaTensor();
    }

    #calculateInertiaTensor(){
        // Calculate the inertia tensor of the rigidbody
        // Very approximate calculation of the inertia tensor of the rigidbody - Very complex subject that I honestly don't understand very well
        // I = sum(m * r^2) where m is the mass of the rigidbody and r is the distance from the center of mass to the point of collision - r is the magnitude of the vector from the center of mass to the point of collision

        // Calculate the inertia tensor for each collider
        let inertiaTensor = 0; // Initialize the inertia tensor to 0
        for (const collider of this.colliders){
            const r = Vec2.sub(new Vec2(collider.x, collider.y), this.position).mag; // Calculate the distance from the center of mass to the point of collision
            const mass = this.mass; // Get the mass of the rigidbody
            inertiaTensor += mass * r ** 2; // Calculate the inertia tensor for the collider and add it to the total inertia tensor
        }

        return inertiaTensor; // Return the inertia tensor
    }

    addCollider(collider){
        this.colliders.push(collider);
    }

    update(dt){
        // use implicit euler integration to update the position and velocity of the rigidbody
        //https://gafferongames.com/post/integration_basics/

        // Update the linear velocity
        this.velocity.add(Vec2.scale(this.acceleration, dt)); 
        
        // Update the angular velocity
        this.angularVelocity += this.angularAcceleration * dt; 

        // Update the position
        this.position.add(Vec2.scale(this.velocity, dt)); 

        // Update the rotation
        this.rotation += this.angularVelocity * dt; 
    }

    get colliders(){
        this.#calculateTransform(); // Recalculate the transform before returning the colliders
        return this.colliders;
    }

    set colliders(value){
        this.#calculateTransform(); // Recalculate the transform before setting the colliders
        this.colliders = value;
    }

    get position(){
        this.#calculateTransform(); // Recalculate the transform before returning the position
        return this.position;
    }

    set position(value){
        this.#calculateTransform(); // Recalculate the transform before setting the position
        this.position = value;
    }

    get rotation(){
        this.#calculateTransform(); // Recalculate the transform before returning the rotation
        return this.rotation;
    }

    set rotation(value){
        this.#calculateTransform(); // Recalculate the transform before setting the rotation
        this.rotation = value;
    }

    get mass(){
        this.#calculateTransform(); // Recalculate the transform before returning the mass
        return this.mass;
    }

    set mass(value){
        this.#calculateTransform(); // Recalculate the transform before setting the mass
        this.mass = value;
    }

    get bounce(){
        this.#calculateTransform(); // Recalculate the transform before returning the bounce
        return this.bounce;
    }

    set bounce(value){
        this.#calculateTransform(); // Recalculate the transform before setting the bounce
        this.bounce = value;
    }

    get inertiaTensor(){
        this.#calculateTransform(); // Recalculate the transform before returning the inertia tensor
        return this.inertiaTensor;
    }





}

    

class SAT{
    // Separating Axis Theorem - Used for collision detection between convex shapes - Theory learned at https://dyn4j.org/2010/01/sat/
    static checkCollision(collider1, collider2){
        const axes1 = SAT.getAxes(collider1); // Get the axes of the first collider to test against
        const axes2 = SAT.getAxes(collider2); // Get the axes of the second collider to test against

        // Keep track of the axes tested to see check that we don't test any parallel axes
        const testedAxes = [];
        


        // Initialize the minimum translation vector (MTV)
        // The MTV is the smallest vector that can be applied to the first collider to separate it from the second collider
        // Seperate the mtw into the vector and the overlap (axis and overlap distance respectively)
        let mtvAxis = null; 
        let mtvOverlap = Infinity; // Initialize the overlap to infinity

        for (const axis of axes1){
            for (const testedAxis of testedAxes){
                if (SAT.checkParallelAxis(axis, testedAxis)){
                    continue; // Skip the axis if it is parallel to a previously tested axis
                }
            }

            testedAxes.push(axis); // Add the axis to the tested axes (to avoid testing the same axis multiple times)

            const projection1 = SAT.projectAxis(axis, collider1); // Project the first collider onto the axis
            const projection2 = SAT.projectAxis(axis, collider2); // Project the second collider onto the axis

            const overlap = SAT.getProjectionOverlap(projection1, projection2); // Get the overlap of the projections

            if (overlap <= 0){
                return false; // Return false if there is no overlap
            }

            if (overlap < mtvOverlap){
                mtvOverlap = overlap; // Update the overlap if it is less than the current overlap
                mtvAxis = axis; // Update the axis if it is the smallest overlap
            }
        }

        for (const axis of axes2){
            for (const testedAxis of testedAxes){
                if (SAT.checkParallelAxis(axis, testedAxis)){
                    continue; // Skip the axis if it is parallel to a previously tested axis
                }
            }

            testedAxes.push(axis); // Add the axis to the tested axes (to avoid testing the same axis multiple times)

            const projection1 = SAT.projectAxis(axis, collider1); // Project the first collider onto the axis
            const projection2 = SAT.projectAxis(axis, collider2); // Project the second collider onto the axis

            const overlap = SAT.getProjectionOverlap(projection1, projection2); // Get the overlap of the projections

            if (overlap <= 0){
                return false; // Return false if there is no overlap
            }

            if (overlap < mtvOverlap){
                mtvOverlap = overlap; // Update the overlap if it is less than the current overlap
                mtvAxis = axis; // Update the axis if it is the smallest overlap
            }
        }

        const unitMtvDirection = mtvAxis.normalized; // Get the unit vector of the MTV axis - Use this as the axis of the MTV
        const mtv = Vec2.scale(unitMtvDirection, mtvOverlap); // Scale the unit vector by the overlap to get the MTV

        return {axis: unitMtvDirection, overlap: mtvOverlap, mtv}; // Return the MTV
    }

    static checkParallelAxis(axis1, axis2){
        // Check if two axes are parallel
        const dotProduct = Vec2.dot(axis1, axis2); // Dot product of the two axes
        return Math.abs(dotProduct) === 1; // Return true if the dot product is 1 (axes are parallel)
    }

    static projectAxis(axis, collider){
        // Project the collider onto the axis and return the min and max values
        let min = Vec2.dot(axis, collider.vertices[0]); // Dot product of the first vertex and the axis
        let max = min; // Initialize the max value to the min value for now
        for (const vertex of collider.vertices){
            const dotProduct = Vec2.dot(axis, vertex); // Dot product of the vertex and the axis (projection of the vertex onto the axis)

            if (dotProduct < min){
                min = dotProduct; // Update the min value if the dot product is less than the current min
            }

            if (dotProduct > max){
                max = dotProduct; // Update the max value if the dot product is greater than the current max
            }
        }

        return {min, max}; // Return the min and max values
    }

    static getAxes(collider){
        const axes = []; // Array to store the axes
        for (let i = 0; i < collider.vertices.length; i++){
            const vertex1 = collider.vertices[i]; // Get the first vertex
            const vertex2 = collider.vertices[(i + 1) % collider.vertices.length]; // Get the second vertex (wraps around to the first vertex if the last vertex is reached)

            const edge = Vec2.sub(vertex1, vertex2); // Get the edge vector (vector from vertex1 to vertex2)
            const normal = new Vec2(edge.y, -edge.x).normalize(); // Get the normal vector of the edge vector (perpendicular to the edge vector)

            axes.push(normal); // Add the normal vector to the axes array
        }

        return axes; // Return the axes array
    }

    static getProjectionOverlap(projection1, projection2){
        // Check if the projections overlap and return the overlap
        if (projection1.min < projection2.min){
            return projection1.max - projection2.min; // Return the overlap if projection1 is to the left of projection2
        } else {
            return projection2.max - projection1.min; // Return the overlap if projection2 is to the left of projection1
        }
    }
}

class CollisionData{
    constructor(axis, overlap, radius1, radius2){
        this.axis = axis; // Minimum translation vector (MTV) axis
        this.overlap = overlap; // Overlap distance
        this.radius1 = radius1; // Distance from the center of the first rigidbody to the point of collision
        this.radius2 = radius2; // Distance from the center of the second rigidbody to the point of collision
    }
}

class CollisionSolver{
    static resolveCollision(rigidbody1, rigidbody2, collisionData){
        // Resolve the collision between two rigidbodies
        const collisionNormal = collisionData.axis; // Get the collision normal (MTV axis)
        const seperationDistance = collisionData.overlap; // Get the seperation distance (overlap distance)
        const seperationAxis = collisionNormal.clone(); // Clone the collision normal to get the seperation axis
        const r1 = collisionData.radius1; // Get the distance from the center of the first rigidbody to the point of collision
        const r2 = collisionData.radius2; // Get the distance from the center of the second rigidbody to the point of collision

        
        // Apply the minimum translation vector (MTV) to separate the rigidbodies
        const massRatio1 = 1 - (rigidbody1.mass / (rigidbody1.mass + rigidbody2.mass)); // Calculate the mass ratio of the first rigidbody
        const massRatio2 = 1 - (rigidbody2.mass / (rigidbody1.mass + rigidbody2.mass)); // Calculate the mass ratio of the second rigidbody

        const mtv1 = Vec2.scale(seperationAxis, seperationDistance * massRatio1); // Scale the seperation axis by a ratio of the seperation distance and the mass of the first rigidbody
        const mtv2 = Vec2.scale(seperationAxis, seperationDistance * massRatio2); // Scale the seperation axis by a ratio of the seperation distance and the mass of the second rigidbody in the opposite direction

        rigidbody1.position.add(mtv1); // Apply the MTV to the first rigidbody
        rigidbody2.position.sub(mtv2); // Apply the MTV in the opposite direction to the second rigidbody


        // First calculate the impulse to apply to the rigidbodies - https://research.ncl.ac.uk/game/mastersdegree/gametechnologies/physicstutorials/5collisionresponse/Physics%20-%20Collision%20Response.pdf

        // linear impulse
        const coefficientOfRestitution = rigidbody1.bounce * rigidbody2.bounce; // Combine the bounciness of the two rigidbodies
       
        const relativeVelocity = Vec2.sub(rigidbody2.velocity, rigidbody1.velocity); // Calculate the relative velocity of the two rigidbodies
        const relativeVelocityAlongNormal = Vec2.dot(relativeVelocity, collisionNormal).scale(1 + coefficientOfRestitution).scale(-1); // Calculate the relative velocity along the collision normal

        const totalInverseMass = (1 / rigidbody1.mass) + (1 / rigidbody2.mass); // Calculate the total inverse mass of the two rigidbodies

        // angular impulse



        // calculate the final impulse
        const impulse = relativeVelocityAlongNormal.divide(totalInverseMass); // Calculate the impulse to apply to the rigidbodies

        rigidbody1.velocity.add(Vec2.scale(impulse.dot(collisionNormal), 1 / rigidbody1.mass)); // Apply the impulse to the first rigidbody
        rigidbody2.velocity.sub(Vec2.scale(impulse.dot(collisionNormal), 1 / rigidbody2.mass)); // Apply the impulse to the second rigidbody


        // Next calculate the angular impulse to apply to the rigidbodies





        return {rigidbody1, rigidbody2}; // Return the updated rigidbodies
        
    }
}



export class PhysicsAPI extends ModuleAPI {
    static RigidbodyComponent = RigidbodyComponent;
    static TransformComponent = TransformComponent;
    static SAT = SAT;
    static Vec2 = Vec2;
    static RectangleCollider = RectangleCollider;
    static CircleCollider = CircleCollider;
    static Rigidbody = Rigidbody;
    static CollisionSolver = CollisionSolver;

    constructor(engineAPI, module) {
        super(engineAPI, module);
    }
}


// export class PhysicsModule extends Module {
//       //#region Private Fields
//       #lastPhysicsUpdate = performance.now();
//       #timeStepLimit = 50; //Unit: ms, Prevents spiral of death and a bug when alt tabbing causes dt to be very large and the physics to break
//       //#endregion
      
//     constructor(engineAPI) {
//         super(engineAPI);

//         this.matterEngine = Engine.create({gravity: {x: 0, y: 1}});
//         this.matterWorld = this.matterEngine.world;
        
//         this.debugMode = true;

//         this.rigidBodies = [];
//     }

//     start() {
        
//     }

//     update(dt) {
//         const timeSinceLastUpdate = Math.min(performance.now() - this.#lastPhysicsUpdate, this.#timeStepLimit); // Prevents spiral of death and a bug when alt tabbing causes dt to be very large and the physics to break
//         Engine.update(this.matterEngine, timeSinceLastUpdate);
//         this.#lastPhysicsUpdate = performance.now();
        

//         for (const body of this.rigidBodies){
//             body.Update(this.debugMode);
//         }
//     }



//     // called from within the rigidbody component
//     addRigidBody(rigidBodyComponent){
//         this.rigidBodies.push(rigidBodyComponent);
//         Matter.World.add(this.matterWorld, rigidBodyComponent.composite);
//     }

//     debug(enable=true){
//         this.debugMode = enable;
//     }

//     enableDebug(){
//         this.debug(true);
//     }

//     disableDebug(){
//         this.debug(false);
//     }

// }


export class PhysicsModule extends Module{
    constructor(engineAPI){
        super(engineAPI);

        this.rigidBodies = [];
    }

    preload(){
            
    }

    start(){
        // setup test senario
    }

    update(dt){
        for (const body of this.rigidBodies){
            body.update();
        }
    }
}