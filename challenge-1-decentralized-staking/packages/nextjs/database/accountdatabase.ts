import sqlite3 from 'sqlite3';

class AccountDatabase {
  private databaseFile: string;
  private db: sqlite3.Database | null;

  constructor(databaseFile: string) {
    this.databaseFile = databaseFile;
    this.db = null;
  }

  // Open the database connection and create necessary tables
  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.databaseFile, async (err) => {
        if (err) {
          console.error("Failed to open database:", err.message);
          reject(err);
        } else {
          console.log("Connected to the SQLite database.");
          try {
            await this.createTables();
            resolve();
          } catch (tableErr) {
            reject(tableErr);
          }
        }
      });
    });
  }

  // Create necessary tables
  private createTables(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.createTable(`
          CREATE TABLE IF NOT EXISTS accountsettings (
            account_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            password TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            eth_wallet_id TEXT,
            nft_addresses TEXT,
            marketplace_listing_ids TEXT
          );
        `);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  // Create a single table
  private createTable(sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error("Database not open."));
      }
      this.db.run(sql, (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
          reject(err);
        } else {
          console.log("Table created successfully.");
          resolve();
        }
      });
    });
  }

  // Insert a record
  insert(sql: string, params: any[] = []): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error("Database not open."));
      }
      this.db.run(sql, params, function (err) {
        if (err) {
          console.error("Error inserting record:", err.message);
          reject(err);
        } else {
          console.log("Record inserted successfully, ID:", this.lastID);
          resolve(this.lastID);
        }
      });
    });
  }

  // Fetch records
  fetch(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error("Database not open."));
      }
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error("Error fetching records:", err.message);
          reject(err);
        } else {
          console.log("Records fetched successfully.");
          resolve(rows);
        }
      });
    });
  }

  // Close the database connection
  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject(new Error("Database not open."));
      }
      this.db.close((err) => {
        if (err) {
          console.error("Failed to close database:", err.message);
          reject(err);
        } else {
          console.log("Database connection closed.");
          resolve();
        }
      });
    });
  }
}

// Example Usage
(async () => {
  const db = new AccountDatabase('account_database.db');

  try {
    await db.open();
    
    // Insert a record into accountsettings table
    const insertAccountSQL = `
      INSERT INTO accountsettings (username, password, email, eth_wallet_id, nft_addresses, marketplace_listing_ids)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await db.insert(insertAccountSQL, [
      "user1",
      "password123",
      "user1@example.com",
      "0x1234abcd5678efgh9012ijkl3456mnop7890qrst",
      "0xNFT1,0xNFT2,0xNFT3",
      "listing1,listing2"
    ]);

    // Fetch records from accountsettings table
    const accounts = await db.fetch(`SELECT * FROM accountsettings`);
    console.log(accounts);
  } catch (err) {
    console.error(err);
  } finally {
    await db.close();
  }
})();
