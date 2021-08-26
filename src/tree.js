import { makeSpriteFromLoadedResource } from "./pixi.js";
import { registerResource } from "./register.js";

export class Tree {
    static Resources() {
        return [
            "images/tree-base-256.png",
            "images/tree-canopy-256.png",
            "images/tree-trunk-256.png",
        ];
    }
    constructor(stage) {
        this.stage = stage;
        this.trunkLength = 12;
        this.resetAppleClock();
        this.base = makeSpriteFromLoadedResource("images/tree-base-256.png");
        this.trunk = makeSpriteFromLoadedResource("images/tree-trunk-256.png");
        this.canopy = makeSpriteFromLoadedResource(
            "images/tree-canopy-256.png"
        );
        this.body = new PIXI.Container();
        this.x = 0;
        this.y = 0;
        this.apples = new Map();
        this.reposition();
        this.body.addChild(this.canopy);
        this.body.addChild(this.trunk);
        this.body.addChild(this.base);
        this.body.pivot.set(0, 16);
        this.body.scale.set(4, 4);
    }
    makeDraggable() {
        this.canopy.interactive = true;
        this.canopy.cursor = "grab";
        this.canopy.on("mousedown", (ev) => {
            this.dragging = true;
            this.dragStartY = ev.data.getLocalPosition(this.body).y;
            this.origTrunkLength = this.trunkLength;
            const mouseMoveHandler = (ev) => {
                if (this.dragging) {
                    this.trunkLength =
                        this.origTrunkLength +
                        (this.dragStartY -
                            ev.data.getLocalPosition(this.body).y);
                    this.reposition();
                }
            };
            // Note that mousemove in PIXI will fire for any movement over the world, not just the canopy.
            this.canopy.on("mousemove", mouseMoveHandler);
            const mouseUpHandler = () => {
                this.dragging = false;
                this.canopy.off("mousemove", mouseMoveHandler);
                this.canopy.off("mouseup", mouseUpHandler);
                this.canopy.off("mouseupoutside", mouseUpHandler);
            };
            this.canopy.on("mouseup", mouseUpHandler);
            this.canopy.on("mouseupoutside", mouseUpHandler);
        });
    }
    getBodyWidth() {
        // Memoize this; apparently it's relatively expensive to calculate.
        if (this._bodyWidth === undefined) {
            this._bodyWidth = this.body.getBounds().width;
        }
        return this._bodyWidth;
    }
    getNextAppleTime() {
        return this._nextAppleTime;
    }
    resetAppleClock() {
        if (this._nextAppleTime === undefined) {
            this._nextAppleTime = 0;
        }
        this._nextAppleTime += 500 * (0.5 + Math.random());
    }
    // Adds an apple to the canopy, and keeps it there if the canopy moves.
    addApple(apple) {
        if (this.apples.length > 30) {
            console.log(
                "Too many apples on this tree, refusing to add more.",
                tree
            );
            return;
        }
        const canopyGlobalCoords = this.getCanopyRegion();
        apple.canopyOffsetY =
            Math.random() * canopyGlobalCoords.height * 0.6 +
            canopyGlobalCoords.height * 0.2;
        apple.canopyOffsetX =
            Math.random() * canopyGlobalCoords.width * 0.6 +
            canopyGlobalCoords.width * 0.2;
        this.positionApple(apple, canopyGlobalCoords);
        apple.addAtPos(apple.x, apple.y);
        this.apples.set(apple, apple);
    }
    onEaten(apple) {
        this.apples.delete(apple);
        if (this.onAppleEatenHook) {
            this.onAppleEatenHook();
        }
    }
    getApples() {
        return this.apples;
    }
    positionApple(apple, canopyGlobalCoords) {
        apple.body.x = canopyGlobalCoords.x + apple.canopyOffsetX;
        apple.body.y = canopyGlobalCoords.y + apple.canopyOffsetY;
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
        this.base.x = 9;
        this.base.y = 16;
        this.base.width = 12;
        this.base.height = 4;
        this.base.anchor.set(0, 1);
        this.trunk.x = 13;
        this.trunk.y = 16 - this.base.height;
        this.trunk.width = 4.5;
        this.trunk.height = this.trunkLength;
        this.trunk.anchor.set(0, 1);
        this.canopy.x = 0;
        this.canopy.y = 16 - this.base.height - this.trunkLength;
        this.canopy.width = 32;
        this.canopy.height = 12;
        this.canopy.anchor.set(0, 1);
        const canopyGlobalCoords = this.getCanopyRegion();
        this.apples.forEach((apple) => {
            this.positionApple(apple, canopyGlobalCoords);
        });
    }
    getCanopyRegion() {
        return this.canopy.getBounds();
    }
    remove() {
        this.stage.removeChild(this.body);
    }
    refresh() {
        this.remove();
        this.addAtPos(this.x, this.y);
    }
}
registerResource(Tree.Resources());
