import { Giraffe } from "./giraffe.js";
import { loadAllResources, makeSpriteFromLoadedResource } from "./pixi.js";
import { Tree } from "./tree.js";
import { Apple } from "./apple.js";
import { getResources } from "./register.js";

//Create a Pixi Application
export const App = new PIXI.Application({
    width: 512,
    height: 512,
    antialias: true,
});

await loadAllResources(...getResources());

class Game {
    constructor() {
        this.g1 = new Giraffe(App.stage);
        this.t1 = new Tree(App.stage);
        this.a1 = new Apple(App.stage);
        console.log(App.stage.height);
        this.g1.addAtPos(100, 100);
        this.t1.addAtPos(100, App.view.height - 100);
        this.makeApples();
    }
    makeApples() {
        const canopy = this.t1.getCanopyRegion();
        this.a1.addAtPos(
            canopy.x + canopy.width / 2,
            canopy.y + canopy.height / 2
        );
    }
}
const game = new Game();

const e = React.createElement;
export function Controls() {
    return e("div", {}, [
        e("div", {}, [
            "Neck length: ",
            e("input", {
                onChange: (val) => {
                    let neckLength = parseInt(val.currentTarget.value);
                    game.g1.neckLength = neckLength;
                    game.g1.reposition();
                },
            }),
        ]),
        e("div", {}, [
            "Trunk length: ",
            e("input", {
                onChange: (val) => {
                    let trunkLength = parseInt(val.currentTarget.value);
                    game.t1.trunkLength = trunkLength;
                    game.t1.reposition();
                },
            }),
        ]),
    ]);
}
