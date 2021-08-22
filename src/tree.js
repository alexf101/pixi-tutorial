import { makeSpriteFromLoadedResource } from "./pixi.js";

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
        this.trunkLength = 16;
    }
    addAtPos(x, y) {
        this.base = makeSpriteFromLoadedResource("images/tree-base-256.png");
        this.trunk = makeSpriteFromLoadedResource("images/tree-trunk-256.png");
        this.canopy = makeSpriteFromLoadedResource(
            "images/tree-canopy-256.png"
        );
        this.x = x;
        this.y = y;
        this.reposition();
        this.stage.addChild(this.canopy);
        this.stage.addChild(this.trunk);
        this.stage.addChild(this.base);
    }
    reposition() {
        const scale = 2;
        const x = this.x;
        const y = this.y;
        this.canopy.x = x;
        this.canopy.y = y;
        const canopyHeight = 12 * scale;
        this.canopy.width = 32 * scale;
        this.canopy.height = canopyHeight;
        this.trunk.x = x + 13 * scale;
        this.trunk.y = y + canopyHeight;
        this.trunk.width = 4.5 * scale;
        const trunkHeight = this.trunkLength * scale;
        this.trunk.height = trunkHeight;
        this.base.x = x + 9 * scale;
        this.base.y = y + canopyHeight + trunkHeight;
        this.base.width = 12 * scale;
        this.base.height = 4 * scale;
    }
    remove() {
        this.stage.removeChild(this.base);
        this.stage.removeChild(this.trunk);
        this.stage.removeChild(this.canopy);
    }
    refresh() {
        this.remove();
        this.addAtPos(this.x, this.y);
    }
}
