// BACKUP SCRIPT - Run with: node backup.js

const fs = require('fs');
const path = require('path');

const backup = () => {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const backupDir = path.join(__dirname, 'backups', timestamp);
  
  // Create backup directory
  if (!fs.existsSync(path.join(__dirname, 'backups'))) {
    fs.mkdirSync(path.join(__dirname, 'backups'));
  }
  fs.mkdirSync(backupDir);
  
  // Backup data files
  const dataFiles = ['users.json', 'santri.json', 'setoran.json'];
  dataFiles.forEach(file => {
    const source = path.join(__dirname, 'data', file);
    const dest = path.join(backupDir, file);
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, dest);
      console.log(`✅ Backed up: ${file}`);
    }
  });
  
  console.log(`\n✅ Backup completed: ${backupDir}`);
  console.log('📁 Location: ./backups/' + timestamp);
};

backup();
