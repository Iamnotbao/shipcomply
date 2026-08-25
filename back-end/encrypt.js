const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const args = process.argv.slice(2);
const envFile = args[0] || ".env";
const password = args[1] || process.env.ENCRYPT_PASS;

if (!password) {
  console.error("❌ Password required!");
  console.error("   Provide as argument: node encrypt.js .env mypassword");
  console.error("   Or set env var: ENCRYPT_PASS=xxx node encrypt.js");
  process.exit(1);
}

const envPath = path.join(__dirname, envFile);

if (!fs.existsSync(envPath)) {
  console.error(`❌ File not found: ${envPath}`);
  console.error("   Create .env file first with your database credentials");
  process.exit(2);
}

try {
  console.log(`🔒 Encrypting: ${envFile}`);
  
  // Read .env file content
  const text = fs.readFileSync(envPath, "utf8");
  
  // Generate random salt (16 bytes) and IV (12 bytes for GCM)
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  
  // Derive 32-byte key from password using scrypt
  const key = crypto.scryptSync(password, salt, 32);
  
  // Create cipher with AES-256-GCM
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  
  // Encrypt the text
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);
  
  // Get authentication tag
  const tag = cipher.getAuthTag();
  
  // Clear sensitive data from memory
  key.fill(0);
  
  // Combine: salt(16) + iv(12) + tag(16) + encrypted
  const output = Buffer.concat([salt, iv, tag, encrypted]);
  
  // Write to .env.enc file
  const encPath = path.join(__dirname, ".env.enc");
  fs.writeFileSync(encPath, output);
  
  // Count variables
  const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.trim().startsWith("#"));
  
  console.log(`✅ Success!`);
  console.log(`   Input:  ${envPath}`);
  console.log(`   Output: ${encPath}`);
  console.log(`   Variables: ${lines.length}`);
  console.log(`   Size: ${output.length} bytes`);
  console.log(`\n💡 To decrypt: node decrypt.js .env.enc ${password.slice(0, 3)}***`);
  
  process.exit(0);
  
} catch (err) {
  console.error("❌ Encrypt failed:", err.message);
  process.exit(4);
}
