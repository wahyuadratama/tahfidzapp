const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

function readJSON(filename) {
  const filepath = path.join(dataDir, filename);
  const data = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(data);
}

function writeJSON(filename, data) {
  const filepath = path.join(dataDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
}

function getNextId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
}

module.exports = { readJSON, writeJSON, getNextId };
