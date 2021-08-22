import { makeSpriteFromLoadedResource } from "./pixi.js";

export class Giraffe {
    static Resources() {
        return [
            "images/giraffe-legs.png",
            "images/giraffe-head.png",
            "images/giraffe-neck.png",
        ];
    }
    constructor(stage) {
        this.stage = stage;
        this.neckLength = 16;
    }
    addAtPos(x, y) {
        this.x = x;
        this.y = y;
        this.legs = makeSpriteFromLoadedResource("images/giraffe-legs.png");
        this.neck = makeSpriteFromLoadedResource("images/giraffe-neck.png");
        this.head = makeSpriteFromLoadedResource("images/giraffe-head.png");
        this.reposition();
        this.stage.addChild(this.head);
        this.stage.addChild(this.neck);
        this.stage.addChild(this.legs);
    }
    reposition() {
        const x = this.x;
        const y = this.y;
        this.head.x = x + 24;
        this.head.y = y;
        const headHeight = 32;
        this.head.width = 20;
        this.head.height = headHeight;
        this.neck.x = x + 18;
        this.neck.y = y + headHeight;
        this.neck.width = 16;
        this.neck.height = this.neckLength;
        this.legs.x = x;
        this.legs.y = y + headHeight + this.neckLength;
        this.legs.width = 32;
        this.legs.height = 32;
    }
    remove() {
        this.stage.removeChild(this.legs);
        this.stage.removeChild(this.neck);
        this.stage.removeChild(this.head);
    }
    refresh() {
        this.remove();
        this.addAtPos(this.x, this.y);
    }
}