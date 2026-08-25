function createLockKey(table, primaryKey) {
  // Sắp xếp keys để đảm bảo consistency
  const sortedKeys = Object.keys(primaryKey).sort();
  const keyParts = sortedKeys.map(key => `${key}:${primaryKey[key]}`);
  return `${table}:${keyParts.join(':')}`;
}
module.exports={createLockKey}