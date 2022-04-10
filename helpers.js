export default const convert = (width, height, option) => {
const options = [160, 320, 480, 640, 900, 1200, 1800, 2400];
if (options.indexOf(option) == -1) {
console.log('parameter must be an option');
} else {
const max = Math.max(width, height);
const ratio = option / max;
return [Math.round(width * ratio), Math.round(height * ratio)];
}
}