const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'tracker.db');
const db = new Database(dbPath);

//enables WAL(Write Ahead Logging) mode for better concurrency
db.pragma('journal_mode = WAL');

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
    db.exec(`
        CREATE TABLE IF NOT EXISTS weekly_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            site_id INTEGER NOT NULL,
            week_number INTEGER NOT NULL
            CHECK (week_number > 0 AND week_number <= 52),
            items_collected INTEGER DEFAULT 0
            CHECK (items_collected >= 0),
            kits_assembled INTEGER DEFAULT 0
            CHECK (kits_assembled >= 0),
            funds_raised REAL DEFAULT 0
            CHECK (funds_raised >= 0),
            volunteer_hours REAL DEFAULT 0
            CHECK (volunteer_hours >= 0),
            notes TEXT,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE,
            UNIQUE(site_id, week_number)
        );
    `);
    console.log('[DEBUG] weekly_reports table created successfully');
} catch (err) {
    console.error('[DEBUG] Error creating weekly_reports table:', err.message);
    throw err;
}

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

