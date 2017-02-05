// Попереднє завдання зрозумів, як інвертований індекс.
// Тому dict.js так і виконує його побудову

const fs = require('fs');
const path = require('path');

let totalWordsInCollection = 0;
let totalCollectionSize = 0;

function buildIndex(files) {
  totalWordsInCollection = 0;
  totalCollectionSize = 0;

  const counts = {};
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

  return counts;
}

fs.readdir(path.join(__dirname, '../files'), (err, files) => {
  if (err) {
    console.error(err);
  }
  const index = buildIndex(files);
  const text = `
    Total words in collection: ${totalWordsInCollection}
    Total words in dictionary: ${Object.keys(index).length}
    Total collection size: ${totalCollectionSize} bytes
    ${JSON.stringify(index, null, 2)}
  `; 
  fs.writeFileSync('dict.json', text,  'utf8');


  const matrix = Object.assign({}, index);
  Object.keys(matrix).forEach(key => {
    matrix[key] = files.map(f => Number(matrix[key].docs.indexOf(f) !== -1));
  })

  
  // Дуже зручно, описуємо шляхи до файлів в окреме поле
  // Після чого для пошуку відповідності можна використовувати індекси масивів
  const matrixText = `
    Matrix:
    ${JSON.stringify({ colums: files, matrix }, null, 2)}
  `; 
  fs.writeFileSync('matrix.json', matrixText,  'utf8');
});

