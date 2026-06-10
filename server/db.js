const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Statically analyze database for Vercel NFT bundling
const bundledDbPath = path.join(__dirname, 'tracker.db');
try {
    // Reference file to force Vercel to bundle tracker.db
    if (fs.existsSync(bundledDbPath)) {
        console.log('[DEBUG] Bundled database file detected.');
    }
} catch (e) {}

let dbPath = bundledDbPath;

if (process.env.VERCEL) {
    const tempDbPath = path.join('/tmp', 'tracker.db');
    console.log(`[DEBUG] Vercel environment detected. Copying database to ${tempDbPath}`);
    try {
        if (fs.existsSync(bundledDbPath)) {
            fs.copyFileSync(bundledDbPath, tempDbPath);
            console.log('[DEBUG] Bundled database copied successfully to /tmp');
        } else {
            console.log('[WARNING] Bundled database file not found in __dirname');
        }
    } catch (err) {
        console.error('[ERROR] Failed to copy database to /tmp:', err.message);
    }
    dbPath = tempDbPath;
}

const db = new Database(dbPath);

//enables WAL(Write Ahead Logging) mode for better concurrency
try {
    db.pragma('journal_mode = WAL');
} catch (err) {
    console.warn('[WARNING] Failed to enable WAL mode:', err.message);
}

//schema initialization
console.log('[DEBUG] Starting schema initialization...');

try {
    console.log('[DEBUG] Creating sites table...');
    db.exec(`
        CREATE TABLE IF NOT EXISTS sites (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            location TEXT NOT NULL,
            coordinator_email TEXT
        );
    `);
    console.log('[DEBUG] Sites table created successfully');
} catch (err) {
    console.error('[DEBUG] Error creating sites table:', err.message);
    throw err;
}

try {
    console.log('[DEBUG] Creating weekly_reports table...');
    // David changes (start)
    db.exec(`
        CREATE TABLE IF NOT EXISTS weekly_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site_id INTEGER NOT NULL,
            week_number INTEGER NOT NULL,
            CHECK (week_number > 0 AND week_number <= 52),
            items_collected INTEGER DEFAULT 0,
            CHECK (items_collected >= 0),
            kits_assembled INTEGER DEFAULT 0,
            CHECK (kits_assembled >= 0),
            funds_raised REAL DEFAULT 0,
            CHECK (funds_raised >= 0),
            volunteer_hours REAL DEFAULT 0,
            CHECK (volunteer_hours >= 0),
            team TEXT,
            notes TEXT,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
            UNIQUE(site_id, week_number)
        );
    `);
    // David changes (end)
    console.log('[DEBUG] weekly_reports table created successfully');
} catch (err) {
    console.error('[DEBUG] Error creating weekly_reports table:', err.message);
    throw err;
}

// David changes (start)
try {
    const tableInfo = db.prepare("PRAGMA table_info('weekly_reports')").all();
    if (!tableInfo.some((column) => column.name === 'team')) {
        console.log('[DEBUG] Adding missing team column to weekly_reports...');
        db.exec(`ALTER TABLE weekly_reports ADD COLUMN team TEXT;`);
        console.log('[DEBUG] team column added successfully');
    }
} catch (err) {
    console.error('[DEBUG] Error checking or migrating team column:', err.message);
    throw err;
}
// David changes (end)

try {
    console.log('[DEBUG] Creating indexes...');
    db.exec(`CREATE INDEX IF NOT EXISTS idx_reports_site ON weekly_reports(site_id, week_number);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_reports_week ON weekly_reports(week_number);`);
    console.log('[DEBUG] Indexes created successfully');
} catch (err) {
    console.error('[DEBUG] Error creating indexes:', err.message);
    throw err;
}

try {
    console.log('[DEBUG] Seeding sites data...');
    db.exec(`
        INSERT OR IGNORE INTO sites (id, name, location) VALUES
        (1, 'Charlotte', 'NC'),
        (2, 'Auburn Hills', 'MI'),
        (3, 'Miami', 'FL'),
        (4, 'Houston', 'TX'),
        (5, 'Itasca', 'IL');
    `);
    console.log('[DEBUG] Sites data seeded successfully');
} catch (err) {
    console.error('[DEBUG] Error seeding sites:', err.message);
    throw err;
}

console.log('Database initialized at: ', dbPath);
console.log('Sites seeded: ', db.prepare('SELECT COUNT(*) as count FROM sites').get().count);

//sanity check log
const allSites = db.prepare('SELECT * FROM sites').all();
console.table(allSites);

module.exports = db;

