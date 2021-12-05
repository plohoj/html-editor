export function randomFromArray<T>(array: T[], from: number = 0, to: number = array.length): T {
    if (to < 0) {
        to = array.length + to;
    }
    return array[Math.floor(Math.random() * (to - from)) + from];
}
