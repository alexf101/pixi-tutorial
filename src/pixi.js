export function loadAllResources(...resources) {
    return new Promise((resolve, reject) => {
        PIXI.Loader.shared.add(resources.flat()).load(resolve);
    });
}

export function makeSpriteFromLoadedResource(name) {
    return new PIXI.Sprite(PIXI.Loader.shared.resources[name].texture);
}
