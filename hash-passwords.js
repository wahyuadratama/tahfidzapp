// HASH EXISTING PASSWORDS
// Run: node hash-passwords.js

const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function hashPasswords() {
  const usersPath = path.join(__dirname, 'data', 'users.json');
  const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  
  console.log('🔒 Hashing passwords...\n');
  
  for (let user of users) {
    // Skip if already hashed
    if (user.password.startsWith('$2')) {
      console.log(`✅ ${user.username} - Already hashed`);
      continue;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
    console.log(`🔐 ${user.username} - Password hashed`);
  }
  
  // Save
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
  console.log('\n✅ All passwords hashed successfully!');
  console.log('📁 File saved: data/users.json');
}

hashPasswords().catch(console.error);
