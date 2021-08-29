import { makeSpriteFromLoadedResource } from "./pixi.js";
import { registerResource } from "./register.js";

function pickRandomDirection() {
    const r = Math.random();
    if (r > 2 / 3) {
        return 1;
    } else if (r > 1 / 3) {
        return 0;
    } else {
        return -1;
    }
}
export class Giraffe {
    static Resources() {
        return [
            "images/giraffe-legs.png",
            "images/giraffe-head.png",
            "images/giraffe-neck.png",
        ];
    }
    constructor(stage, gameTime) {
        this.stage = stage;
        this.neckLength = 16;
        this._bornAt = gameTime;
        this.resetEatClock(gameTime);
        this._nextDirectionChangeTime = 0;
        this._applesConsumed = 0;
        this._nextDirectionChangeTime = gameTime;
        this.resetChangeDirectionClock();
        this.changeDirection();
        this.legs = makeSpriteFromLoadedResource("images/giraffe-legs.png");
        this.neck = makeSpriteFromLoadedResource("images/giraffe-neck.png");
        this.head = makeSpriteFromLoadedResource("images/giraffe-head.png");
        this.body = new PIXI.Container();
        this.x = 0;
        this.y = 0;
        this.reposition();
        this.body.addChild(this.head);
        this.body.addChild(this.neck);
        this.body.addChild(this.legs);
        this.body.pivot.set(0, 16);
        this.body.scale.set(1, 1);
    }
    setParent(giraffe) {
        this._parent = giraffe;
    }
    eachAncestor(callback) {
        callback(this);
        if (this._parent) {
            this._parent.eachAncestor(callback);
        }
    }
    countAncestors() {
        let count = 0;
        this.eachAncestor((g) => (count += 1));
        return count;
    }
    onEat(gameTime) {
        this.resetEatClock(gameTime);
        this.onRecover();
        this._applesConsumed += 1;
        if (this._applesConsumed === 3) {
            this.mitosis(gameTime);
        }
        this.reposition();
    }
    getBodyWidth() {
        // Memoize this; apparently it's relatively expensive to calculate.
        if (this._bodyWidth === undefined) {
            this._bodyWidth = this.body.getBounds().width;
        }
        return this._bodyWidth;
    }
    getDirection() {
        return this._direction;
    }
    changeDirection() {
        this._direction = pickRandomDirection();
    }
    setDirection(direction) {
        if (!Math.abs(direction) === 1) {
            throw new Error("Invalid direction");
        }
        this._direction = direction;
        this.reposition();
    }
    resetChangeDirectionClock() {
        this._nextDirectionChangeTime += 1000 * (2 + Math.random() * 3);
    }
    resetEatClock(gameTime) {
        this._lastAteAt = gameTime;
        if (this._starvationTime === undefined) {
            this._starvationTime = 0;
        }
        const timeTillStarved = 5000 + 5000 * Math.random();
        this._starvationTime = gameTime + timeTillStarved;
        this._sicklyTime = gameTime + timeTillStarved * (2 / 3);
    }
    getStarvationTime() {
        return this._starvationTime;
    }
    getSicklyTime() {
        return this._sicklyTime;
    }
    onSickly() {
        this._sickly = true;
        this.reposition();
    }
    onRecover() {
        this._sickly = false;
        this.reposition();
    }
    onStarve() {
        this.body.rotation = Math.PI * 1.5;
        setTimeout(this.remove.bind(this), 2000);
    }
    mitosis(gameTime) {
        // When undergoing mitosis, the Giraffe will not move and will change colour
        this._mitosis = true;
        this._mitosisCompleteAt = gameTime + 2000;
    }
    isUndergoingMitosis() {
        return !!this._mitosis;
    }
    mitosisComplete(gameTime) {
        return this._mitosisCompleteAt < gameTime;
    }
    getNextDirectionChangeTime() {
        return this._nextDirectionChangeTime;
    }
    getHeadRegion() {
        return this.head.getBounds();
    }
    addAtPos(x, y) {
        this.x = x;
        this.y = y;
        this.reposition();
        this.stage.addChild(this.body);
    }
    reposition() {
        this.body.x = this.x;
        this.body.y = this.y;
        this.legs.x = 0;
        this.legs.y = 16;
        this.legs.width = 32;
        this.legs.height = 32;
        this.legs.anchor.set(0, 1);
        this.neck.x = 18;
        this.neck.y = 16 - this.legs.height;
        this.neck.width = 16;
        this.neck.height = this.neckLength;
        this.neck.anchor.set(0, 1);
        this.head.x = 24;
        this.head.y = 16 - this.legs.height - this.neckLength;
        this.head.width = 20;
        this.head.height = 32;
        this.head.anchor.set(0, 1);
        if (this._direction === -1) {
            this.body.scale.x = -Math.abs(this.body.scale.x);
        } else {
            this.body.scale.x = Math.abs(this.body.scale.x);
        }
        if (this._sickly) {
            this.head.tint = 0xff0000;
            this.legs.tint = 0xff0000;
            this.neck.tint = 0xff0000;
        } else if (this._mitosis) {
            this.head.tint = 0xff99ff;
            this.legs.tint = 0xff99ff;
            this.neck.tint = 0xff99ff;
        } else {
            this.head.tint = 0xffffff;
            this.legs.tint = 0xffffff;
            this.neck.tint = 0xffffff;
        }
    }
    remove() {
        this.stage.removeChild(this.body);
    }
    refresh() {
        this.remove();
        this.addAtPos(this.x, this.y);
    }
}
registerResource(Giraffe.Resources());
