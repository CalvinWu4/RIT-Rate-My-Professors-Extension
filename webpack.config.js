// you can just require .json, saves the 'fs'-hassle
const path = require('path');

const pkgjson = require('./package.json');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, 'build');
const SRC_DIR = path.resolve(__dirname, 'src');
const MANIFEST_FILE = 'manifest.json';

const manifestPath = path.join(SRC_DIR, MANIFEST_FILE);


function modify(buffer) {
	// copy-webpack-plugin passes a buffer
	var manifest = JSON.parse(buffer.toString());

	// make any modifications you like, such as
	manifest.version = pkgjson.version;
	manifest.description = "blah";

	// pretty print to JSON with two spaces
	manifest_JSON = JSON.stringify(manifest, null, 2);
	return manifest_JSON;
}


module.exports = {
	output: {
		filename: MANIFEST_FILE,
		path: BUILD_DIR,
	},
	entry: manifestPath,
	module: {
		rules: [
			{
				test: /manifest.json$/,
				use: [
					// Second: JSON -> JS
					"json-loader",
					// First: partial manifest.json -> complete manifest.json
					"manifest-loader",
				]
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{
					from: "./src/manifest.json",
					to: BUILD_DIR,
					transform(content, path) {
						return modify(content)
					}
				}
			]
		})
	]

}
