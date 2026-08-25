const { Pool } = require('pg');

// Map tất cả DB server theo "site key"
const DB_CONFIGS = {
  local:  { host: '10.1.0.7',    port: 5432, database: 'legacydb', user: 'legacyuser', password: 'LMJK8LKR' },
  taiwan: { host: '10.11.1.101', port: 5432, database: 'legacydb', user: 'legacyuser', password: 'LMJK8LKR' },
  // thêm site mới ở đây
};

const pools = new Map();

function getPool(siteKey) {
  if (!pools.has(siteKey)) {
    const config = DB_CONFIGS[siteKey];
    if (!config) throw new Error(`Unknown site: ${siteKey}`);
    pools.set(siteKey, new Pool({ ...config, max: 10 }));
  }
  return pools.get(siteKey);
}

module.exports = { getPool };