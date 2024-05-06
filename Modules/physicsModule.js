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
    static get zero(){
        return new Vec2(0, 0);
    }

    static midpoint(v1, v2){
        // Calculate the midpoint between two vectors
        const valueToAddToStartVector = Vec2.add(v1.clone().scale(-1), v2).scale(0.5);
        return Vec2.add(v1, valueToAddToStartVector);
    }

    static isEqual(v1, v2, tolerance=0.001){
        // Check if two vectors are equal
        return Math.abs(v1.x - v2.x) <= tolerance && Math.abs(v1.y - v2.y) <= tolerance;
    }

    static dist(v1, v2){
        // Calculate the distance between two vectors
        return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
    }

    static sqDist(v1, v2){
        // Calculate the squared distance between two vectors
        return (v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2;
    }

    static normalize(v){
        // Normalize a vector and return the result as a new Vec2
        const mag = v.mag;
        return Vec2.divide(v, mag);
    }

    static dot(v1, v2){
        // Dot product of two vectors
        // Returns the projection of the first vector onto the second vector

        let result = 0;
        result += v1.x * v2.x;
        result += v1.y * v2.y;

        return result;
    }

    static cross(v1, v2){
        // cross product of two vectors
        return v1.x*v2.y - v1.y*v2.x;
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

    #x;
    #y;
    #mag;
    #isNormalized;
    #normalized;
    #angle;
    constructor(x, y){
        this.#x = x;
        this.#y = y;

        // Calculate the magnitude of the vector
        this.#mag = this.#calculateMag();
        this.#isNormalized = false;
        this.#angle = Math.atan2(this.y, this.x);
    }

    sub(v){
        // Subtract a vector from this vector
        this.#x -= v.x;
        this.#y -= v.y;

        return this;
    }

    add(v){
        // Add a vector to this vector
        this.#x += v.x;
        this.#y += v.y;

        return this;
    }

    dist(v){
        // Calculate the distance between this vector and another vector
        return Math.sqrt((v.x - this.#x) ** 2 + (v.y - this.#y) ** 2);
    }

    sqDist(v){
        // Calculate the squared distance between this vector and another vector
        return (v.x - this.#x) ** 2 + (v.y - this.#y) ** 2;
    }

    isEqual(v, tolerance=0.001){
        // Check if this vector is equal to another vector
        return Math.abs(v.x - this.#x) <= tolerance && Math.abs(v.y - this.#y) <= tolerance;
    }

    scale(scalar){
        // Scale this vector by a scalar value
        this.#x *= scalar;
        this.#y *= scalar;

        return this;
    }

    divide(scalar){
        // Divide this vector by a scalar value
        this.#x /= scalar;
        this.#y /= scalar;

        return this;
    }

    normalize(){
        // Normalize this vector
        const mag = this.#mag;
        this.#x /= mag;
        this.#y /= mag;

        return this;
    }

    dot(v){
        // Dot product of this vector and another vector
        // Returns the projection of this vector onto the other vector

        let result = 0;
        result += this.#x * v.x;
        result += this.#y * v.y;

        return result;
    }

    cross(v){
        // Cross product of this vector and another vector
        return this.#x*v.y - this.#y*v.x;
    }

    midpoint(v){
        // Calculate the midpoint between this vector and another vector
        const valueToAddToStartVector = Vec2.add(this.clone().scale(-1), v).scale(0.5);
        return Vec2.add(this, valueToAddToStartVector);
    }

    clone(){
        // Clone this vector and return the new vector
        return new Vec2(this.#x, this.#y);
    }


    serialize(precision=2){
        // Serialize this vector
        const x = Number(this.#x.toFixed(precision)); // Round the x value to the specified precision
        const y = Number(this.#y.toFixed(precision)); // Round the y value to the specified precision
        return {x, y};
    }

    #calculateMag(){
        // Pythagorean theorem to calculate the magnitude of the vector
        return Math.sqrt((this.#x ** 2) + (this.#y ** 2));
    }

    #calculateNormalized(){
        // Calculate the normalized vector
        return {x: this.#x / this.#mag, y: this.#y / this.#mag};
    }

    
    get mag(){
        this.#mag = this.#calculateMag();
        return this.#mag;
    }

    set mag(value){
        this.#mag = value;
        this.#isNormalized = false;
    }

    get normalized(){
        this.#normalized = this.#calculateNormalized();
        return new Vec2(this.#normalized.x, this.#normalized.y);
    }

    get x(){
        return this.#x;
    }

    get y(){
        return this.#y;
    }

    get angle(){
        this.#angle = Math.atan2(this.#y, this.#x);
        return this.#angle;
    }

    set angle(value){
        this.#angle = value;
        this.#x = this.#mag * Math.cos(value);  
        this.#y = this.#mag * Math.sin(value);
        this.#normalized = this.#calculateNormalized();
    }

    set x(value){
        this.#x = value;
        this.mag = this.#calculateMag();
        this.normalized = this.#calculateNormalized();
    }

    set y(value){
        this.#y = value;
        this.mag = this.#calculateMag();
        this.#normalized = this.#calculateNormalized();
    }
}

class BoundingBox {
    constructor(position, width, height){
        this.position = position;
        this.width = width;
        this.height = height;
    }
}

class ConvexCollider{
    #vertices;
    #rotatedVertices;
    #position;
    constructor(rigidBody, offsetX, offsetY, rotation, mass, vertices){
        this.rigidBody = rigidBody; // RigidBody that the collider is attached to
        this.rotation = rotation; // Rotation of the collider
        this.#vertices = vertices; // the vertices of the collider relative to (0, 0) <- the center of the collider
        this.#rotatedVertices = []; // the vertices of the collider after rotation
        this.mass = mass; // Mass of the collider

        this.offset = new Vec2(offsetX, offsetY); // Offset of the collider from the center of the rigidbody
        this.#calculateWorldPosition(); // Calculate the world position of the collider
        this.#calculateVertices(); // Calculate the vertices of the collider

        this.boundingBox = this.#precomputeBoundingBox(); // Bounding box of the collider
        //this.boundingBox = new BoundingBox(this.#position, 0, 0); // Bounding box of the collider
        this.refresh(); // Refresh the collider (calculate the world position and vertices

        this.type = 'convex'; // Type of the collider
    }

    addVertex(vertex){
        this.#vertices.push(vertex);
        this.#calculateVertices();
    }

    #calculateWorldPosition(){
        // Do a transformation to get the position of the collider based on the rigidbody's position and rotation
        // translate the origin to the center of the rigidbody
        const P = Vec2.add(this.offset, this.rigidBody.position); // Translate the origin to the center of the rigidbody
        const A = this.rigidBody.position.clone(); // Get the position of the rigidbody
        const V = Vec2.sub(P, A); // Get the vector from the center of the rigidbody to the collider
        const x = V.x * Math.cos(this.rigidBody.rotation) - V.y * Math.sin(this.rigidBody.rotation); // Rotate the vector
        const y = V.x * Math.sin(this.rigidBody.rotation) + V.y * Math.cos(this.rigidBody.rotation); // Rotate the vector

        const rotated = new Vec2(x, y); // Get the rotated vector
        rotated.add(A); // Translate the vector back to the world position

        this.#position = rotated; // Set the position of the collider to the rotated vector
        
        return this.#position; // Return the position of the collider
    }

    #calculateVertices(){
        // Calculate the vertices of the collider
        const vertices = [];
        for (let i = 0; i < this.#vertices.length; i++){
            const vertex = this.#vertices[i];
            // compute 2d transformation to get the vertex relative to the center of the collider
            const P = Vec2.add(vertex, this.#position); // Translate the origin to the center of the collider
            const A = this.#position.clone(); // Get the position of the collider
            const V = Vec2.sub(P, A); // Get the vector from the center of the collider to the vertex
            const x = V.x * Math.cos(this.rotation) - V.y * Math.sin(this.rotation); // Rotate the vector
            const y = V.x * Math.sin(this.rotation) + V.y * Math.cos(this.rotation); // Rotate the vector

            const rotated = new Vec2(x, y); // Get the rotated vector
            rotated.add(A); // Translate the vector back to the world position

            vertices.push(rotated); // Add the rotated vertex to the vertices array
        }

        this.#rotatedVertices = vertices; // Set the vertices of the collider to the rotated vertices

        return vertices;
    }

    #precomputeBoundingBox(){
        if (this.rigidBody.mass === 0 || this.rigidBody.mass === Infinity || this.rigidBody.isStatic === true) {
            // find min and max x and y values of the vertices
            let minX = Infinity;
            let minY = Infinity;
            let maxX = -Infinity;
            let maxY = -Infinity;

            for (let i = 0; i < this.#rotatedVertices.length; i++){
                const vertex = this.#rotatedVertices[i];
                const vertexPosition = Vec2.add(vertex, this.#position);
                minX = Math.min(minX, vertexPosition.x);
                minY = Math.min(minY, vertexPosition.y);
                maxX = Math.max(maxX, vertexPosition.x);
                maxY = Math.max(maxY, vertexPosition.y);
            }

            const width = maxX - minX;
            const height = maxY - minY;

            return new BoundingBox(this.#position.clone(), width, height);
        }


        const boundingBox = new BoundingBox(this.#position.clone(), 0, 0);
        let vertexPositionSqDist = -Infinity;

        for (let i = 0; i < this.#vertices.length; i++){
            // find the farthest possible location for the vertex in the collider
            const vertex = this.#vertices[i];
            const vertexPosition = Vec2.add(vertex, this.#position);
            const sqDist = Vec2.sqDist(this.#position, vertexPosition);

            if (sqDist > vertexPositionSqDist){
                vertexPositionSqDist = sqDist;
            }
        }

        const width = Math.sqrt(vertexPositionSqDist) * 2;
        const height = width;

        boundingBox.width = width;
        boundingBox.height = height;

    

        boundingBox.position.sub(new Vec2(width / 2, height / 2));

        return boundingBox;
    }

    #calculateBoundingBox(){
        // // Calculate the bounding box of the collider
        this.boundingBox.position = Vec2.sub(this.#position, new Vec2(this.boundingBox.width / 2, this.boundingBox.height / 2));
        this.boundingBox.position.scale(-1);
    }

    update(dt){
        // Update the collider
        this.refresh(); // Refresh the collider
        
        this.debugDraw(); // Draw the collider for debugging purposes
    }

    refresh(){
        // Refresh the collider
        this.rotation = this.rigidBody.rotation; // Set the rotation of the collider to the rotation of the rigidbody
        this.#calculateWorldPosition(); // Calculate the world position of the collider
        this.#calculateVertices(); // Calculate the vertices of the collider
        
        this.#calculateBoundingBox(); // Calculate the bounding box of the collider
    }

    debugDraw(){
        const renderFunc = (canvas, ctx) => {
            //Draw the collider for debugging purposes
            ctx.beginPath();
            ctx.moveTo(this.#rotatedVertices[0].x, this.#rotatedVertices[0].y);
            for (let i = 1; i < this.#rotatedVertices.length; i++){
                ctx.lineTo(this.#rotatedVertices[i].x, this.#rotatedVertices[i].y);
            }

            ctx.lineTo(this.#rotatedVertices[0].x, this.#rotatedVertices[0].y);
            
            ctx.stroke();
            ctx.closePath();

            //Draw the bounding box
            const shouldDrawBoundingBox = false;

            if (!shouldDrawBoundingBox) return;
            ctx.beginPath();
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(this.boundingBox.position.x, this.boundingBox.position.y, this.boundingBox.width, this.boundingBox.height);
            ctx.stroke();
            ctx.closePath();

        }

        const renderAPI = this.rigidBody.engineAPI.getAPI('render');
        const task = new renderAPI.constructor.RenderTask(renderFunc);
        renderAPI.addTask(task);

    }

    get vertices(){
        // Calculate the vertices of the collider
        return this.#rotatedVertices;
    }

    get position(){
        // Calculate the world position of the collider
        return this.#position;
    }
}



class RectangleCollider extends ConvexCollider{
    constructor(rigidBody, x, y, rotation, mass, width, height){
        super(rigidBody, x, y, rotation, mass, [
            new Vec2(-width / 2, -height / 2),
            new Vec2(width / 2, -height / 2),
            new Vec2(width / 2, height / 2),
            new Vec2(-width / 2, height / 2)
        ]);
    }
}

class TriangleCollider extends ConvexCollider{
    constructor(rigidBody, x, y, rotation, mass, width, height){
        super(rigidBody, x, y, rotation, mass, [
            new Vec2(0, -height / 2),
            new Vec2(width / 2, height / 2),
            new Vec2(-width / 2, height / 2)
        ]);
    }
}

class CircleCollider{
    constructor(rigidBody, x, y, radius){
        this.rigidBody = rigidBody;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.type = 'circle';
    }
}

class Rigidbody{
    #velocity = new Vec2(0, 0); // Linear velocity
    #acceleration = new Vec2(0, 20); // Linear acceleration
    #angularVelocity = 0; // Angular velocity
    #angularAcceleration = 0; // Angular acceleration
    #position = new Vec2(0, 0); // Position of the rigidbody
    #rotation = 0; // Rotation of the rigidbody
    #mass = 0; // Mass of the rigidbody
    #bounce = 0.5; // Coefficient of restitution (bounciness) of the rigidbody
    #colliders = []; // Colliders attached to the rigidbody
    #inertiaTensor = 100000; // Inertia tensor of the rigidbody
    #centerOfMass = new Vec2(0, 0); // Center of mass of the rigidbody
    #engineAPI; // EngineAPI used to access the engine
    constructor(engineAPI, position, rotation, mass, bounce, colliders){
        // Initialize the rigidbody with it's basic properties
        this.#engineAPI = engineAPI; // EngineAPI used to access the engine
        this.#position = (position instanceof Vec2) ? position : new Vec2(position.x, position.y); // Position of the rigidbody (make sure it is a Vec2 by checking if it is an instance of Vec2)
        this.#rotation = rotation;
        this.#mass = mass;
        this.#bounce = bounce; // Coefficient of restitution (bounciness) of the rigidbody, 0 = no bounce, 1 = perfect bounce,  1 < = gain energy
        this.#colliders = colliders; // Must be an array of collider class instances

        // Calculate the transform of the rigidbody (inertia tensor, etc...)
        this.#calculateTransform();
    }

    #calculateTransform(){
        this.#centerOfMass = this.#calculateCenterOfMass();
    }


    #calculateCenterOfMass(){
        // Calculate the center of mass of the rigidbody
        // Center of mass is the average of the positions of the colliders and their masses
        let massAccumulator = 0; // Initialize the mass accumulator to 0
        let positionScaledAccumulator = new Vec2(0, 0); // Initialize the position scaled accumulator to 0

        for (const collider of this.#colliders){
            const mass = collider.mass; // Get the mass of the collider
            const position = collider.position; // Get the position of the collider

            positionScaledAccumulator.add(Vec2.scale(position, mass)); // Add the scaled position to the position scaled accumulator
            massAccumulator += mass; // Add the mass to the mass accumulator
        }

        this.#centerOfMass = Vec2.divide(positionScaledAccumulator, massAccumulator); // Return the center of mass

        return this.#centerOfMass; // Return the center of mass
    }

    addCollider(collider){
        this.#colliders.push(collider);
        this.#calculateTransform();
    }

    update(dt){
        // use implicit euler integration to update the position and velocity of the rigidbody
        //https://gafferongames.com/post/integration_basics/


        if (!(this.#mass === 0 || this.#mass === Infinity || this.isStatic === true)) {
                // Update the linear velocity
            this.#velocity.add(this.#acceleration.clone().scale(dt));
            
            // Update the angular velocity
            this.#angularVelocity += this.#angularAcceleration * (dt); 

            // Update the position
            this.#position.add(this.#velocity.clone().scale((dt)));

            // Update the rotation
            this.#rotation += this.#angularVelocity * (dt); 
        }
       
        this.#calculateTransform();
        this.#colliders.forEach(collider => collider.update((dt)));
    }

    get colliders(){
        this.#calculateTransform(); // Recalculate the transform before returning the colliders
        return this.#colliders;
    }

    set colliders(value){
        this.#calculateTransform(); // Recalculate the transform before setting the colliders
        this.#colliders = value;
    }

    get position(){
        this.#calculateTransform(); // Recalculate the transform before returning the position
        return this.#position;
    }

    set position(value){
        this.#calculateTransform(); // Recalculate the transform before setting the position
        this.#position = value;
    }

    get velocity(){
        this.#calculateTransform(); // Recalculate the transform before returning the velocity
        return this.#velocity;
    }

    set velocity(value){
        this.#velocity = value;
        this.#calculateTransform(); // Recalculate the transform after setting the velocity
        
    }

    get acceleration(){
        this.#calculateTransform(); // Recalculate the transform before returning the acceleration
        return this.#acceleration;
    }

    set acceleration(value){
        this.#acceleration = value;
        this.#calculateTransform(); // Recalculate the transform after setting the acceleration
    }

    get rotation(){
        this.#calculateTransform(); // Recalculate the transform before returning the rotation
        return this.#rotation;
    }

    set rotation(value){
        this.#calculateTransform(); // Recalculate the transform before setting the rotation
        this.#rotation = value;
    }

    get angularVelocity(){
        this.#calculateTransform(); // Recalculate the transform before returning the angular velocity
        return this.#angularVelocity;
    }

    set angularVelocity(value){
        this.#angularVelocity = value;
        this.#calculateTransform(); // Recalculate the transform after setting the angular velocity 
    }

    get angularAcceleration(){
        this.#calculateTransform(); // Recalculate the transform before returning the angular acceleration
        return this.#angularAcceleration;
    }

    set angularAcceleration(value){
        this.#angularAcceleration = value;
        this.#calculateTransform(); // Recalculate the transform after setting the angular acceleration
    }

    get mass(){
        this.#calculateTransform(); // Recalculate the transform before returning the mass
        return this.#mass;
    }

    set mass(value){
        this.#calculateTransform(); // Recalculate the transform before setting the mass
        this.#mass = value;
    }

    get bounce(){
        this.#calculateTransform(); // Recalculate the transform before returning the bounce
        return this.#bounce;
    }

    set bounce(value){
        this.#calculateTransform(); // Recalculate the transform before setting the bounce
        this.#bounce = value;
    }

    get inertiaTensor(){
        this.#calculateTransform(); // Recalculate the transform before returning the inertia tensor
        return this.#inertiaTensor;
    }

    get engineAPI(){
        return this.#engineAPI;
    }
}



class CollisionData{
    constructor(axis, overlap, collider1, collider2, collisionPoints,){
        this.axis = Vec2.normalize(axis); // Minimum translation vector (MTV) axis
        this.overlap = overlap; // Overlap distance
        this.collisionPoints = collisionPoints; // Point of collision
    }
}  


class AABB{
    static checkCollision(boundingBox1, boundingBox2){
        const width1 = boundingBox1.width; // Get the width of the first bounding box
        const height1 = boundingBox1.height; // Get the height of the first bounding box
        const width2 = boundingBox2.width; // Get the width of the second bounding box
        const height2 = boundingBox2.height; // Get the height of the second bounding box

        const x1 = boundingBox1.position.x; // Get the x position of the first bounding box
        const y1 = boundingBox1.position.y; // Get the y position of the first bounding box
        const x2 = boundingBox2.position.x; // Get the x position of the second bounding box
        const y2 = boundingBox2.position.y; // Get the y position of the second bounding box


        if (!(x1 < x2 + width2 && x1 + width1 > x2 && y1 < y2 + height2 && y1 + height1 > y2)) return false; // Return false if there is no overlap

        // find min overlap
        const overlapX = Math.min(x1 + width1 - x2, x2 + width2 - x1); // Calculate the overlap in the x direction
        const overlapY = Math.min(y1 + height1 - y2, y2 + height2 - y1); // Calculate the overlap in the y direction

        if (overlapX < overlapY){
            return new CollisionData(new Vec2(overlapX, 0).normalized, overlapX); // Return the collision data for the x direction
        } else {
            return new CollisionData(new Vec2(0, overlapY).normalized, overlapY); // Return the collision data for the y direction
        }
    }
}

class Intersection{
    static lineToLine(line1Start, line1End, line2Start, line2End){
        // Check if two lines intersect and give back the point of intersection as a Vec2 or false if they don't intersect - https://www.youtube.com/watch?v=bvlIYX9cgls

        const alphaNumerator = (line2End.x - line2Start.x) * (line2Start.y - line1Start.y) - (line2End.y - line2Start.y) * (line2Start.x - line1Start.x);
        const alphaDenominator = (line2End.x - line1Start.x) * (line1End.y - line1Start.y) - (line2End.y - line2Start.y) * (line1End.x - line1Start.x);

        const betaNumerator = (line1End.x - line1Start.x) * (line2Start.y - line1Start.y) - (line1End.y - line1Start.y) * (line2Start.x - line1Start.x);
        const betaDenominator = alphaDenominator;

        if (alphaDenominator === 0 && alphaNumerator === 0){
            // Lines are collinear - On top of each other
            // No intersection point so return false

            
            return false;
        }

        if (alphaDenominator === 0){
            return false;
        }

        const alpha = alphaNumerator / alphaDenominator;
        const beta = betaNumerator / betaDenominator;

        console.log(alpha, beta)

        if (alpha >= 0 && alpha <= 1 && beta >= 0 && beta <= 1){
            // Lines intersect
            const x = line1Start.x + alpha * (line1End.x - line1Start.x);
            const y = line1Start.y + alpha * (line1End.y - line1Start.y);

            const precision = 6; // avoid floating point weirdness
            return new Vec2(Number(x.toFixed(precision)), Number(y.toFixed(precision)));
        }

        return false;
    }

    static pointSegmentDistance(point, segmentStart, segmentEnd, isSquaredDistance = false){
        const segment = Vec2.sub(segmentEnd, segmentStart);
        const pointToStart = Vec2.sub(point, segmentStart);
        const segmentLength = segment.mag;
        const projection = Vec2.dot(pointToStart, segment)

        const normalizedProjection = projection / segmentLength ** 2;

        let closestPoint = null;
        if (normalizedProjection <= 0){
            closestPoint = segmentStart;
        } 
        else if (normalizedProjection >= 1){
            closestPoint = segmentEnd;
        }
        else {
            closestPoint = Vec2.add(segmentStart, Vec2.scale(segment, normalizedProjection));
        }
        // Calculate the distance between the point and the closest point on the segment

        if (isSquaredDistance){
            return Vec2.sqDist(point, closestPoint);
        }

        return Vec2.dist(point, closestPoint);
    }
}


class SAT{
    // Separating Axis Theorem - Used for collision detection between convex shapes - Theory learned at https://dyn4j.org/2010/01/sat/
    static checkCollision(collider1, collider2){
        // Ignore colliders not in bounds 
        if (AABB.checkCollision(collider1.boundingBox, collider2.boundingBox) === false) return false; // Return false if there is no overlap


        const axes1 = SAT.getAxes(collider1); // Get the axes of the first collider to test against
        const axes2 = SAT.getAxes(collider2); // Get the axes of the second collider to test against



        // debug draw the axes
        for (const axis of axes1){
            const renderFunc = (canvas, ctx) => {
                //draw the axis for debugging purposes
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.strokeWidth = 1;
                ctx.moveTo(collider1.position.x - axis.x * 500, collider1.position.y - axis.y * 500);
                ctx.lineTo(collider1.position.x + axis.x * 500, collider1.position.y + axis.y * 500);
                ctx.stroke();
                ctx.closePath();
                
            }
            


            const renderAPI = collider1.rigidBody.engineAPI.getAPI('render');
            const task = new renderAPI.constructor.RenderTask(renderFunc);
            renderAPI.addTask(task);
        }

        for (const axis of axes2){
            const renderFunc = (canvas, ctx) => {
                //draw the axis for debugging purposes
                ctx.beginPath();
                ctx.strokeStyle = 'red';
                ctx.strokeWidth = 1;
                ctx.moveTo(collider2.position.x - axis.x * 500, collider2.position.y - axis.y * 500);
                ctx.lineTo(collider2.position.x + axis.x * 500, collider2.position.y + axis.y * 500);
                ctx.stroke();
                ctx.closePath();
                
            }


            const renderAPI = collider1.rigidBody.engineAPI.getAPI('render');
            const task = new renderAPI.constructor.RenderTask(renderFunc);
            renderAPI.addTask(task);
        }



        // Keep track of the axes tested to see check that we don't test any parallel axes
        const testedAxes = [];
        


        // Initialize the minimum translation vector (MTV)
        // The MTV is the smallest vector that can be applied to the first collider to separate it from the second collider
        // Seperate the mtw into the vector and the overlap (axis and overlap distance respectively)
        let mtvAxis = null; 
        let mtvOverlap = Infinity; // Initialize the overlap to infinity

        for (const axis of axes1){
            axis.normalize(); // Normalize the axis
            for (const testedAxis of testedAxes){
                if (SAT.checkParallelAxis(axis, testedAxis)){
                    continue; // Skip the axis if it is parallel to a previously tested axis
                }
            }

            testedAxes.push(axis); // Add the axis to the tested axes (to avoid testing the same axis multiple times)

            const projection1 = SAT.projectAxis(axis, collider1); // Project the first collider onto the axis
            const projection2 = SAT.projectAxis(axis, collider2); // Project the second collider onto the axis

            //console.log(projection1, projection2)

           if (projection1.min > projection2.max || projection2.min > projection1.max){ 
                return false; // Return false if there is no overlap
           }

           const overlap = Math.min(projection2.max - projection1.min, projection1.max - projection2.min); // Calculate the overlap

            if (Math.abs(overlap) < mtvOverlap){
                mtvOverlap = Math.abs(overlap); // Update the overlap if it is less than the current overlap
                mtvAxis = axis; // Update the axis if it is the smallest overlap
            }
        }

        for (const axis of axes2){
            axis.normalize(); // Normalize the axis

            for (const testedAxis of testedAxes){
                if (SAT.checkParallelAxis(axis, testedAxis)){
                    continue; // Skip the axis if it is parallel to a previously tested axis
                }
            }

            testedAxes.push(axis); // Add the axis to the tested axes (to avoid testing the same axis multiple times)

            const projection1 = SAT.projectAxis(axis, collider1); // Project the first collider onto the axis
            const projection2 = SAT.projectAxis(axis, collider2); // Project the second collider onto the axis

            if (projection1.min > projection2.max || projection2.min > projection1.max){ 
                return false; // Return false if there is no overlap
           }

           const overlap = Math.min(projection2.max - projection1.min, projection1.max - projection2.min); // Calculate the overlap
            

            if (Math.abs(overlap) < mtvOverlap){
                mtvOverlap = Math.abs(overlap); // Update the overlap if it is less than the current overlap
                mtvAxis = axis; // Update the axis if it is the smallest overlap
            }
        }

 


        const unitMtvDirection = mtvAxis.clone().normalize(); // Get the unit vector of the MTV axis - Use this as the axis of the MTV

        const center = Vec2.sub(collider2.position, collider1.position); // Get the vector from the center of the first collider to the center of the second collider
        if (center.dot(unitMtvDirection) < 0){
            unitMtvDirection.scale(-1);
        }

        const mtv = Vec2.scale(unitMtvDirection, mtvOverlap); // Scale the unit vector by the overlap to get the MTV (MAY BE REDUNDANT)

        const collisionPoints = SAT.collisionPoints(collider1, collider2); // Get the collision points between the two colliders
        const collisionData = new CollisionData(unitMtvDirection, mtvOverlap, collider1, collider1, collisionPoints); // Create the collision data object)

        return collisionData // Return the collision data
    }

    static checkParallelAxis(axis1, axis2){
        // Check if two axes are parallel
        const dotProduct = Vec2.dot(axis1, axis2); // Dot product of the two axes
        return Math.abs(dotProduct) === 1; // Return true if the dot product is 1 (axes are parallel)
    }

    static projectAxis(axis, collider){
        // Project the collider onto the axis and return the min and max values
        let min = Infinity; // Initialize the min value to infinity
        let max = -Infinity; // Initialize the max value to -infinity

        for (const vertex of collider.vertices){
            const projecedPoint = SAT.projectVertex(vertex, axis); // Project the vertex onto the axis

            min = Math.min(min, projecedPoint); // Update the min value if the dot product is less than the current min
            max = Math.max(max, projecedPoint); // Update the max value if the dot product is greater than the current max
            
        }
        
        return {min, max}; // Return the min and max values
        
    }

    static getAxes(collider){
        const axes = []; // Array to store the axes
        for (let i = 0; i < collider.vertices.length; i++){
            const vertex1 = collider.vertices[i]; // Get the first vertex
            const vertex2 = collider.vertices[(i + 1) % collider.vertices.length]; // Get the second vertex (wraps around to the first vertex if the last vertex is reached)

            const edge = Vec2.sub(vertex2, vertex1); // Get the edge vector (vector from vertex1 to vertex2)

            const normal = new Vec2(-edge.y, edge.x).normalized; // Get the normal vector of the edge vector (perpendicular to the edge vector)

            axes.push(normal); // Add the normal vector to the axes array
        }

        return axes; // Return the axes array
    }

    static collisionPoints(collider1, collider2){
        // Check the collision points between two colliders - https://www.youtube.com/watch?v=5gDC1GU3Ivg

        let contactPoints = []; // Array to store the contact points
        let contactCount = 0; // Initialize the contact count to 0
        let minSquaredDistance = Infinity; // Initialize the minimum squared distance to infinity
        

        for(let i = 0; i < collider1.vertices.length; i++){
            const point = collider1.vertices[i]; // Get the first vertex

            for(let j = 0; j < collider2.vertices.length; j++){
                const edgeStart = collider2.vertices[j]; // Get the start of the edge
                const edgeEnd = collider2.vertices[(j + 1) % collider2.vertices.length]; // Get the end of the edge (wraps around to the first vertex if the last vertex is reached)

                const closestPointSqDist = Intersection.pointSegmentDistance(point, edgeStart, edgeEnd, true); // Get the closest point on the edge to the point (the fourth argument is true to get the squared distance)

                // Check if the distances are close enough to be considered the same
                // Check if the first contact point is not the same as the second contact point (or very close <- floating point precision)

                const tolerance = 0.0001; // Tolerance for floating point precision
                const areDistancesClose = Math.abs(closestPointSqDist - minSquaredDistance) < tolerance; // Check if the distances are close enough to be considered the same
                if (areDistancesClose && !Vec2.isEqual(contactPoints[0], point, tolerance)){
                    contactCount++; // Update the contact count
                    contactPoints.push(point); // Add the point to the contact points
                }

                else if (closestPointSqDist < minSquaredDistance){
                    minSquaredDistance = closestPointSqDist; // Update the minimum squared distance if the current squared distance is less than the minimum squared distance
                    contactCount = 1; // Update the contact count to 1
                    contactPoints = [point]; // Update the contact points to the point
                }
            }
        }

        // Reverse and test the other way
        for(let i = 0; i < collider2.vertices.length; i++){
            const point = collider2.vertices[i]; // Get the first vertex

            for(let j = 0; j < collider1.vertices.length; j++){
                const edgeStart = collider1.vertices[j]; // Get the start of the edge
                const edgeEnd = collider1.vertices[(j + 1) % collider1.vertices.length]; // Get the end of the edge (wraps around to the first vertex if the last vertex is reached)

                const closestPointSqDist = Intersection.pointSegmentDistance(point, edgeStart, edgeEnd, true); // Get the closest point on the edge to the point (the fourth argument is true to get the squared distance)

                // Check if the distances are close enough to be considered the same
                // Check if the first contact point is not the same as the second contact point (or very close <- floating point precision)

                const tolerance = 0.0001; // Tolerance for floating point precision
                const areDistancesClose = Math.abs(closestPointSqDist - minSquaredDistance) < tolerance; // Check if the distances are close enough to be considered the same
                if (areDistancesClose && !Vec2.isEqual(contactPoints[0], point, tolerance)){
                    contactCount++; // Update the contact count
                    contactPoints.push(point); // Add the point to the contact points
                }

                else if (closestPointSqDist < minSquaredDistance){
                    minSquaredDistance = closestPointSqDist; // Update the minimum squared distance if the current squared distance is less than the minimum squared distance
                    contactCount = 1; // Update the contact count to 1
                    contactPoints = [point]; // Update the contact points to the point
                }
            }
        }

        return contactPoints; // Return the contact points
    }

    
    static projectVertex(vertex, axis){
        // Project a vertice onto an axis
        return Vec2.dot(vertex, axis); // Dot product of the vertice and the axis (projection of the vertice onto the axis)
    }





}



class CollisionSolver{
    static resolveCollision(rigidbody1, rigidbody2, collisionData){
        // Resolve the collision between two rigidbodies
        const collisionNormal = collisionData.axis; // Get the collision normal (MTV axis)
        const seperationDistance = collisionData.overlap; // Get the seperation distance (overlap distance)
        const seperationAxis = collisionNormal.clone(); // Clone the collision normal to get the seperation axis
        
        const contactPoints = collisionData.collisionPoints; // Get the contact points between the two colliders
        
        // Apply the minimum translation vector (MTV) to separate the rigidbodies
        let massRatio1 = 1 - (rigidbody1.mass / (rigidbody1.mass + rigidbody2.mass)); // Calculate the mass ratio of the first rigidbody
        let massRatio2 = 1 - (rigidbody2.mass / (rigidbody1.mass + rigidbody2.mass)); // Calculate the mass ratio of the second rigidbody

        //Check if a rigidbody is static
        if (rigidbody1.mass === Infinity || rigidbody1.mass === 0 || rigidbody1.isStatic){
            massRatio1 = 0;
            massRatio2 = 1;
        }

        if (rigidbody2.mass === Infinity || rigidbody2.mass === 0 || rigidbody2.isStatic){
            massRatio1 = 1;
            massRatio2 = 0;
        }

        const mtv1 = Vec2.scale(seperationAxis, seperationDistance * massRatio1); // Scale the seperation axis by a ratio of the seperation distance and the mass of the first rigidbody
        const mtv2 = Vec2.scale(seperationAxis, seperationDistance * massRatio2); // Scale the seperation axis by a ratio of the seperation distance and the mass of the second rigidbody in the opposite direction

        

        rigidbody1.position.add(mtv1); // Apply the MTV to the first rigidbody
        rigidbody2.position.sub(mtv2); // Apply the MTV in the opposite direction to the second rigidbody


        // First calculate the impulse to apply to the rigidbodies - https://research.ncl.ac.uk/game/mastersdegree/gametechnologies/physicstutorials/5collisionresponse/Physics%20-%20Collision%20Response.pdf

        
        let rigidBody1DistToContactPoint = null;
        let rigidBody2DistToContactPoint = null;
        let collisionPoint = null;

        if (contactPoints.length === 2){
            collisionPoint = Vec2.midpoint(contactPoints[0], contactPoints[1]);
            rigidBody1DistToContactPoint = Vec2.sub(collisionPoint, rigidbody1.position); // Calculate the vector from the center of mass of the first rigidbody to the point of collision
            rigidBody2DistToContactPoint = Vec2.sub(collisionPoint, rigidbody2.position); // Calculate the vector from the center of mass of the second rigidbody to the point of collision
        }

        else {
            collisionPoint = contactPoints[0];
            rigidBody1DistToContactPoint = Vec2.sub(collisionPoint, rigidbody1.position); // Calculate the vector from the center of mass of the first rigidbody to the point of collision
            rigidBody2DistToContactPoint = Vec2.sub(collisionPoint, rigidbody2.position); // Calculate the vector from the center of mass of the second rigidbody to the point of collision
        }

        
       

        // linear impulse calculations
        const coefficientOfRestitution = Math.min(rigidbody1.bounce, rigidbody2.bounce); // Combine the bounciness of the two rigidbodies
       

        const relativeVelocity = Vec2.sub(rigidbody1.velocity, rigidbody2.velocity); // Calculate the relative velocity of the two rigidbodies
        const relativeVelocityAlongNormal = Vec2.dot(relativeVelocity, collisionNormal) * -(1 + coefficientOfRestitution); // Calculate the relative velocity along the collision normal

        const totalInverseMass = (1 / rigidbody1.mass) + (1 / rigidbody2.mass); // Calculate the total inverse mass of the two rigidbodies
        const inverseInertiaTensor1 = 1 / rigidbody1.inertiaTensor; // Calculate the inverse inertia tensor of the first rigidbody
        const inverseInertiaTensor2 = 1 / rigidbody2.inertiaTensor; // Calculate the inverse inertia tensor of the second rigidbody

        const crossedR1 = Vec2.cross(rigidBody1DistToContactPoint, collisionNormal); // Calculate the cross product of the vector from the center of mass of the first rigidbody to the point of collision and the collision normal
        const crossedR2 = Vec2.cross(rigidBody2DistToContactPoint, collisionNormal); // Calculate the cross product of the vector from the center of mass of the second rigidbody to the point of collision and the collision normal

        const angularEffect = crossedR1 * inverseInertiaTensor1 * crossedR1 + crossedR2 * inverseInertiaTensor2 * crossedR2; // Calculate the angular effect of the two rigidbodies

        // calculate the final impulse
        const impulse = relativeVelocityAlongNormal / (totalInverseMass + angularEffect); // Calculate the impulse to apply to the rigidbodies
        const impulseAlongNormal = collisionNormal.clone().scale(impulse); // Calculate the impulse along the collision normal

        rigidbody1.velocity.sub(Vec2.scale(impulseAlongNormal, 1 / rigidbody1.mass)); // Apply the impulse to the first rigidbody
        rigidbody2.velocity.add(Vec2.scale(impulseAlongNormal, 1 / rigidbody2.mass)); // Apply the impulse to the second rigidbody


        // Next calculate the angular impulse to apply to the rigidbodies

        rigidbody1.angularVelocity += inverseInertiaTensor1 * Vec2.cross(rigidBody1DistToContactPoint, impulseAlongNormal); // Apply the angular impulse to the first rigidbody
        rigidbody2.angularVelocity -= inverseInertiaTensor2 * Vec2.cross(rigidBody2DistToContactPoint, impulseAlongNormal); // Apply the angular impulse to the second rigidbody

        console.log(rigidBody1DistToContactPoint, rigidBody2DistToContactPoint)

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



export class PhysicsModule extends Module{
    #timeStepLimit = 50; // Maximum time step to prevent spiral of death (ms) 
    constructor(engineAPI){
        super(engineAPI);
        this.physicsAPI = engineAPI.getAPI('physics');

        this.rigidBodies = [];
    }

    preload(){
        
    }

    start(){
        // setup test senario
        const rigidBody1 = new Rigidbody(this.engineAPI, new Vec2(100, 100), 0, 1, 1, []);
        const rigidBody2 = new Rigidbody(this.engineAPI, new Vec2(300, -100), 0, 1, 1, []);
        const rigidBody3 = new Rigidbody(this.engineAPI, new Vec2(200, 300), 0, 1, 1, []);


        rigidBody1.addCollider(new RectangleCollider(rigidBody1, 0, 0, 35, 1, 100, 100));
        rigidBody2.addCollider(new RectangleCollider(rigidBody2, 0, 0, 0, 1, 100, 100));
        rigidBody3.addCollider(new TriangleCollider(rigidBody3, 0, 0, 0, 1, 100, 100));
        rigidBody3.addCollider(new RectangleCollider(rigidBody3, -150, 0, 0, 1, 100, 100));


        this.rigidBodies.push(rigidBody1);
        this.rigidBodies.push(rigidBody2);
        this.rigidBodies.push(rigidBody3);

        window.addEventListener('mousedown', (e) => {
            const camera = this.engineAPI.getAPI('render').getCamera();
            const worldPos = camera.screenToWorld(e.clientX, e.clientY);
            rigidBody2.position = new Vec2(worldPos.x, worldPos.y);
            
            rigidBody2.velocity = new Vec2(-100, 0);
        });

        rigidBody1.velocity = new Vec2(100, 0);
        rigidBody3.velocity = new Vec2(0, -100);


        const ground = new Rigidbody(this.engineAPI, new Vec2(0, 500), 0, Infinity, 1, []);
        ground.addCollider(new RectangleCollider(ground, 0, 0, 0, 1, 2000, 100));
        
        this.rigidBodies.push(ground);
    }

    update(dt){
        dt = Math.min(dt, this.#timeStepLimit / 1000); // Limit the time step to prevent spiral of death

        for (const body of this.rigidBodies){
            body.update(dt);
        }


        for (let i = 0; i < this.rigidBodies.length; i++){
            for (let j = i + 1; j < this.rigidBodies.length; j++){
                const body1 = this.rigidBodies[i];
                const body2 = this.rigidBodies[j];

                for (const collider1 of body1.colliders){
                    for (const collider2 of body2.colliders){
                        const collisionData = SAT.checkCollision(collider1, collider2);

                        if (collisionData){
                            console.log(collisionData);
                            CollisionSolver.resolveCollision(body1, body2, collisionData);
                        }
                    }
                }
               
            }
        }
    }
}