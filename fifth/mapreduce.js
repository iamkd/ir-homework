const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const mapred = require('mapred')();
const natural = require('natural');
const uniq = require('array-unique');
const tokenizer = new natural.WordTokenizer();

const root = '../../../Projects/t/ebooks-unzipped/';

const fileNames = fs.readdirSync(path.resolve(root)).map(name => [name]).slice(0, 20);

function map(key) {
  const text = fs.readFileSync(path.resolve(root, key), 'utf8');
  const words = tokenizer.tokenize(text);
  return words.map(word => [word, key]);
}

function reduce(word, values) {
  return uniq(values);
}

function callback(result) {
  fs.writeFileSync('index.json', JSON.stringify(result, null, 2),  'utf8');
}

mapred(
  fileNames,
  map,
  reduce,
  callback
);


