// you can just require .json, saves the 'fs'-hassle
const path = require('path');

const pkgjson = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'build');
const DIST_DIR = path.resolve(__dirname, 'dist');
const SRC_DIR = path.resolve(__dirname, 'src');
const MANIFEST_FILE = 'manifest.json';

const manifestPath = path.join(SRC_DIR, MANIFEST_FILE);


function transformName(input) {

	let names = input.split("-");

	names = names.map((val, index) => {
		if (val == "rit") {
			return val.toUpperCase()
		} else {
			return val.charAt(0).toUpperCase() + val.slice(1);
		}
	})
	return names.join(" ")
}

function modify(buffer) {
	// copy-webpack-plugin passes a buffer
	var manifest = JSON.parse(buffer.toString());

	// make any modifications you like, such as
	manifest.version = pkgjson.version;
	manifest.description = pkgjson.description;
	manifest.author = pkgjson.author;
	manifest.name = transformName(pkgjson.name);

	// pretty print to JSON with two spaces
	manifest_JSON = JSON.stringify(manifest, null, 2);
	return manifest_JSON;
}


module.exports = {
	//For some reason, webpack insists on having an entrypoint and making some JS
	//here we give it an entrypoint it cant make anything useful from and then later we use FileManagerPlugin to delete the generated file
	// webpack is only being used to copy data from package.json into manifest.json
	entry: ['./src/manifest.json'],
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: manifestPath,
					to: BUILD_DIR,
					transform(content, path) {
						return modify(content)
					}
				}
			]
		}),
		new FileManagerPlugin({
			events: {
				onEnd: {
					delete: [path.join(DIST_DIR, 'main.js')],
				},
			},
		})
	]

};
