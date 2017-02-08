const fs = require('fs');
const path = require('path');
//stemming
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
//post
const pos = require('pos');
const tagger = new pos.Tagger();

const fileNames = fs.readdirSync(path.join(__dirname, '../files'));
const texts = fileNames.map(name => fs.readFileSync(path.join(__dirname, '../files', name), 'utf8'));

const skipTypes = ['TO', 'UH', 'SYM', 'PRP', 'PP$', 'IN', 'CC', 'DT', 'FW'];

const taggedTexts = texts.map(text => {
  const words = tokenizer.tokenize(text);
  const stemmedWords = words.map(word => natural.PorterStemmer.stem(word.toLowerCase()));
  return tagger.tag(words);
});

//Biword index
const indexes = taggedTexts.map(text => {
  const result = [];
  for (let i = 0; i < text.length; i++) {
    const first = text[i][0];
    const firstType = text[i][1];

    if (skipTypes.indexOf(firstType) !== -1)
      continue;

    let second;
    for (let j = i + 1; j < text.length; j++) {
      const w = text[j][0];
      const secondType = text[j][1];

      if (skipTypes.indexOf(secondType) === -1) {
        second = w;
        break;
      }
    }
    
    if (second) {
      result.push(first + ' ' + second);
    } else {
      result.push(first);
    }
  
  }

  return result;
});


//Making flat key-value index
const index = {};
indexes.forEach((text, i) => {
  const fileName = fileNames[i];
  text.forEach(word => {
    if (!index[word]) {
      index[word] = [fileName];
    } else if (index[word].indexOf(fileName) === -1) {
      index[word].push(fileName);
    }
  })
});

fs.writeFileSync('biword-index.json', JSON.stringify(index, null, 2),  'utf8');



//Coordinate index
const coordIndex = {};
taggedTexts.forEach((text, i) => {
  const fileName = fileNames[i];
  text.forEach((pair, position) => {
    const word = pair[0];
    const type = pair[1];

    if (skipTypes.indexOf(type) === -1) {
      if (coordIndex[word] && coordIndex[word].length > 0) {
        try {
          const entries = coordIndex[word];
          let entryToUpdate = null;
          entries.forEach(entry => {
            if (entry.name === fileName && entry.coords.indexOf(position) === -1) {
              entry.coords.push(position);
              entryToUpdate = entry;
            }
          })
          if (!entryToUpdate) {
            entries.push({ name: fileName, coords: [ position ] });
          }
        } catch (err) {
          console.log('eh...');
        }
      } else {
        coordIndex[word] = [ { name: fileName, coords: [ position ] } ];
      }
    }
  });
});

fs.writeFileSync('coord-index.json', JSON.stringify(coordIndex, null, 2),  'utf8');
