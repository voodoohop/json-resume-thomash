#!/usr/bin/env node

const [oldTranslationFilename, newTranslationFilename] = process.argv.slice(2);

console.log(`merging ${newTranslationFilename} with  ${oldTranslationFilename}`);

const oldTranslations = require(oldTranslationFilename);

const newTranslations = require(newTranslationFilename);

const {mapObject} = require("underscore");

const annotatedNewTranslations = mapObject(newTranslations,(t) => `[autotranslate] ${t}`);


const mergedTranslations = {...annotatedNewTranslations, ...oldTranslations};

var fs = require('fs');

fs.writeFileSync(newTranslationFilename, JSON.stringify(mergedTranslations,null,4),"utf-8")