export function formatSeconds(seconds: number) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = (seconds % 60).toString();
    if (remainingSeconds.length === 1) {
        remainingSeconds = "0" + remainingSeconds;
    }

    return minutes + ":" + remainingSeconds;
}