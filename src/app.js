import { Giraffe } from "./giraffe.js";
import { loadAllResources, makeSpriteFromLoadedResource } from "./pixi.js";
import { Tree } from "./tree.js";
import { Apple } from "./apple.js";
import { getResources } from "./register.js";
import {
    clamp,
    gameTimeToMilliseconds,
    hitTestRectangle,
    shallowNaNWatch,
} from "./util.js";
import { makeButton } from "./button.js";

//Create a Pixi Application
export const App = new PIXI.Application({
    width: 512,
    height: 512,
    antialias: true,
});

await loadAllResources(...getResources());

class Game {
    constructor() {
        this.playScene = new PIXI.Container();
        this.apples = new Map();
        this.giraffes = [];
        this.trees = [];
        this.gameTime = 0;
        this.gameSpeedMultipler = 1;
        this.makeGiraffes();
        this.makeTrees();
        this.makeApples();
        this.makeGreatTree();
        App.stage.addChild(this.playScene);
    }
    start() {
        this.ticker = App.ticker.add(this.tick.bind(this));
    }
    makeGiraffes() {
        for (let i = 0; i < 10; i++) {
            const giraffe = shallowNaNWatch(
                new Giraffe(this.playScene, this.gameTime)
            );
            this.giraffes.push(giraffe);
            giraffe.addAtPos(
                Math.random() * (App.view.width - giraffe.getBodyWidth()),
                App.view.height - 20
            );
        }
    }
    makeTrees() {
        for (let i = 0; i < 6; i++) {
            const tree = shallowNaNWatch(new Tree(this.playScene));
            tree.makeDraggable();
            this.trees.push(tree);
            tree.addAtPos(
                Math.random() * (App.view.width - tree.getBodyWidth()),
                App.view.height - 20
            );
        }
    }
    makeGreatTree() {
        const tree = new Tree(this.playScene);
        tree.onAppleEatenHook = (apple, giraffe) => {
            this.win = true;
            this.winningGiraffe = giraffe;
        };
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
        const apple = new Apple(this.playScene);
        this.apples.set(apple, apple);
        tree.addApple(apple);
    }
    tick(rawFrames) {
        frames = rawFrames * this.gameSpeedMultipler;
        this.gameTime += gameTimeToMilliseconds(frames);
        try {
            if (window.DEBUG_MODE) {
                showDebugOutput(this, rawFrames);
            }
        } catch (err) {
            console.log(err);
        }
        if (this.win) {
            if (this.playScene.visible) {
                this.showScore();
            }
            // this.ticker.stop();
        } else if (this.giraffes.filter((g) => !g.dead).length === 0) {
            let text = new PIXI.Text("All the giraffes died! :(", {
                fontFamily: "Arial",
                fontSize: 24,
                fill: 0xffff10,
                align: "center",
            });
            text.x = (App.view.width - text.width) / 2;
            text.y = text.height;
            this.playScene.addChild(text);
            // this.ticker.stop();
        } else {
            this.play();
        }
    }
    showScore() {
        this.playScene.visible = false;
        this.finalScore = new PIXI.Container();
        this.highScoreContainer = new PIXI.Container();
        this.familyTreeContainer = new PIXI.Container();
        this.familyTreeContainer.visible = false;
        const victoryMessage = new PIXI.Text("Congratulations! You win! :)", {
            fontFamily: "Arial",
            fontSize: 24,
            fill: 0xffff10,
            align: "center",
            fontWeight: "bold",
        });
        victoryMessage.x = (App.view.width - victoryMessage.width) / 2;
        victoryMessage.y = victoryMessage.height;
        this.finalScore.addChild(victoryMessage);
        this.highScoreContainer.addChild(this.winningGiraffe.body);
        // Show some info about the winning giraffe
        const linesShownSoFar = [];
        const infoText = (msgText) => {
            const msg = new PIXI.Text(msgText, {
                fontFamily: "Arial",
                fontSize: 18,
                fill: 0x87cefa,
                align: "left",
                fontWeight: "bold",
            });
            msg.resolution = 2;
            msg.x = App.view.width / 3;
            msg.y =
                3 * victoryMessage.height + linesShownSoFar.length * msg.height;
            this.highScoreContainer.addChild(msg);
            linesShownSoFar.push(msg);
        };
        infoText(
            `Total apples eaten: ${this.giraffes.reduce((soFar, g) => {
                if (typeof g._applesConsumed === "number") {
                    return soFar + g._applesConsumed;
                } else {
                    return soFar;
                }
            }, 0)}`
        );
        infoText("");
        infoText("Your winning Giraffe was:");
        infoText("");
        infoText(
            `  • born at ${roundTo(
                this.winningGiraffe._bornAt / 1000,
                1
            )} seconds`
        );
        const ancestorCount = this.winningGiraffe.countAncestors();
        infoText(`  • the child of ${ancestorCount} generations`);
        infoText(
            `  • ate the Great Apple at ${roundTo(
                this.winningGiraffe._lastAteAt / 1000,
                1
            )} seconds`
        );
        const button = makeButton("Show family tree", () => {
            this.highScoreContainer.visible = false;
            this.familyTreeContainer.visible = true;
        });
        button.x = App.view.width / 3 + 40;
        button.y = linesShownSoFar.slice(-1)[0].y + 80;
        const backButton = makeButton("Show info again", () => {
            this.highScoreContainer.visible = true;
            this.familyTreeContainer.visible = false;
        });
        backButton.x = 150;
        backButton.y = 68;
        // Show all the ancestors in order of their generation.
        const gapBetweenGiraffes = (App.view.width - 96) / ancestorCount;
        let nextPos = 48;
        this.winningGiraffe.eachAncestor((ancestor) => {
            console.log("nextPos: ", nextPos); // XX
            ancestor.x = nextPos;
            ancestor.setDirection(1);
            nextPos += gapBetweenGiraffes;
            this.familyTreeContainer.addChild(ancestor.body);
        });
        // Show the winning giraffe
        this.winningGiraffe.x = 48;
        this.winningGiraffe.setDirection(1);
        this.finalScore.addChild(this.winningGiraffe.body);
        this.familyTreeContainer.addChild(backButton);
        this.highScoreContainer.addChild(button);
        this.finalScore.addChild(this.highScoreContainer);
        this.finalScore.addChild(this.familyTreeContainer);
        App.stage.addChild(this.finalScore);
    }
    play() {
        // Apples spawn on each tree about once per second
        this.trees.forEach((tree) => {
            if (tree.getNextAppleTime() < this.gameTime) {
                this.addAppleToTree(tree);
                tree.resetAppleClock();
            }
            // memoize the bounds, this is for some reason a little expensive for Pixi to calculate. We know they're not going to change within this tick, and we'll need them a bunch of times.
            tree._canopyBounds = tree.getCanopyRegion();
        });
        const _appleBounds = new Map();
        this.giraffes.forEach((giraffe) => {
            if (giraffe.dead) {
                return;
            }
            if (giraffe.mitosisComplete(this.gameTime)) {
                // Mutating things while iterating them makes me queasy. Let's do it after instead.
                setTimeout(() => {
                    for (let i = 0; i < 2; i++) {
                        const giraffeChild = new Giraffe(
                            this.playScene,
                            this.gameTime
                        );
                        const plusOrMinusOne = 2 * i - 1;
                        giraffeChild.neckLength =
                            giraffe.neckLength + 40 * (Math.random() - 0.5);
                        giraffeChild.addAtPos(
                            giraffe.x - plusOrMinusOne * 10,
                            giraffe.y
                        );
                        giraffeChild.setParent(giraffe);
                        giraffe.setDirection(plusOrMinusOne);
                        this.giraffes.push(giraffeChild);
                    }
                });
                giraffe.remove();
                giraffe.dead = true;
            }
            if (giraffe.isUndergoingMitosis()) {
                return;
            }
            const giraffeBounds = giraffe.getHeadRegion();
            // Giraffes change direction ~randomly~ towards the nearest tree canopy at their neck height
            if (giraffe.getNextDirectionChangeTime() < this.gameTime) {
                // giraffe.changeDirection();
                // There's really not that many trees, this should be fine.
                let closestTree = { tree: null, distBetweenCenters: 1000 };
                this.trees.forEach((tree) => {
                    if (
                        giraffeBounds.y + giraffeBounds.height >
                            tree._canopyBounds.y &&
                        giraffeBounds.y <
                            tree._canopyBounds.y + tree._canopyBounds.height
                    ) {
                        let distBetweenCenters = Math.abs(
                            giraffeBounds.x +
                                giraffeBounds.width / 2 -
                                (tree._canopyBounds.x +
                                    tree._canopyBounds.width / 2)
                        );
                        if (
                            distBetweenCenters < closestTree.distBetweenCenters
                        ) {
                            closestTree = { tree, distBetweenCenters };
                        }
                    }
                });
                if (closestTree.tree !== null) {
                    giraffe.setDirection(
                        closestTree.tree._canopyBounds.x +
                            closestTree.tree._canopyBounds.width / 2 >
                            giraffeBounds.x + giraffeBounds.width / 2
                            ? 1
                            : -1
                    );
                } else {
                    // There's no trees. Oh well. Choose at will.
                    giraffe.changeDirection();
                }
                giraffe.resetChangeDirectionClock();
            }
            // Giraffes may move
            const newX = giraffe.body.x + giraffe.getDirection() * frames;
            if (giraffe._direction === -1) {
                // Ergh... I've implemented this with negative scale X, and I can't seem to move the pivot point correctly to offset this.
                giraffe.x = clamp(newX, giraffe.getBodyWidth(), App.view.width);
            } else {
                giraffe.x = clamp(
                    newX,
                    0,
                    App.view.width - giraffe.getBodyWidth()
                );
            }
            giraffe.reposition();
            // Giraffes may grow weakened by hunger
            if (giraffe.getSicklyTime() < this.gameTime) {
                giraffe.onSickly();
            }
            // Giraffes may starve
            if (giraffe.getStarvationTime() < this.gameTime) {
                giraffe.onStarve();
                // Let's not deletes these - we may want to keep track of dead giraffes for scoring or something.
                // There shouldn't be so many of them that it causes a problem, though it is a memory leak.
                giraffe.dead = true;
            }
            // Apple/giraffe collisions result in the giraffe eating the apple
            // We can improve slightly upon the naive O(n^2) algorithm by comparing giraffes with tree canopies instead of apples as a first pass.
            // Giraffes can't eat more than one apple on a single tick.
            giraffe._eatenThisTick = false;
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
                            if (!giraffe._eatenThisTick) {
                                apple.onEaten();
                                tree.onEaten(apple, giraffe);
                                giraffe.onEat(this.gameTime);
                                this.apples.delete(apple);
                            }
                            giraffe._eatenThisTick = true;
                        }
                    });
                }
            });
        });
        // Game ends after 5 minutes (avoid crashing the tab if you forget about it!)
        if (this.gameTime > 1000 * 60 * 5) {
            this.ticker.stop();
        }
    }
}
export const game = shallowNaNWatch(new Game());
window.DBG_game = game;

function showDebugOutput(game, rawFrames) {
    document.getElementById("fps-meter").textContent =
        "FPS: " + Math.round(rawFrames * 60);
    document.getElementById("game-time").textContent =
        "Game time: " + Math.round(game.gameTime);
    document.getElementById("giraffe-debug").textContent =
        "Giraffes: " +
        JSON.stringify(
            game.giraffes.map(
                (g) =>
                    `Born at ${g._bornAt}. Last ate at ${Math.round(
                        g._lastAteAt
                    )}. Hungry at ${Math.round(
                        g.getSicklyTime()
                    )}. Starves at ${Math.round(
                        g.getStarvationTime()
                    )}. Apples eaten: ${g._applesConsumed}`
            ),
            null,
            2
        );
}
function roundTo(t, precision) {
    let factor = 10 ** precision;
    return Math.round(t * factor) / factor;
}
const e = React.createElement;
export function Controls() {
    return e("div", {}, [
        e("div", {}, [
            "Game speed multiplier: ",
            e("input", {
                onChange: (val) => {
                    let gameSpeed = parseInt(val.currentTarget.value);
                    if (typeof gameSpeed === 'number' && !Number.isNaN(gameSpeed)) {
                        game.gameSpeedMultipler = clamp(gameSpeed, 0.5, 10);
                    } else {
                        game.gameSpeedMultipler = 1;
                    }
                },
            }),
        ]),
        window.DEBUG_MODE && ("div", {}, [
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
        window.DEBUG_MODE && ("div", {}, [
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
