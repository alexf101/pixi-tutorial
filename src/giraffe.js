import { makeSpriteFromLoadedResource } from "./pixi.js";
import { registerResource } from "./register.js";

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
        this.body = new PIXI.Container();
        this.reposition();
        this.body.addChild(this.head);
        this.body.addChild(this.neck);
        this.body.addChild(this.legs);
        this.stage.addChild(this.body);
        this.body.pivot.set(0, 16);
        this.body.scale.set(1, 1);
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
registerResource(Giraffe.Resources());
