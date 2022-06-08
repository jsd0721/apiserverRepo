const crypto = require("crypto");
const saltValue = crypto.randomBytes(35).toString('base64');
console.log(saltValue);
console.log(saltValue.length);

const hashedPassword = crypto.createHash("sha256").update("root"+saltValue).digest('hex');
console.log(hashedPassword);
console.log(hashedPassword.length);