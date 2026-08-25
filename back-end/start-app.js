const { execFileSync } = require("child_process");

try {
  const password = process.env.DECRYPT_PASS;

  if (!password) {
    console.error(
      "❌ DECRYPT_PASS not set. Use `$env:DECRYPT_PASS='your_password'` (PowerShell) or `set DECRYPT_PASS=...` (CMD)"
    );
    process.exit(1);
  }

  execFileSync("node", ["decrypt.js", ".env.enc"], {
    env: { ...process.env, DECRYPT_PASS: password },
    stdio: "inherit",
  });

  execFileSync("npm", ["run", "start"], { stdio: "inherit" });
} catch (error) {
  console.error("Some problem has occurred:", error.message || error);
  process.exit(1);
}


