try {
	importScripts('./background.js', './node_modules/papaparse/papaparse.js');
} catch (e) {
	console.error(e);
}
