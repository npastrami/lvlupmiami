import sqlite3 from "sqlite3";

class NFTDatabase {
  private databaseFile: string;
  private db: sqlite3.Database | null;

  constructor(databaseFile: string) {
    this.databaseFile = databaseFile;
    this.db = null;
  }

  // Open the database connection and create necessary tables
  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.databaseFile, async err => {
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
          CREATE TABLE IF NOT EXISTS marketplace_listings (
            listing_id INTEGER PRIMARY KEY AUTOINCREMENT,
            nft_id TEXT NOT NULL,
            seller_address TEXT NOT NULL,
            price REAL NOT NULL,
            image_url TEXT,
            listed_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await this.createTable(`
          CREATE TABLE IF NOT EXISTS transactions_history (
            transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
            nft_id TEXT NOT NULL,
            buyer_address TEXT NOT NULL,
            seller_address TEXT NOT NULL,
            price REAL NOT NULL,
            transaction_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await this.createTable(`
          CREATE TABLE IF NOT EXISTS fresh_mints (
            mint_id INTEGER PRIMARY KEY AUTOINCREMENT,
            nft_id TEXT NOT NULL,
            owner_address TEXT NOT NULL,
            minted_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await this.createTable(`
          CREATE TABLE IF NOT EXISTS queued_mints (
            queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
            nft_id TEXT NOT NULL,
            owner_address TEXT NOT NULL,
            queued_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      this.db.run(sql, err => {
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

  // Insert into marketplace_listings table
  insertListing(nftId: string, sellerAddress: string, price: number, image_url: string): Promise<number> {
    const insertListingSQL = `
      INSERT INTO marketplace_listings (nft_id, seller_address, price, image_url)
      VALUES (?, ?, ?, ?)
    `;
    return this.insert(insertListingSQL, [nftId, sellerAddress, price, image_url]);
  }

  // Insert into transactions_history table
  insertTransaction(nftId: string, buyerAddress: string, sellerAddress: string, price: number): Promise<number> {
    const insertTransactionSQL = `
      INSERT INTO transactions_history (nft_id, buyer_address, seller_address, price)
      VALUES (?, ?, ?, ?)
    `;
    return this.insert(insertTransactionSQL, [nftId, buyerAddress, sellerAddress, price]);
  }

  // Insert into fresh_mints table
  insertMint(nftId: string, ownerAddress: string): Promise<number> {
    const insertMintSQL = `
      INSERT INTO fresh_mints (nft_id, owner_address)
      VALUES (?, ?)
    `;
    return this.insert(insertMintSQL, [nftId, ownerAddress]);
  }

  // Insert into queued_mints table
  insertQueuedMint(nftId: string, ownerAddress: string): Promise<number> {
    const insertQueuedMintSQL = `
      INSERT INTO queued_mints (nft_id, owner_address)
      VALUES (?, ?)
    `;
    return this.insert(insertQueuedMintSQL, [nftId, ownerAddress]);
  }

  // Fetch all marketplace listings
  getAllListings(): Promise<any[]> {
    const fetchListingsSQL = `SELECT * FROM marketplace_listings`;
    return this.fetch(fetchListingsSQL);
  }

  // Fetch all transactions
  getAllTransactions(): Promise<any[]> {
    const fetchTransactionsSQL = `SELECT * FROM transactions_history`;
    return this.fetch(fetchTransactionsSQL);
  }

  // Fetch all fresh mints
  getAllMints(): Promise<any[]> {
    const fetchMintsSQL = `SELECT * FROM fresh_mints`;
    return this.fetch(fetchMintsSQL);
  }

  // Fetch all queued mints
  getAllQueuedMints(): Promise<any[]> {
    const fetchQueuedMintsSQL = `SELECT * FROM queued_mints`;
    return this.fetch(fetchQueuedMintsSQL);
  }

  // Insert a record
  private insert(sql: string, params: any[] = []): Promise<number> {
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
  private fetch(sql: string, params: any[] = []): Promise<any[]> {
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
      this.db.close(err => {
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

// // Example Usage
// (async () => {
//   const db = new NFTDatabase("nft_database.db");

//   try {
//     await db.open();

//     // Insert a record into marketplace_listings
//     await db.insertListing("nft12345", "0x1234567890abcdef1234567890abcdef12345678", 10.5);

//     // Fetch all records from marketplace_listings table
//     const listings = await db.getAllListings();
//     console.log(listings);
//   } catch (err) {
//     console.error(err);
//   } finally {
//     await db.close();
//   }
// })();

export default NFTDatabase;
