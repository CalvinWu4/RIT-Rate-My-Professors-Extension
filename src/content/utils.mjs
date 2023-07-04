
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


function isSurnameParticle(value) {
 return surnameParticles.includes(value.toLowerCase())
}


export function getNameCombos(nameArray) {
	nameArray = combinations(nameArray);

	// Filter out name combos that only contain surname particles
	function isSubset(arr) {
		return arr.every((val) => isSurnameParticle(val));
	}

	return nameArray.filter((combo) => !isSubset(combo));
}


/**
 * Given a list of name parts (i.e. first, some number of middle names, and last), return an ordered list of strings built from those components sorted by most likely to be a match
 * @param {*} nameComponents a list of strings representing name parts, i.e. ['Tom', 'Holland']
 * @param {*} nicknames an object mapping a full name to a series of nicknames commonly used to refer to people of that name
 */
export function createProfessorSearchStrings(nameComponents, nicknames = []) {

	const firstName = nameComponents[0];
	const lastName = nameComponents[nameComponents.length - 1];
	let middleNames = []
	if (nameComponents.length > 2) {
		middleNames = nameComponents.slice(1, nameComponents.length - 1);
	}
	
	let nonParticleMiddleNames = middleNames.filter((val) => !isSurnameParticle(val))

	let searchStrings = []

	// [First Name] [Last Name]
	searchStrings.push(`${firstName} ${lastName}`)

	// [First Middle Name (that is not a surname particle)] [Last Name]
	// [Second Middle Name (that is not a surname particle)] [Last Name]
	// ..etc

	let middleNameSearchCombinations = nonParticleMiddleNames.map((middleName) => `${middleName} ${lastName}`)

	//If desired, apply a limit or split/interleave the list with other items to keep the most likely search results on top
	// middleNameSearchCombinations = middleNameSearchCombinations.slice(0, 3)

	searchStrings.push(...middleNameSearchCombinations)

	// [try all nicknames for First Name] [Last Name]
	let firstNicknames = nicknames[firstName]
	if (firstNicknames) {
		let firstNickSearchCombinations = firstNicknames.map((nick) => `${nick} ${lastName}`)

		searchStrings.push(...firstNickSearchCombinations)
	}


	// [try all nicknames for First Middle Name (that is not a surname particle)] [Last Name]
	// [try all nicknames for Second Middle Name (that is not a surname particle)] [Last Name]
	// ..etc

	let middleNickNameSearchCombinations = []
	for (const middleName of nonParticleMiddleNames) {
		let middleNicknames = nicknames[middleName]
		if (middleNicknames) {
			middleNameSearchCombinations.push(
				middleNicknames.map((middleNick) => `${middleNick} ${lastName}`)
			)
		}
	}

	//If desired, apply a limit or split/interleave the list with other items to keep the most likely search results on top
	// middleNickNameSearchCombinations = middleNickNameSearchCombinations.slice(0, 3)

	searchStrings.push(...middleNickNameSearchCombinations)

	return searchStrings
}