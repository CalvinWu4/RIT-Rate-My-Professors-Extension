# RIT Rate My Professors Extension

[**Chrome** extension][link-chrome] [<img valign="middle" src="https://img.shields.io/chrome-web-store/v/lcionigofpcbfpmnipnioapimoggnbda.svg?label=%20">](https://chrome.google.com/webstore/detail/rate-my-professors-for-ri/lcionigofpcbfpmnipnioapimoggnbda?hl=en&authuser=0)

[**Firefox** addon][link-firefox] [<img valign="middle" src="https://img.shields.io/amo/v/rate-my-professors-for-rit.svg?label=%20">][link-firefox]

[Click here for the version that works for any school](https://github.com/CalvinWu4/Any-School-Rate-My-Professors-Extension)

This extension shows the [Rate My Professors](https://www.ratemyprofessors.com/) ratings of professors while searching for classes on [Tiger Center](https://tigercenter.rit.edu/tigerCenterApp/api/class-search) and [CSH Schedule Maker](https://schedulemaker.csh.rit.edu/).

Professors' names will link to their Rate My Professors page (or the search results if not found).

To better find professors, this extension will try different first/middle name combos. It will also try all associated nicknames and diminutive names from [here](https://github.com/carltonnorthern/nickname-and-diminutive-names-lookup). For example, Andrew Meneely on RIT's course search is found as Andy Meneely on Rate My Professors. Finally, there is [a list](https://github.com/CalvinWu4/Rate-My-Professor-Extension/blob/master/src/content/utils.mjs#L2) of custom nicknames (e.g. Thiagarajah Arujunan should refer to Al Arujunan).

![Screenshot](images/screenshot.png)
![Screenshot](images/screenshot2.png)

[link-chrome]: https://chrome.google.com/webstore/detail/rate-my-professors-for-ri/lcionigofpcbfpmnipnioapimoggnbda?hl=en&authuser=0 "Version published on Chrome Web Store"
[link-firefox]: https://addons.mozilla.org/en-US/firefox/addon/rate-my-professors-for-rit/ "Version published on Mozilla Add-ons"


## Building

The build process goes through a few stages.

If you just want to run a build, use one of the following commands based on whether you want dev/prod builds and what browser you are building for:
- `npm run build-dev:chrome`
- `npm run build-dev:firefox`
- `npm run build:chrome`
- `npm run build:firefox`

You'll probably want to `npm install` first if you haven't already.

`npm run release` will run the `clean`, `build:chrome`, and `build:firefox` targets to generate two production zip files from a clean build folder which should be ready for distribution

To run the extension in your browser for development purposes, follow these instructions:

https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension

Testing the output to ensure extensions are valid (using `web-ext lint`) is done automatically as part of the build process. Packaging the extension into a .zip file is also automatic.

To run unit tests: `npm run test`