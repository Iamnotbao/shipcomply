class RdTempCache {
  constructor(cacheName = "default", compareStrategy = "default") {
    this.cacheName = cacheName;
    this.cache = new Map();
    this.compareStrategy = compareStrategy;
  }

  static COMPARE_STRATEGIES = {
    default: (item1, item2) => {
      const seqMatch = parseFloat(item1.seq) === parseFloat(item2.seq);
      const col2Match =
        (item1.col2 === null && item2.col2 === null) ||
        (item1.col2 !== null &&
          item2.col2 !== null &&
          parseFloat(item1.col2) === parseFloat(item2.col2));
      const codeMatch =
        (item1.code_no || "-NULL-") === (item2.code_no || "-NULL-");

      return seqMatch && col2Match && codeMatch;
    },
    SY_TREE: (item1, item2) => {
      const seqMatch = parseFloat(item1.seq) === parseFloat(item2.seq);

      const col1Match =
        (item1.col1 === null && item2.col1 === null) ||
        (item1.col1 !== null &&
          item2.col1 !== null &&
          String(item1.col1) === String(item2.col1));

      const col2Match =
        (item1.col2 === null && item2.col2 === null) ||
        (item1.col2 !== null &&
          item2.col2 !== null &&
          parseFloat(item1.col2) === parseFloat(item2.col2));

      const codeMatch =
        (item1.code_no || "-NULL-") === (item2.code_no || "-NULL-");

      return seqMatch && col1Match && col2Match && codeMatch;
    },

    IV_TRANS: (item1, item2) => {
      const seqMatch = parseFloat(item1.seq) === parseFloat(item2.seq);

      const col1Match =
        (item1.col1 === null && item2.col1 === null) ||
        (item1.col1 !== null &&
          item2.col1 !== null &&
          String(item1.col1) === String(item2.col1));

      const col2Match =
        (item1.col2 === null && item2.col2 === null) ||
        (item1.col2 !== null &&
          item2.col2 !== null &&
          parseFloat(item1.col2) === parseFloat(item2.col2));

      return seqMatch && col1Match && col2Match;
    },

    // FULL: Compare all key fields
    full: (item1, item2) => {
      const seqMatch = parseFloat(item1.seq) === parseFloat(item2.seq);

      const col1Match =
        (item1.col1 === null && item2.col1 === null) ||
        (item1.col1 !== null &&
          item2.col1 !== null &&
          String(item1.col1) === String(item2.col1));

      const col2Match =
        (item1.col2 === null && item2.col2 === null) ||
        (item1.col2 !== null &&
          item2.col2 !== null &&
          parseFloat(item1.col2) === parseFloat(item2.col2));

      const col3Match =
        (item1.col3 === null && item2.col3 === null) ||
        (item1.col3 !== null &&
          item2.col3 !== null &&
          String(item1.col3) === String(item2.col3));

      const codeMatch =
        (item1.code_no || "-NULL-") === (item2.code_no || "-NULL-");

      return seqMatch && col1Match && col2Match && col3Match && codeMatch;
    },

    // SEQ_ONLY: Only compare seq (minimal check)
    seq_only: (item1, item2) => {
      return parseFloat(item1.seq) === parseFloat(item2.seq);
    },
  };

  /**
   * Get comparison function based on strategy
   */
  getCompareFunction() {
    // If custom function provided, use it
    if (typeof this.compareStrategy === "function") {
      return this.compareStrategy;
    }

    // Otherwise use predefined strategy
    return (
      RdTempCache.COMPARE_STRATEGIES[this.compareStrategy] ||
      RdTempCache.COMPARE_STRATEGIES["default"]
    );
  }
  filterBy(session_id, conditions = {}) {
    const sessionData = this.cache.get(session_id) || [];
    return sessionData.filter((item) => {
      return Object.entries(conditions).every(([key, value]) => {
        if (value === null || value === undefined) return true;
        return String(item[key]) === String(value);
      });
    });
  }
  save(session_id, item) {
    const sessionData = this.cache.get(session_id) || [];

    const normalizedItem = {
      ...item,
      seq: parseFloat(item.seq),
      col1:
        item.col1 !== null && item.col1 !== undefined
          ? String(item.col1)
          : null,
      col2: item.col2 !== null ? parseFloat(item.col2) : null,
    };

    const compareFunc = this.getCompareFunction();
    const existIndex = sessionData.findIndex((i) =>
      compareFunc(i, normalizedItem),
    );

    if (existIndex >= 0) {
      // Found duplicate → UPDATE
      sessionData[existIndex] = {
        ...sessionData[existIndex],
        ...normalizedItem,
      };
      console.log(
        `🔄 Updated existing item at index ${existIndex} (strategy: ${this.compareStrategy})`,
      );
    } else {
      // New item → PUSH
      sessionData.push(normalizedItem);
      console.log(
        `➕ Added new item, total: ${sessionData.length} (strategy: ${this.compareStrategy})`,
      );
    }

    this.cache.set(session_id, sessionData);
  }

  /**
   * Allow runtime strategy change
   */
  setCompareStrategy(strategy) {
    this.compareStrategy = strategy;
    console.log(`🔧 Changed compare strategy to: ${strategy}`);
  }

  // ... rest of methods remain the same ...
  set(session_id, seq, data) {
    const item = {
      factory_code: data.factory_code || null,
      item_no: data.item_no || null,
      code_no: data.code_no || null,
      name_t: data.name_t || null,
      name_e: data.name_e || null,
      name_s: data.name_s || null,
      seq: seq,
      col1: data.col1 || null,
      col2: data.col2 || null,
      col3: data.col3 || null,
      col4: data.col4 || null,
      col5: data.col5 || null,
      col6: data.col6 || null,
      out_qty: data.out_qty || null,
    };

    this.save(session_id, item);
  }

  delete(session_id, seq, col2) {
    const sessionData = this.cache.get(session_id) || [];
    const filtered = sessionData.filter(
      (item) => !(item.seq === seq && item.col2 === col2),
    );

    this.cache.set(session_id, filtered);
    console.log(
      `🗑️ Deleted from session ${session_id}: seq=${seq}, col2=${col2}`,
    );
  }

  getAll(session_id) {
    return this.cache.get(session_id) || [];
  }

  getLeftItems(session_id) {
    const sessionData = this.cache.get(session_id) || [];
    return sessionData.filter(
      (item) => (item.code_no || "-NULL-") !== "IV_TRANS_D_TW",
    );
  }

  getRightItems(session_id) {
    const sessionData = this.cache.get(session_id) || [];
    return sessionData.filter((item) => item.code_no === "IV_TRANS_D_TW");
  }

  getOne(session_id, seq, col2) {
    const sessionData = this.cache.get(session_id) || [];
    const found = sessionData.find(
      (item) =>
        parseFloat(item.seq) === parseFloat(seq) &&
        parseFloat(item.col2 || 0) === parseFloat(col2 || 0),
    );
    return found;
  }

  getTotalCol5(session_id, excludeCodeNo = "IV_TRANS_D_TW") {
    const sessionData = this.cache.get(session_id) || [];
    return sessionData
      .filter((item) => (item.code_no || "-NULL-") !== excludeCodeNo)
      .reduce((sum, item) => sum + (parseFloat(item.col5) || 0), 0);
  }

  clearSession(session_id) {
    this.cache.delete(session_id);
  }

  clearAll() {
    this.cache.clear();
    console.log(`🧹 Cleared all sessions`);
  }

  getActiveSessionsCount() {
    return this.cache.size;
  }

  debugPrint(session_id = null) {
    if (session_id) {
      const data = this.cache.get(session_id) || [];
      const leftItems = data.filter(
        (i) => (i.code_no || "-NULL-") !== "IV_TRANS_D_TW",
      );
      const rightItems = data.filter((i) => i.code_no === "IV_TRANS_D_TW");

      console.log(
        `\n📊 Session ${session_id} (Strategy: ${this.compareStrategy}):`,
      );
      console.log(`  ⬅️  LEFT items (${leftItems.length}):`);
      leftItems.forEach((item, idx) => {
        console.log(
          `    [${idx}] seq=${item.seq}, col1=${item.col1}, col2=${item.col2}, col4=${item.col4}, col5=${item.col5}`,
        );
      });
      console.log(`  ➡️  RIGHT items (${rightItems.length}):`);
      rightItems.forEach((item, idx) => {
        console.log(
          `    [${idx}] seq=${item.seq}, col1=${item.col1}, col2=${item.col2}, col5=${item.col5}, out_qty=${item.out_qty}`,
        );
      });
    } else {
      console.log("📊 Current RD_TEMP Cache:");
      for (const [sid, data] of this.cache.entries()) {
        console.log(`\n  Session ${sid} (${data.length} items total)`);
        this.debugPrint(sid);
      }
    }
  }
}

// Export singleton with default strategy
module.exports = new RdTempCache("default", "default");
module.exports.RdTempCache = RdTempCache;
module.exports.defaultInstance = module.exports;
