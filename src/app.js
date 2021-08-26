import { Giraffe } from "./giraffe.js";
import { loadAllResources, makeSpriteFromLoadedResource } from "./pixi.js";
import { Tree } from "./tree.js";
import { Apple } from "./apple.js";
import { getResources } from "./register.js";
import { clamp, gameTimeToMilliseconds, hitTestRectangle } from "./util.js";

//Create a Pixi Application
export const App = new PIXI.Application({
    width: 512,
    height: 512,
    antialias: true,
});

await loadAllResources(...getResources());

class Game {
    constructor() {
        this.apples = new Map();
        this.giraffes = [];
        this.trees = [];
        this.makeGiraffes();
        this.makeTrees();
        this.makeApples();
        this.makeGreatTree();
        this.gameTime = 0;
        this.ticker = App.ticker.add(this.tick.bind(this));
    }
    makeGiraffes() {
        for (let i = 0; i < 10; i++) {
            const giraffe = new Giraffe(App.stage);
            this.giraffes.push(giraffe);
            giraffe.addAtPos(
                Math.random() * (App.view.width - giraffe.getBodyWidth()),
                App.view.height - 20
            );
        }
    }
    makeTrees() {
        for (let i = 0; i < 6; i++) {
            const tree = new Tree(App.stage);
            tree.makeDraggable();
            this.trees.push(tree);
            tree.addAtPos(
                Math.random() * (App.view.width - tree.getBodyWidth()),
                App.view.height - 20
            );
        }
    }
    makeGreatTree() {
        const tree = new Tree(App.stage);
        tree.body.scale.set(6, 6);
        tree.trunkLength = 50;
        this.trees.push(tree);
        tree.addAtPos(
            (App.view.width - tree.getBodyWidth()) / 2,
            App.view.height - 20
        );
        for (let i = 0; i < 18; i++) {
            this.addAppleToTree(tree);
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
        this.apples.set(apple, apple);
        tree.addApple(apple);
    }
    tick(frames) {
        this.gameTime += gameTimeToMilliseconds(frames);
        document.getElementById("fps-meter").textContent =
            "FPS: " + Math.round(frames * 60);
        document.getElementById("game-time").textContent =
            "Game time: " + Math.round(this.gameTime);
        document.getElementById("giraffe-debug").textContent =
            "Giraffes: " +
            JSON.stringify(
                this.giraffes.map(
                    (g) => `Starves at ${Math.round(g.getStarvationTime())}`
                ),
                null,
                2
            );
        // Apples spawn on each tree about once per second
        this.trees.forEach((tree) => {
            if (tree.getNextAppleTime() < this.gameTime) {
                this.addAppleToTree(tree);
                tree.resetAppleClock();
            }
        });
        // Giraffe-only rules
        this.giraffes.forEach((giraffe) => {
            if (giraffe.dead) {
                return;
            }
            // Giraffes change direction randomly
            if (giraffe.getNextDirectionChangeTime() < this.gameTime) {
                giraffe.changeDirection();
                giraffe.resetChangeDirectionClock();
            }
            // Giraffes may move
            const newX = giraffe.body.x + giraffe.getDirection() * frames;
            giraffe.body.x = clamp(
                newX,
                0,
                App.view.width - giraffe.getBodyWidth()
            );
            // Giraffes may starve
            if (giraffe.getStarvationTime() < this.gameTime) {
                giraffe.onStarve();
                // Let's not deletes these - we may want to keep track of dead giraffes for scoring or something.
                // There shouldn't be so many of them that it causes a problem, though it is a memory leak.
                giraffe.dead = true;
            }
        });
        // Apple/giraffe collisions result in the giraffe eating the apple
        // We can improve slightly upon the naive O(n^2) algorithm by comparing giraffes with tree canopies instead of apples as a first pass.

        // memoize the bounds, this is for some reason a little expensive for Pixi to calculate. We know they're not going to change within this tick.
        this.trees.forEach(
            (tree) => (tree._canopyBounds = tree.getCanopyRegion())
        );
        const _appleBounds = new Map();
        this.giraffes.forEach((giraffe) => {
            const giraffeBounds = giraffe.getHeadRegion();
            this.trees.forEach((tree) => {
                if (hitTestRectangle(giraffeBounds, tree._canopyBounds)) {
                    tree.getApples().forEach((apple) => {
                        if (!_appleBounds.has(apple)) {
                            _appleBounds.set(apple, apple.body.getBounds());
                        }
                        if (
                            hitTestRectangle(
                                giraffeBounds,
                                _appleBounds.get(apple)
                            )
                        ) {
                            apple.onEaten();
                            tree.onEaten(apple);
                            giraffe.onEat(this.gameTime);
                            this.apples.delete(apple);
                        }
                    });
                }
            });
        });
        // Game ends after 25 seconds (avoid crashing the tab!)
        if (this.gameTime > 25000) {
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
        e("div", { id: "fps-meter" }, []),
        e("div", { id: "game-time" }, []),
        e("pre", { id: "giraffe-debug" }, []),
    ]);
}
