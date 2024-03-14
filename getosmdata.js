const {readFileSync, writeFileSync} = require('fs');

const DATAFILE = 'public/data.json';

var localData = {};
try {
	localData = JSON.parse(readFileSync(DATAFILE));
} catch (error) {}

const response = await fetch("https://overpass-api.de/api/interpreter", {
	"headers": {
		"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
	},
	"referrer": "https://overpass-turbo.eu/",
	"referrerPolicy": "strict-origin-when-cross-origin",
	"body": "data=%5Bout%3Ajson%5D%3B%0A(%0A++node%5Bshop%3Dbooks%5D(52.300081389496114%2C13.0133056640625%2C52.71549904109217%2C13.77685546875)%3B%0Anode%5Bamenity%3Dlibrary%5D(52.300081389496114%2C13.0133056640625%2C52.71549904109217%2C13.77685546875)%3B%0Anode%5Bamenity%3Dpublic_bookcase%5D(52.300081389496114%2C13.0133056640625%2C52.71549904109217%2C13.77685546875)%3B%0A++)%3B%0Aout%3B",
	"method": "POST",
	"mode": "cors",
	"credentials": "omit"
});
if (!response.ok) {
	console.log("Failed to get data");
} else {
	const data = await response.json();

	let added = 0, changed = 0, unchanged = 0;
	for (let el of data.elements) {
		if (el.id in localData) {
			// TODO always write coords?
			if (el.tags != localData[el.id].raw) { // FIXME proper comparison
				// console.log('has changes');
			}
		} else {
			const type = (el.tags.shop == 'books') ? 'bookshop' :
				(el.tags.amenity == 'library') ? 'library' :
					(el.tags.amenity == 'public_bookcase') ? 'street_lib' : 'unknown';
			console.log(`adding new ${type}: ${el.tags.name}`);
			localData[el.id] = {'type': type, 'coords': [el.lat, el.lon], 'raw': el.tags};
			added += 1;
		}
	}
	console.log(`added ${added} new entries`);
	console.log(`updated ${changed} existing entries`);

	writeFileSync(DATAFILE, JSON.stringify(localData, null, 2), 'utf8');
	console.log(`wrote ${Object.keys(localData).length} entries to ${DATAFILE}`);
}

//adding fields to data script
// const fs = require('fs');

// //read a json file
// let json = fs.readFileSync('data.json');
// let obj = JSON.parse(json);

// //add fields
// Object.keys(obj).forEach(key => obj[key] = {...obj[key], events: "", coffee: "", languages: [], orders: false, lessons: false, topics: []});

// //write to json file
// json = JSON.stringify(obj);
// fs.writeFileSync('new_data.json', json);
