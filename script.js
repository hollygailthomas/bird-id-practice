// code below imports a normative list of species, derived from the ABA checklist via python script 'birdlist.py'. I don't actually use this yet, but in principal it could be used to check that common names are consistent.
// import {birdies} from './birdlist.js';

// defines a class that will be used to turn the json file of Macaulay data into a list of objects where the important information is a bit easier to find and manipulate. To-dos: prettify the dateString format, which is what actually shows up in the page.
class Bird {
  constructor(object) {
    this.catalogID = object['ML Catalog Number'];
    this.commonName = object['Common Name'].split('(')[0].trim();
    this.genus = object['Scientific Name'].split(' ')[0];
    this.date = new Date(Number.parseInt(object['Year'], 10), Number.parseInt(object['Month']) - 1, Number.parseInt(object['Day']))
    this.originalHeight = Number.parseInt(object['Original Image Height'], 10);
    this.originalWidth = Number.parseInt(object['Original Image Width'], 10);
    this.recordist = object['Recordist'];
    this.locality = object['Locality'];
    this.state = object['State'];
    this.county = object['County'];
    this.checklist = object['eBird Checklist ID']
    this.taxonSort = parseInt(object['Taxonomic Sort'], 10);
  }

  get dateString() {
    return this.date.toDateString();
  }
  get mainURL() {
    return `https://macaulaylibrary.org/asset/${this.catalogID}`
  }
  get largeImage() {
    return `https://cdn.download.ams.birds.cornell.edu/api/v1/asset/${this.catalogID}/2400`
  }
  get ebird() {
  	return `https://ebird.org/checklist/${this.checklist}`
  }
  get frameSource() {
  	return `https://macaulaylibrary.org/asset/${this.catalogID}/embed/640`
  }
}

// below is a list of variables assigned to important elements of the page.
const clearButton = document.querySelector('#clearCurrent');
const clearHistory = document.querySelector('#clearHistory')
const county = document.querySelector('#county');
const date = document.querySelector('#date');
const ebird = document.querySelector('#checklist');
const filterButton = document.querySelector('#filter');
const filterContainer = document.querySelector('#filterContainer');
const filterList = document.querySelector('#filter-list');
const filterPanel = document.querySelector('#filterPanel');
const frame = document.querySelector('#frameContainer');
const height = document.querySelector('#height');
const hideFilter = document.querySelector('#hide-filter');
const iFrame = document.querySelector('iframe');
const largeImage = document.querySelector('#large_image');
const locality = document.querySelector('#locality');
const mask1 = document.querySelector('#maskingDiv1');
const mask2 = document.querySelector('#maskingDiv2');
const MLLink = document.querySelector('#ML_link');
const newImageButton = document.querySelector('#newImage');
const recordist = document.querySelector('#recordist');
const rotateLeft = document.querySelector('#rotate_left');
const rotateRight = document.querySelector('#rotate_right');
const showButton = document.querySelector('#showID');
const showFilter = document.querySelector('#showFilter');
const state = document.querySelector('#state');

// history is an object that is used to keep track of (1) what the user has viewed in the current session, and (2) what the user is currently viewing. It contains the methods for cycling through the history in either direction. It contains methods for clearing the current image (this needs to be fixed to clear the information as well as the image) and for clearing the whole session. Unfortunately, each cycle through the history currently involves reloading each Macaulay iframe. To-dos: Figure out a way to keep the frames loaded, but hidden. Fix the clear method--maybe by fixing the populate function and the html so that it works properly (shows nothing) given a falsy value as a parameter.
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

// code below implements the button that clears the current image. To-dos: implement a button that clears the whole history.
clearButton.addEventListener('click', () => {
	history.clear();
	});

// the code below defines the function that chooses a random item from any list of items, then makes the item into the current item in history, and then returns the item. There is some redundancy here; maybe refactor.
const chooseItem = (dataList) => {
	const randCat = dataList[Math.floor(Math.random() * dataList.length)];
	history.add(randCat);
  	return randCat;
};

// the code below initializes important variables used by the script. To-do: package all of this into one initialize function, or maybe two: one for the initial load, and one for when a filter is applied.
// currentData will be the list of objects derived from the Macaulay json file.
let currentData = [];
// currentSpecies will be the set of species (common names) actually occurring in currentData.
let currentSpecies = new Set();
// filterSet will be the set of species (common names) selected by the user when the filter is applied.
let filterSet = new Set();
// filteredData will be the list of objects available when the filter is applied.
let filteredData = []
// the default (of course) is that the images are not filtered.
let filter = false;
// speciesID is not yet used. It is reserved for when the slideshow quiz functionality gets implemented.
let speciesID = '';

// filterfn populates filteredData with the list of objects that satisfy the applied filter.
const filterfn = (filterSet) => {
	filteredData = currentData.filter(item => filterSet.has(item.commonName));
};

// the code below defines the function that controls the display and contents of crucial page elements, including the randomly chosen iframe. It is doing too much work. I should refactor into a set of different functions.
const populate = (chosenItem) =>
{
mask1.classList.remove('transparent');
iFrame.addEventListener('load', () => {
	mask1.classList.add('transparent');
});
iFrame.src = chosenItem.frameSource;
speciesID = chosenItem.commonName;
MLLink.setAttribute('href', chosenItem.mainURL);
MLLink.textContent = `Macaulay Library ML${chosenItem.catalogID}`;
// To-do: refactor checklist settings so that they deal properly with the case when there is no checklist.
checklist.textContent = `eBird checklist ${chosenItem.checklist}`;
checklist.setAttribute('href', chosenItem.ebird);
recordist.textContent = `© ${chosenItem.recordist}`;
locality.textContent = chosenItem.locality;
// To-do: refactor the following so that they deal properly with non-US localities.
state.textContent = chosenItem.state;
county.textContent = chosenItem.county;
largeImage.setAttribute('href', chosenItem.largeImage);
// height doesn't actually need to be displayed on the page in production. It is here so that I can check the height of iframes that do or don't display properly.
height.textContent = chosenItem.originalHeight;
// To-do: make the date format prettier.
date.textContent = chosenItem.dateString;
mask2.classList.remove('transparent');
showButton.textContent = 'show posted ID';
showButton.style.display = 'none';
};

// the following puts the objects derived from the Macaulay data json file into currentData. To-do: allow the user to choose different sets of birds, instead of having this hard-coded.
fetch('./Short Cold Birdies.json')
.then(response => response.json())
.then(data => {
// the line below populates currentData with the filtered objects derived from the huge json file.
currentData = data.map(datum => new Bird(datum))
//the following sort line attempts to sort the items taxonomically, so that the filter buttons show up in taxonomic order. This is clunky and could be refactored.
	.sort((a, b) => a.taxonSort > b.taxonSort)
// The filter based on height and width is to eliminate iframes that don't display properly. This is clunky and unfortunate (I lose about 1/3 of the images), but I don't yet know whether it is possible to deal in some other way with the problem cases (e.g., by adjusting the position of the masking divs).
	.filter(item => {return (item.originalHeight > 1137 && (item.originalHeight / item.originalWidth) >= .625) });
// the line below populates currentSpecies with the set of species (common names) actually found in currentData.
currentSpecies = new Set(currentData.map(datum => datum.commonName));
// the line below creates the buttons used for filtering by species common names.
currentSpecies.forEach(item => {
	filterContainer.insertAdjacentHTML('beforeend', `<button>${item}</button>`)
});
// once the filtering buttons have been created, the code below creates a variable that refers to them collectively, then makes each activated button correspond to an item in filterSet. As far as I can tell, this is all functioning properly.
const speciesButtons = document.querySelectorAll('#filterContainer button');
speciesButtons.forEach(button => {
	button.addEventListener('click', event => {
		event.currentTarget.classList.toggle('active');
		if (event.currentTarget.classList.contains('active')) {
		filterSet.add(event.currentTarget.textContent);
		}
		else {
		filterSet.delete(event.currentTarget.textContent);
		}
	});
});
// the lines below apply or clear the filter. This has to be here (inside the promise), because it depends on the existence of speciesButtons.
filterButton.addEventListener('click', event => {
	if (!filter) {
		filter = true;
		console.log(filterSet);
		filterfn(filterSet);
		window.alert(`There are ${filteredData.length} items in the filtered set.`);
		speciesButtons.forEach(button => {
			button.setAttribute('disabled', 'disabled');
		filterPanel.style.display = 'none';
		});
		filterList.textContent = Array.from(filterSet).join(' | ');
	}
})

// the line below sets the initial random image. Maybe refactor this so that there is no initial image?
populate(chooseItem(currentData));
showFilter.addEventListener('click', (event) => {
	if (!filter) {
		filterPanel.style.display = 'initial';
		event.currentTarget.textContent = 'Clear Filter';
	}
	else {
		filter = false;
		filterSet.clear();
		filteredData.length = 0;
		event.currentTarget.textContent = 'Show Filter Panel';
		speciesButtons.forEach(button => {
			button.removeAttribute('disabled');
			button.classList.remove('active');
		});
		filterList.textContent = '';
	}
})
hideFilter.addEventListener('click', () => {
	filterPanel.style.display = 'none';
		filter = false;
		filterSet.clear();
		filteredData.length = 0;
		showFilter.textContent = 'Show Filter Panel';
		speciesButtons.forEach(button => {
			button.removeAttribute('disabled');
			button.classList.remove('active');
		});
})
})
// this is the end of the asynchronous code.

// the code below implements the newImageButton, depending on whether or not a filter has been applied.
newImageButton.addEventListener('click', (event) => {
	showButton.textContent = 'show posted ID';
	if (!filter) {
		populate(chooseItem(currentData));
	} else {
		populate(chooseItem(filteredData));
	}
});

// the code below shows (makes transparent or display: none) or hides (makes opaque or display: something) the page elements that mask the ID information in the iframe. This depends on the css in the page.
showButton.addEventListener('click', event => {
	if (event.currentTarget.textContent == 'show posted ID') {
		mask2.classList.add('transparent');
		event.currentTarget.textContent = 'hide posted ID'
	} else {
		mask2.classList.remove('transparent');
		event.currentTarget.textContent = 'show posted ID';
	}
});

// the code below implements the buttons overlaying the iframe, which cycle back or forward through the history.
rotateLeft.addEventListener('click', event => {
	populate(history.rotateLeft());
	showButton.style.display = 'block';
});
rotateRight.addEventListener('click', event => {
	populate(history.rotateRight());
	showButton.style.display = 'block';
});
// the code below controls the display of the button that shows or hides the ID information.
const imageContainer = document.querySelector('#imageContainer');
imageContainer.addEventListener('mouseenter', (event) => {
	showButton.style.display = 'block';
	});
imageContainer.addEventListener('mouseleave', (event) => {
	showButton.style.display = 'none';
	});
clearHistory.addEventListener('click', () => {
	history.clearAll();
})
