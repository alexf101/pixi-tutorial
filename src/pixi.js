export function makeSpriteFromLoadedResource(name) {
    return new PIXI.Sprite(PIXI.Loader.shared.resources[name].texture);
}
