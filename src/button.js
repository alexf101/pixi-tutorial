export function makeButton(fgText, onClick) {
    const button = new PIXI.Container();
    const foreground = new PIXI.Text(fgText, {
        fontFamily: "Arial",
        fontSize: 18,
        fill: 0x87cefa,
        align: "left",
        fontWeight: "bold",
    });
    foreground.resolution = 2;
    foreground.x = 12;
    foreground.y = 12;
    const background = new PIXI.Graphics();
    background.cursor = "pointer";
    background.interactive = true;
    background.on("click", onClick);
    background.beginFill(0xffff00);
    background.lineStyle(3, 0xff0000);
    background.drawRect(0, 0, foreground.width + 24, foreground.height + 24);
    button.addChild(background);
    button.addChild(foreground);
    return button;
}
