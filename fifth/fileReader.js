const fs = require('fs');
const path = require('path');
const natural = require('natural');

const tokenizer = new natural.WordTokenizer();
const fileName = process.argv[2];


console.log(`Start parsing ${fileName}...`);
const text = fs.readFileSync(path.resolve('../../../Projects/t/ebooks-unzipped/', fileName), 'utf8');
const words = tokenizer.tokenize(text).map(word => {[fileName, word]});

process.send({words});