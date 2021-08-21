//Create a Pixi Application
export const App = new PIXI.Application({ width: 512, height: 512 });

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
    }
    show(x, y) {
        const sprite = new PIXI.Sprite(
            PIXI.Loader.shared.resources["images/giraffe-whole.png"].texture
        );
        sprite.x = x;
        sprite.y = y;
        sprite.width = 32;
        sprite.height = 32;
        this.stage.addChild(sprite);
    }
}

await Giraffe.Load();
const g1 = new Giraffe(App.stage);
g1.show(App.screen.width / 4, App.screen.height / 4);
