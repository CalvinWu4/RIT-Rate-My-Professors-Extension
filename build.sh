#!/bin/bash

mkdir -p build; rm -rf build/*
mkdir -p dist; rm -rf dist/*
cp -r src build/firefox
cp -r src build/chrome
node mixin.js firefox/manifest.json build/firefox/manifest.json
cd build/chrome; zip -r ../../dist/chrome.zip *; cd ../..
cd build/firefox; zip -r ../../dist/firefox.xpi *; cd ../..

if [ -z "$1" ]
  then
    # No first argument supplied, deleting build dir
	rm -rf build
fi
