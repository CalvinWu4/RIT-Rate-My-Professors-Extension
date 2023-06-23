export default {
	"collectCoverage": true,
		"rootDir": "./",
			"testRegex": "test/.+\\.test\\.js",
				"transform": {
		'^.+\\.js?$': "babel-jest"
	},
	"moduleFileExtensions": ["js"],
		"moduleDirectories": [
			"node_modules",
			"lib"
		]
}