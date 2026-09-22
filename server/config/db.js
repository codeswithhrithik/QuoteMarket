/**
 * ============================================================================
 * Database Configuration & Resilient Persistence Layer
 * ============================================================================
 * Provides connectivity to MongoDB via Mongoose.
 * If MongoDB (local or Atlas) is not currently running or reachable, it
 * automatically activates a persistent file-backed JSON store in `server/data/`.
 * This ensures the entire QuoteCraft app runs immediately out of the box
 * with zero required database setup, while supporting full MongoDB when configured!
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let isConnectedToMongo = false;

// Ensure server/data directory exists for local persistence fallback
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Connect to MongoDB with timeout safety
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/quotecraft';
  try {
    const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log(`[DB] Attempting connection to MongoDB: ${maskedUri}`);
    
    const isAtlas = uri.startsWith('mongodb+srv://');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: isAtlas ? 15000 : 3000,
      connectTimeoutMS: isAtlas ? 15000 : 3000
    });

    isConnectedToMongo = true;
    console.log('✅ [DB] Successfully connected to MongoDB via Mongoose!');
  } catch (err) {
    console.error('⚠️ [DB] Connection error:', err.message);
    isConnectedToMongo = false;
    console.log('💡 [DB] Switching to persistent LocalStore (JSON files in server/data/).');
    console.log('   All data (users, parties, catalog, quotations) will be safely saved locally!');
  }
}

/**
 * Local file-backed database collection implementation
 * Mimics Mongoose model query interface for seamless switching
 */
class LocalCollection {
  constructor(collectionName) {
    this.name = collectionName;
    this.filePath = path.join(dataDir, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (err) {
      console.error(`Error reading ${this.name}:`, err);
      return [];
    }
  }

  _write(records) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error writing ${this.name}:`, err);
    }
  }

  async find(filter = {}) {
    const all = this._read();
    const filtered = all.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] !== val) return false;
      }
      return true;
    });

    // Provide query helpers like sort
    return {
      sort: (sortObj = {}) => {
        const sorted = [...filtered].sort((a, b) => {
          for (const [k, dir] of Object.entries(sortObj)) {
            const valA = a[k] instanceof Date ? a[k].getTime() : a[k];
            const valB = b[k] instanceof Date ? b[k].getTime() : b[k];
            if (valA < valB) return dir === -1 || dir === 'desc' ? 1 : -1;
            if (valA > valB) return dir === -1 || dir === 'desc' ? -1 : 1;
          }
          return 0;
        });
        return sorted;
      },
      then: (resolve, reject) => Promise.resolve(filtered).then(resolve, reject)
    };
  }

  async findOne(filter = {}) {
    const all = this._read();
    return all.find(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] !== val) return false;
      }
      return true;
    }) || null;
  }

  async findById(id) {
    if (!id) return null;
    const strId = String(id);
    const all = this._read();
    const doc = all.find(item => String(item._id) === strId || String(item.id) === strId);
    if (doc && !doc.id) doc.id = doc._id;
    return doc || null;
  }

  async create(data) {
    const all = this._read();
    const id = crypto.randomUUID();
    const newDoc = {
      _id: id,
      id: id,
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    all.push(newDoc);
    this._write(all);
    return newDoc;
  }

  async findByIdAndUpdate(id, updates, options = { new: true }) {
    if (!id) return null;
    const strId = String(id);
    const all = this._read();
    const index = all.findIndex(item => String(item._id) === strId || String(item.id) === strId);
    if (index === -1) return null;

    const current = all[index];
    const updated = {
      ...current,
      ...updates,
      id: current.id || current._id,
      _id: current._id || current.id,
      updatedAt: new Date().toISOString()
    };
    all[index] = updated;
    this._write(all);
    return options.new ? updated : current;
  }

  async findByIdAndDelete(id) {
    if (!id) return null;
    const strId = String(id);
    const all = this._read();
    const index = all.findIndex(item => String(item._id) === strId || String(item.id) === strId);
    if (index === -1) return null;
    const removed = all.splice(index, 1)[0];
    this._write(all);
    return removed;
  }

  async countDocuments(filter = {}) {
    const all = this._read();
    if (!filter || Object.keys(filter).length === 0) return all.length;
    return all.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] !== val) return false;
      }
      return true;
    }).length;
  }

  async deleteMany(filter = {}) {
    const all = this._read();
    const remaining = all.filter(item => {
      for (const [key, val] of Object.entries(filter)) {
        if (item[key] === val) return false;
      }
      return true;
    });
    const deletedCount = all.length - remaining.length;
    this._write(remaining);
    return { deletedCount };
  }
}

/**
 * Creates a hybrid model that uses Mongoose if connected, or LocalCollection fallback
 */
function createHybridModel(name, mongooseModel) {
  const local = new LocalCollection(name.toLowerCase() + 's');
  
  return {
    async find(filter) {
      if (isConnectedToMongo) {
        return mongooseModel.find(filter);
      }
      return local.find(filter);
    },
    async findOne(filter) {
      if (isConnectedToMongo) {
        return mongooseModel.findOne(filter);
      }
      return local.findOne(filter);
    },
    async findById(id) {
      if (isConnectedToMongo) {
        return mongooseModel.findById(id);
      }
      return local.findById(id);
    },
    async create(data) {
      if (isConnectedToMongo) {
        return mongooseModel.create(data);
      }
      return local.create(data);
    },
    async findByIdAndUpdate(id, updates, opts) {
      if (isConnectedToMongo) {
        return mongooseModel.findByIdAndUpdate(id, updates, opts);
      }
      return local.findByIdAndUpdate(id, updates, opts);
    },
    async findByIdAndDelete(id) {
      if (isConnectedToMongo) {
        return mongooseModel.findByIdAndDelete(id);
      }
      return local.findByIdAndDelete(id);
    },
    async deleteMany(filter) {
      if (isConnectedToMongo) {
        return mongooseModel.deleteMany(filter);
      }
      return local.deleteMany(filter);
    },
    async countDocuments(filter) {
      if (isConnectedToMongo) {
        return mongooseModel.countDocuments(filter);
      }
      return local.countDocuments(filter);
    }
  };
}

module.exports = {
  connectDB,
  createHybridModel,
  getIsConnectedToMongo: () => isConnectedToMongo
};
