export function clamp(x, min, max) {
    if(x < min) x = min;
    if(x > max) x = max;
    return x;
}
