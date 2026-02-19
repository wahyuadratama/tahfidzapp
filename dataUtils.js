const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function readJSON(filename) {
  const filepath = path.join(dataDir, filename);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      // Create empty array file
      fs.writeFileSync(filepath, '[]', 'utf8');
      return [];
    }
    
    const data = fs.readFileSync(filepath, 'utf8');
    
    // Check if file is empty or whitespace only
    if (!data || data.trim() === '') {
      // Write empty array and return
      fs.writeFileSync(filepath, '[]', 'utf8');
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error.message);
    // Return empty array and fix the file
    fs.writeFileSync(filepath, '[]', 'utf8');
    return [];
  }
}

function writeJSON(filename, data) {
  const filepath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error.message);
    throw error;
  }
}

function getNextId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map(item => item.id)) + 1;
}

module.exports = { readJSON, writeJSON, getNextId };
