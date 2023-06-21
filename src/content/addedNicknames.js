const customNames = {
	'Thiagarajah Arujunan': 'Al Arujunan',
	'Abdulmutalib Masaud-Wahaishi': 'Abdul Wahaishi',
};

function replaceCustomNicknames(fullName) {
	if (customNames[fullName]) {
		return customNames[fullName];
	}

	return fullName;
}
