import { makeSpriteFromLoadedResource } from "./pixi.js";

//Create a Pixi Application
export const App = new PIXI.Application({
    width: 512,
    height: 512,
    antialias: true,
});

export class Giraffe {
    static LoadPromise = null;
    static async Load() {
        if (this.LoadPromise !== null) {
            return this.LoadPromise;
        }
        this.LoadPromise = new Promise((resolve, reject) => {
            PIXI.Loader.shared
                .add([
                    "images/giraffe-whole.png",
                    "images/giraffe-legs.png",
                    "images/giraffe-head.png",
                    "images/giraffe-neck.png",
                ])
                .load(resolve);
        });
        return this.LoadPromise;
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
        this.head.x = x + 24;
        this.head.y = y;
        // this.head.y = y - headOffset;
        const headHeight = 32;
        this.head.width = 20;
        this.head.height = headHeight;
        this.neck.x = x + 18;
        this.neck.y = y + headHeight;
        // this.neck.y = y - neckOffset;
        this.neck.width = 16;
        this.neck.height = this.neckLength;
        this.legs.x = x;
        this.legs.y = y + headHeight + this.neckLength;
        this.legs.width = 32;
        this.legs.height = 32;
        this.stage.addChild(this.head);
        this.stage.addChild(this.neck);
        this.stage.addChild(this.legs);
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

await Giraffe.Load();
const g1 = new Giraffe(App.stage);
g1.addAtPos(App.screen.width / 4, App.screen.height / 4);

const e = React.createElement;
export function Controls() {
    return e("div", {}, [
        "Neck length: ",
        e("input", {
            onChange: (val) => {
                let neckLength = parseInt(val.currentTarget.value);
                g1.neckLength = neckLength;
                g1.refresh();
            },
        }),
    ]);
}
