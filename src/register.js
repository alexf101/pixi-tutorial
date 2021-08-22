const Resources = [];
export function registerResource(loader) {
    Resources.push(loader);
}
export function getResources() {
    return Resources.map((x) => x); // Just return a shallow clone to prevent modification.
}
