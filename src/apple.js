import { makeSpriteFromLoadedResource } from "./pixi.js";
import { registerResource } from "./register.js";

export class Apple {
    static Resources() {
        return ["images/apple-64.png"];
    }
    constructor(stage) {
        this.stage = stage;
        this.body = makeSpriteFromLoadedResource("images/apple-64.png");
        this.reposition();
    }
    addAtPos(x, y) {
        this.x = x;
        this.y = y;
        this.stage.addChild(this.body);
    }
    reposition() {
        const x = this.x;
        const y = this.y;
        this.body.x = x;
        this.body.y = y;
        this.body.scale.set(0.25, 0.25);
        this.body.anchor.set(0.5, 0.5);
    }
    remove() {
        this.stage.removeChild(this.body);
    }
    refresh() {
        this.remove();
        this.addAtPos(this.x, this.y);
    }
}
registerResource(Apple.Resources());
