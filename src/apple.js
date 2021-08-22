import { makeSpriteFromLoadedResource } from "./pixi.js";
import { registerResource } from "./register.js";

export class Apple {
    static Resources() {
        return ["images/apple-64.png"];
    }
    constructor(stage) {
        this.stage = stage;
    }
    addAtPos(x, y) {
        this.apple = makeSpriteFromLoadedResource("images/apple-64.png");
        this.x = x;
        this.y = y;
        this.reposition();
        this.stage.addChild(this.apple);
    }
    reposition() {
        const x = this.x;
        const y = this.y;
        this.apple.x = x;
        this.apple.y = y;
        this.apple.width = 32;
        this.apple.height = 32;
    }
    remove() {
        this.stage.removeChild(this.apple);
    }
    refresh() {
        this.remove();
        this.addAtPos(this.x, this.y);
    }
}
registerResource(Apple.Resources());
