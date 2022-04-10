const convert = (width, height, option) => {
const options = [160, 320, 480, 640, 900, 1200, 1800, 2400];
if (options.indexOf(option) == -1) {
console.log('parameter must be an option');
} else {
const max = Math.max(width, height);
const ratio = option / max;
return [Math.round(width * ratio), Math.round(height * ratio)];
}
}
const history =
{ array: [],
	current: undefined,
	rotateRight: function() {
		if (this.current) {
			this.array.push(this.current);
		}
		const shifted = this.array.shift();
		this.current = shifted;
		return this.current;
	},
	rotateLeft: function() {
		if (this.current) {
			this.array.unshift(this.current);
		}
		const popped = this.array.pop();
		this.current = popped;
		return this.current;
	},
	add: function (item) {
    	if (this.current ) {
      		this.array.push(this.current);
    	};
    	this.current = item;
    },
	clear: function() {
		this.current = this.array.pop();
		populate(this.current);
	},
	clearAll: function() {
		this.array.length = 0;
		this.clear();
	}
};
