export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

export function gameTimeToMilliseconds(delta) {
    // Delta is measured in frames at 60 fps, convert it to milliseconds for simplicity.
    return 1000 * (delta / 60);
}
