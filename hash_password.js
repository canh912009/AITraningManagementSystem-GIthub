const bcrypt = require('bcryptjs');

const password = 'admin123';
const hashedPassword = bcrypt.hashSync(password, 12);

console.log('Password:', password);
console.log('Hashed:', hashedPassword);

// Test verify
const isValid = bcrypt.compareSync(password, hashedPassword);
console.log('Valid:', isValid);