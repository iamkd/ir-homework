const fs = require('fs');
const path = require('path');

const counts = {};
const arr = [];
let totalWordsInCollection = 0;
let totalCollectionSize = 0;

fs.readdir(path.join(__dirname, '../files'), (err, files) => {
  if (err) {
    console.error(err);
  }

  files.forEach(fileName => {
    const filePath = path.join(__dirname, '../files', fileName);
    const fileData = fs.readFileSync(filePath, 'utf8');
    
    const stats = fs.statSync(filePath);
    totalCollectionSize += stats['size'];

    const words = fileData.replace(/[^a-zA-Z0-9\s]/g, '').split(/[\s\n]/);
    
    totalWordsInCollection += words.length;
    
    words.forEach(word => {
      const lower = word.toLowerCase();
      if (lower == '') {
         return;
      } 
      if (counts[lower] == undefined) {
        counts[lower] = { count: 0, docs: [] };
      }
        
      counts[lower].count = counts[lower].count + 1;
      if (counts[lower].docs == undefined) {
        counts[lower].docs = [];
      }
      if (counts[lower].docs.indexOf(fileName) === -1) {
        counts[lower].docs.push(fileName);
      }
    });    
  });

  //Object.keys(counts).forEach(key => {
  //  arr.push({ word: key, count: counts[key].count, docs: counts[key].docs });
  //});  
  const text = `
    Total words in collection: ${totalWordsInCollection}
    Total words in dictionary: ${Object.keys(counts).length}
    Total collection size: ${totalCollectionSize} bytes
    ${JSON.stringify(counts, null, 2)}
  `; 
  //  ${JSON.stringify(arr.sort((a, b) => b.count - a.count), null, 2)}
  fs.writeFileSync('dict.json', text,  'utf8');
});

