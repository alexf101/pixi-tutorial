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
        this.trunkLength = 16;
    }
    addAtPos(x, y) {
        this.x = x;
        this.y = y;
        this.base = makeSpriteFromLoadedResource("images/tree-base-256.png");
        this.trunk = makeSpriteFromLoadedResource("images/tree-trunk-256.png");
        this.canopy = makeSpriteFromLoadedResource(
            "images/tree-canopy-256.png"
        );
        this.body = new PIXI.Container();
        this.reposition();
        this.body.addChild(this.canopy);
        this.body.addChild(this.trunk);
        this.body.addChild(this.base);
        this.stage.addChild(this.body);
        this.body.pivot.set(0, 16);
        this.body.scale.set(4, 4);
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
    }
    getCanopyRegion() {
        return this.canopy.getBounds();
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
registerResource(Tree.Resources());
