import WebExtPlugin from 'web-ext-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkgjson = require('./package.json');

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

// 👇️ "/home/john/Desktop/javascript"
const __dirname = path.dirname(__filename);

const BUILD_DIR = path.resolve(__dirname, 'build');

const DIST_DIR = path.resolve(__dirname, 'dist');
const IMG_DIR = path.resolve(__dirname, 'images');

const SRC_DIR = path.resolve(__dirname, 'src');
const MANIFEST_FILE = 'manifest.json';

const manifestPath = path.join(SRC_DIR, MANIFEST_FILE);

function transformName(input) {
	let names = input.split('-');

	names = names.map((val) => {
		if (val === 'rit') {
			return val.toUpperCase();
		}
		return val.charAt(0).toUpperCase() + val.slice(1);
	});
	return names.join(' ');
}

function modify(buffer, isFirefox) {
	// copy-webpack-plugin passes a buffer
	const manifest = JSON.parse(buffer.toString());

	// make any modifications you like, such as
	manifest.version = pkgjson.version;
	manifest.description = pkgjson.description;
	manifest.author = pkgjson.author;
	manifest.name = transformName(pkgjson.name);

	if (!isFirefox) {
		manifest.background.service_worker = manifest.background.scripts[0];
		delete manifest.background.scripts;
	}

	// pretty print to JSON with two spaces
	return JSON.stringify(manifest, null, 2);
}

export default function (env) {
	if (!env.browser) env.browser = "chrome";

	return {
		// For some reason, webpack insists on having an entrypoint and making some JS
		// here we give it an entrypoint it cant make anything useful from and then later we use
		// FileManagerPlugin to delete the generated file
		// webpack is only being used to copy data from package.json into manifest.json
		entry: {
			background: './src/background/index.js',
			content: './src/content/index.js',
		},
		devtool: env.production ? 'source-map' : 'cheap-source-map',
		output: {
			filename: '[name].bundle.js',
			path: BUILD_DIR,
		},
		plugins: [
			new CopyWebpackPlugin({
				patterns: [
					{
						from: manifestPath,
						to: BUILD_DIR,
						transform(content) {
							return modify(content, env.browser === "firefox");
						},
					},
					{
						from: IMG_DIR,
						to: path.join(BUILD_DIR, 'images'),
					},
					{
						from: path.resolve(SRC_DIR, 'content/content.css'),
						to: BUILD_DIR,
					},
					{
						from: path.resolve(SRC_DIR, '../node_modules/tippy.js/dist/tippy.css'),
						to: BUILD_DIR,
					},
					{
						from: path.resolve(SRC_DIR, '../node_modules/tippy.js/themes/light.css'),
						to: BUILD_DIR,
					},
				],
			}),
			new WebExtPlugin({
				sourceDir: BUILD_DIR,
				artifactsDir: DIST_DIR,
				buildPackage: true,
				overwriteDest: true,
				ignoreKnownChromeLintFailures: true,
				outputFilename: `${pkgjson.name}_${pkgjson.version}_${env.browser === 'firefox' ? "firefox" : "chrome"}${env.production?"":"_DEV"}.zip`
			})
		],

	};
}
