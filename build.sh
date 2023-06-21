#!/bin/bash

mkdir -p build
mkdir -p dist

cd build;
zip -r ../dist/chrome.zip *;
zip -r ../dist/firefox.xpi *;
cd ../

if [ -z "$1" ]
  then
    # No first argument supplied, deleting build dir
	rm -rf build
fi
