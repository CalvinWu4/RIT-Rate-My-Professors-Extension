#!/bin/bash

mkdir -p build
mkdir -p dist

cd build/chrome; zip -r ../../dist/chrome.zip *; cd ../..
cd build/firefox; zip -r ../../dist/firefox.xpi *; cd ../..

if [ -z "$1" ]
  then
    # No first argument supplied, deleting build dir
	rm -rf build
fi
