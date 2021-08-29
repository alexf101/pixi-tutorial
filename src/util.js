export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export function gameTimeToMilliseconds(delta) {
    // Delta is measured in frames at 60 fps, convert it to milliseconds for simplicity.
    return 1000 * (delta / 60);
}

// From kittykatattack's tutorial: https://github.com/kittykatattack/learningPixi#the-hittestrectangle-function
export function hitTestRectangle(r1, r2) {
    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

    //hit will determine whether there's a collision
    hit = false;

    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2;

    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;

    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;

    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;

    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
        //A collision might be occurring. Check for a collision on the y axis
        if (Math.abs(vy) < combinedHalfHeights) {
            //There's definitely a collision happening
            hit = true;
        } else {
            //There's no collision on the y axis
            hit = false;
        }
    } else {
        //There's no collision on the x axis
        hit = false;
    }

    //`hit` will be either `true` or `false`
    return hit;
}

const loopDetector = new Set();
export function deepNaNWatch(objectToWatch) {
    try {
        if (loopDetector.has(objectToWatch)) {
            return objectToWatch;
        }
        loopDetector.add(objectToWatch);
        if (Array.isArray(objectToWatch)) {
            for (let i = 0; i < objectToWatch.length; i++) {
                objectToWatch[i] = deepNaNWatch(objectToWatch[i]);
            }
            return observeNan(objectToWatch);
        } else if (objectToWatch instanceof Object) {
            for (let [key, value] of Object.entries(objectToWatch)) {
                objectToWatch[key] = deepNaNWatch(value);
            }
            return observeNan(objectToWatch);
        } else {
            // Not an array or an object
            return objectToWatch;
        }
    } catch (err) {
        console.log(err);
        debugger;
    }
}
export function shallowNaNWatch(objectToWatch) {
    return observeNan(objectToWatch);
}

function observeNan(obj) {
    return new Proxy(obj, {
        set: function (obj, prop, value) {
            // The default behavior to store the value
            obj[prop] = value;

            if (Number.isNaN(value)) {
                debugger;
                throw new RangeError(`${prop} on ${obj} is NaN`);
            }

            // Indicate success
            return true;
        },
    });
}
