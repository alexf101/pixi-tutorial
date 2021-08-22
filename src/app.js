import { Giraffe } from "./giraffe.js";
import { loadAllResources, makeSpriteFromLoadedResource } from "./pixi.js";
import { Tree } from "./tree.js";

//Create a Pixi Application
export const App = new PIXI.Application({
    width: 512,
    height: 512,
    antialias: true,
});

await loadAllResources(
    Giraffe.Resources(),
    Tree.Resources()
    // [
    //     "images/tree-whole-big.png",
    // ]
);
// const dbg = makeSpriteFromLoadedResource("images/tree-whole-big.png");
// dbg.x = 200;
// dbg.y = 200;
// dbg.width = 32;
// dbg.height = 32;
// App.stage.addChild(dbg);

const g1 = new Giraffe(App.stage);
const t1 = new Tree(App.stage);
console.log(App.stage.height);
g1.addAtPos(100, 100);
t1.addAtPos(100, 400); //App.stage.height - 100);
console.log("t1", t1);
console.log(App.stage);
const e = React.createElement;
export function Controls() {
    return e("div", {}, [
        e("div", {}, [
            "Neck length: ",
            e("input", {
                onChange: (val) => {
                    let neckLength = parseInt(val.currentTarget.value);
                    g1.neckLength = neckLength;
                    g1.reposition();
                },
            }),
        ]),
        e("div", {}, [
            "Trunk length: ",
            e("input", {
                onChange: (val) => {
                    let trunkLength = parseInt(val.currentTarget.value);
                    t1.trunkLength = trunkLength;
                    t1.reposition();
                },
            }),
        ]),
    ]);
}
