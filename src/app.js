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
        this.apples = [];
        this.giraffes = [];
        this.trees = [];
        this.makeGiraffes();
        this.makeTrees();
        this.makeApples();
    }
    makeGiraffes() {
        for (let i = 0; i < 10; i++) {
            const giraffe = new Giraffe(App.stage);
            this.giraffes.push(giraffe);
            giraffe.addAtPos(
                Math.random() * (App.view.width - 64), // I think giraffe's are 44 px wide, but... let's give it some extra space.
                App.view.height - 20
            );
        }
    }
    makeTrees() {
        for (let i = 0; i < 6; i++) {
            const tree = new Tree(App.stage);
            this.trees.push(tree);
            tree.addAtPos(
                Math.random() * (App.view.width - 128), // tree canopy width is 128
                App.view.height - 20
            );
        }
    }
    makeApples() {
        this.trees.forEach((tree) => {
            const canopy = tree.getCanopyRegion();
            for (let i = 0; i < 12; i++) {
                const apple = new Apple(App.stage);
                this.apples.push(apple);

                // Randomly distribute the apples in the inner regions of the canopy, not right at the edges - it looks better.
                apple.addAtPos(
                    canopy.x +
                        Math.random() * canopy.width * 0.6 +
                        canopy.width * 0.2,
                    canopy.y +
                        Math.random() * canopy.height * 0.6 +
                        canopy.height * 0.2
                );
            }
        });
    }
}
const game = new Game();
window.DBG_game = game;

const e = React.createElement;
export function Controls() {
    return e("div", {}, [
        e("div", {}, [
            "Neck length: ",
            e("input", {
                onChange: (val) => {
                    let neckLength = parseInt(val.currentTarget.value);
                    game.giraffes.forEach((g) => {
                        g.neckLength = neckLength;
                        g.reposition();
                    });
                },
            }),
        ]),
        e("div", {}, [
            "Trunk length: ",
            e("input", {
                onChange: (val) => {
                    let trunkLength = parseInt(val.currentTarget.value);
                    game.apples.forEach((a) => {
                        a.remove();
                    });
                    game.trees.forEach((t) => {
                        t.trunkLength = trunkLength;
                        t.reposition();
                    });
                    game.makeApples();
                },
            }),
        ]),
    ]);
}
