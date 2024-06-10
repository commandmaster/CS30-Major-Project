
/**
 * @typedef {Object} Vector2 A 2D vector object containing an x and y component
 * @typedef {Object} Vec2 A 2D vector object containing an x and y component
 * @property {number} x The x component of the vector
 * @property {number} y The y component of the vector
 */


/**
 * MathPlus.js
 * @class MathPlus
 * @classdesc A collection of math functions and constants that are not included in the standard JavaScript Math object
 * 
 */
export class MathPlus{
    // JS math addons 

    /**
     * @param {number|Number} value The value to clamp
     * @param {number|Number} min The minimum value to clamp to
     * @param {number|Number} max The maximum value to clamp to
     * @returns {number|Number} The clamped value
     * @memberof MathPlus
     * @static
     * @description Clamp a value within a range
     */
    static clamp(value, min, max){
        // Clamp a value within a range
        return Math.min(Math.max(value, min), max);
    }

    /**
     * @param {number|Number} a The first value to compare
     * @param {number|Numberr} b The second value to compare
     * @param {number|Number} t The interpolation factor between the two values 0 = a, 1 = b
     * @returns {number|Number} The linearly interpolated value
     * @static
     * @memberof MathPlus
     * @description Linearly interpolate between two values
     */
    static lerp(a, b, t){
        // Linearly interpolate between two values
        return a + (b - a) * t;
    }

    /**
     * @param {number|Number} threshold1 The first threshold value. The value will be 0 at this point
     * @param {number|Number} threshold2 The second threshold value. The value will be 1 at this point
     * @param {number|Number} t The interpolation factor between the two thresholds t = threshold1 -> 0, t = threshold2 -> 1
     * @returns {number|Number} The smoothstep interpolated value
     * @static
     * @memberof MathPlus
     * @description Create a smoothstep function that is 0 at threshold1, 1 at threshold2, and smoothly transitions between the two using a linear interpolation of a quadratic function (t^2 and 1 - (t - 1)^2
    */
    static smoothStep(threshold1, threshold2, t){
        // Create a smoothstep function that is 0 at threshold1, 1 at threshold2, and smoothly transitions between the two using a linear interpolation of a quadratic function (t^2 and 1 - (t - 1)^2)
        t = MathPlus.clamp((t - threshold1) / (threshold2 - threshold1), 0.0, 1.0);
        return (t**2) * (3 - 2*t);
    }


    /**
     * Merges a smoothstep function with another function.
     *
     * @param {Function} mathFunction The function to merge with the smoothstep function.
     * @param {number|Number} threshold1 The first threshold value for the smoothstep function.
     * @param {number|Number} threshold2 The second threshold value for the smoothstep function.
     * @param {number|Number} t The input value for the functions.
     * @returns {number|Number} The merged result of the smoothstep function and the given function.
     * @memberof MathPlus
     * @static
     * @description Merge a smoothstep function with another function. The smoothstep function will be multiplied by the result of the given function.
     */
    static mergeSmoothStep(mathFunction, threshold1, threshold2, t){
        // Merge a smoothstep function with another function
        const functionValue = mathFunction(t);
        return MathPlus.smoothStep(threshold1, threshold2, t) * functionValue;
    }

    /**
     * 
     * @param {number|Number} a The first value to compare
     * @param {number|Number} b The second value to compare
     * @param {number|Number} [tolerance=0.0001] The tolerance The tolerance for the comparison, the minimum difference between the two values
     * @returns {boolean} True if the values are nearly equal within the given tolerance
     * @memberof MathPlus
     * @static
     * @description Compare two values and return true if they are nearly equal within a given tolerance and false otherwise
     */
    static nearlyEqual(a, b, tolerance=0.0001){
        // Return true if two values are nearly equal within a given tolerance
        return Math.abs(a - b) < tolerance;
    }

    /**
     * 
     * @param {number|Number} min The minimum value of the range
     * @param {number|Number} max The maximum value of the range
     * @returns {number} A random value within the range
     * @memberof MathPlus
     * @static
     * @description Return a random value within a range
     */
    static randomRange(min, max){
        // Return a random value within a range
        return MathPlus.lerp(min, max, Math.random());
    }

    /**
     * 
     * @param {number|Number} min The minimum value of the range 
     * @param {number|Number} max The maximum value of the range 
     * @returns {number} A random integer value within the range 
     * @memberof MathPlus
     * @static
     * @description Return a random integer value within a range
     */
    static randomIntRange(min, max){
        // Return a random integer value within a range
        return Math.floor(MathPlus.randomRange(min, max));
    }

    /**
     * @returns {number|Number} A random boolean value
     * @memberof MathPlus
     * @static
     * @description Return a random boolean value
     */
    static randomBool(){
        // Return a random boolean value
        return Math.random() > 0.5;
    }

    /**
     * 
     * @param {Array} array 
     * @returns {any} A random element from the array
     * @memberof MathPlus
     * @static
     * @description Return a random element from an array
     */
    static randomElement(array){
        // Return a random element from an array
        const value = Math.floor(Math.random() * array.length);
        return array[MathPlus.clamp(value, 0, array.length - 1)];
    }

    /**
     * 
     * @param {number|Number} min The minimum value of the range
     * @param {number|Number} max The maximum value of the range
     * @returns {number|Number} A random value within the range
     * @memberof MathPlus
     * @static
     * @description Return a random value within a range
     * @deprecated Use MathPlus.randomRange instead
     * @see MathPlus.randomRange
     * @see MathPlus.randomIntRange
    */
    static random(min, max){
        // Return a random value within a range
        return Math.random() * (max - min) + min;
    }

    /**
     * 
     * @param {number|Number} value The value to map to a new range
     * @param {number|Number} inMin The minimum value of the input range
     * @param {number|Number} inMax The maximum value of the input range
     * @param {number|Number} outMin The minimum value of the output range
     * @param {number|Number} outMax The maximum value of the output range
     * @returns {number|Number} The mapped value
     * @memberof MathPlus
     * @static
     * @description Map a value from one range to another
     */
    static mapRange(value, inMin, inMax, outMin, outMax){
        // Map a value from one range to another
        return MathPlus.lerp(outMin, outMax, (value - inMin) / (inMax - inMin));
    }

    /**
     * 
     * @param {number|Number} degrees The angle in degrees to convert to radians 
     * @returns {number|Number} The angle in radians
     * @memberof MathPlus
     * @static
     * @description Convert an angle in degrees to radians
     */
    static degToRad(degrees){
        // Convert degrees to radians
        return degrees * Math.PI / 180;
    }

    /**
     * 
     * @param {number|Number} radians The angle in radians to convert to degrees
     * @returns {number|Number} The angle in degrees
     * @memberof MathPlus
     * @static
     * @description Convert an angle in radians to degrees
     */
    static radToDeg(radians){
        // Convert radians to degrees
        return radians * 180 / Math.PI;
    }

    /**
     * @param {Vector2} pointToTransform The point to rotate around the other point
     * @param {Vector2} pointToRotateAbout The point to rotate around
     * @param {number|Number} angle The angle to rotate the point by (default in radians)
     * @param {boolean} [isDeg=false] True if the angle is in degrees, false if the angle is in radians
     * @returns {Vector2} The transformed point after rotation
     * @memberof MathPlus
     * @static
     * @description Rotate a point about another point by a given angle
     */
    static transformPoint(pointToTransform, pointToRotateAbout, angle, isDeg=false){
        // Rotate a point about another point by a given angle
        if (isDeg){
            angle = MathPlus.degToRad(angle);
        }

        const x = Math.cos(angle) * (pointToTransform.x - pointToRotateAbout.x) - Math.sin(angle) * (pointToTransform.y - pointToRotateAbout.y) + pointToRotateAbout.x;
        const y = Math.sin(angle) * (pointToTransform.x - pointToRotateAbout.x) + Math.cos(angle) * (pointToTransform.y - pointToRotateAbout.y) + pointToRotateAbout.y;

        return {x: x, y: y};
    }
}