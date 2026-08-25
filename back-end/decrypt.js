
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const args = process.argv.slice(2);
const encFile = args[0];
const password = args[1] || process.env.DECRYPT_PASS;

if (!encFile) {
  console.error("❌ Usage: node decrypt.js <encFile> [password]");
  console.error("   Example: node decrypt.js .env.enc mypassword");
  process.exit(1);
}

if (!password) {
  console.error("❌ Password required!");
  console.error("   Provide as argument: node decrypt.js .env.enc mypassword");
  console.error("   Or set env var: DECRYPT_PASS=xxx node decrypt.js .env.enc");
  process.exit(1);
}

if (!fs.existsSync(encFile)) {
  console.error(`❌ File not found: ${encFile}`);
  process.exit(2);
}

try {
  console.log(`🔐 Decrypting: ${encFile}`);
  
  const data = fs.readFileSync(encFile);
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const tag = data.slice(28, 44);
  const cipherText = data.slice(44);
  

  const key = crypto.scryptSync(password, salt, 32);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  const text = dec.toString("utf8");
  

  dec.fill(0);
  key.fill(0);
  

  const envPath = path.join(__dirname, ".env");
  fs.writeFileSync(envPath, text, "utf8");
  
 
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith("#"));
  
  console.log(`✅ Success!`);
  console.log(`   Output: ${envPath}`);
  console.log(`   Variables: ${lines.length}`);
  
  process.exit(0);
  
} catch (err) {
  console.error("❌ Decrypt failed:", err.message);
  process.exit(4);
}