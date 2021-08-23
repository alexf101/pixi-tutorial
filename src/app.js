import { Giraffe } from "./giraffe.js";
import { loadAllResources, makeSpriteFromLoadedResource } from "./pixi.js";
import { Tree } from "./tree.js";
import { Apple } from "./apple.js";
import { getResources } from "./register.js";
import { clamp, gameTimeToMilliseconds } from "./util.js";

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
        this.gameTime = 0;
        this.ticker = App.ticker.add(this.tick.bind(this));
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
            for (let i = 0; i < 12; i++) {
                this.addAppleToTree(tree);
            }
        });
    }
    addAppleToTree(tree) {
        // Randomly distribute the apples in the inner regions of the canopy, not right at the edges - it looks better.
        const apple = new Apple(App.stage);
        this.apples.push(apple);
        const canopy = tree.getCanopyRegion();
        apple.addAtPos(
            canopy.x + Math.random() * canopy.width * 0.6 + canopy.width * 0.2,
            canopy.y + Math.random() * canopy.height * 0.6 + canopy.height * 0.2
        );
    }
    tick(delta) {
        this.gameTime += gameTimeToMilliseconds(delta);
        // Apples spawn on each tree about once per second
        this.trees.forEach((tree) => {
            if (tree.getNextAppleTime() < this.gameTime) {
                this.addAppleToTree(tree);
                tree.resetAppleClock();
            }
        });
        // Giraffes change direction randomly
        this.giraffes.forEach((giraffe) => {
            if (giraffe.getNextDirectionChangeTime() < this.gameTime) {
                giraffe.changeDirection();
                giraffe.resetChangeDirectionClock();
            }
        });
        // Giraffes may move
        this.giraffes.forEach((giraffe) => {
            const newX = giraffe.body.x + giraffe.getDirection() * delta;
            giraffe.body.x = clamp(
                newX,
                0,
                App.view.width - giraffe.getBodyWidth()
            );
        });
        // Game ends after 5 seconds (avoid crashing the tab!)
        if (this.gameTime > 5000) {
            this.ticker.stop();
        }
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
