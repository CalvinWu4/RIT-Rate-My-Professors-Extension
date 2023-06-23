
const customNames = {
	'Thiagarajah Arujunan': 'Al Arujunan',
	'Abdulmutalib Masaud-Wahaishi': 'Abdul Wahaishi',
};


const surnameParticles = ['a', 'à', 'af', 'al', 'am', 'aus\'m', 'aus’m', 'av', 'aw', 'ben', 'da', 'dai', 'dal', 'de',
	'de\'', 'de’', 'dei', 'del', 'dela', 'della', 'den', 'der', 'des', 'di', 'do', 'dos', 'du', 'el', 'la', 'las',
	'le', 'li', 'lo', 'los', 'mac', 'ó', 'of', 'op', 'san', 'st', 'st.', '\'t', '’t', 'te', 'ten', 'ter', 'thoe',
	'tot', 'van', 'vanden', 'vander', 'vom', 'von', 'y', 'z', 'zu', 'zum', 'zur'];

export function replaceCustomNicknames(fullName) {
	if (customNames[fullName]) {
		return customNames[fullName];
	}

	return fullName;
}

export function roundTo(number, places){
	return Math.round(number * Math.pow(10, places)) / Math.pow(10, places);
}

/**
 * 	Filter out names that are not valid names
 * @param {*} input the input string to evaluate
 * @returns the input if it is valid, or an empty string if invalid 
 */
export function filterNonProfessors(input) {
	const nonprofs = [
		"TBA",
		"- To Be Determined",
		"undefined"
	];
	if (nonprofs.includes(input)) {
		return ""
	}
	return input
}


// Return all possible non-null subset combos from an array
function combinations(array) {
	let combos = new Array(1 << array.length).fill().map(
		(e1, i) => array.filter((e2, j) => i & 1 << j),
	);
	// Filter out null combo
	combos = combos.filter((a) => a.length > 0);

	return combos;
}


export function getNameCombos(nameArray) {
	nameArray = combinations(nameArray);

	// Filter out name combos that only contain surname particles
	function isSubset(arr) {
		return arr.every((val) => surnameParticles.includes(val.toLowerCase()));
	}

	return nameArray.filter((combo) => !isSubset(combo));
}
