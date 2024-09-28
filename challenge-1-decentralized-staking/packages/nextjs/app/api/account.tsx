import { NextApiRequest, NextApiResponse } from "next";
import sqlite3 from "sqlite3";

export class AccountDatabase {
  private databaseFile: string;
  private db: sqlite3.Database | null;

  constructor() {
    this.databaseFile = "account_database.db";
    this.db = null;
  }

  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.databaseFile, err => {
        if (err) {
          console.error("Failed to open database:", err.message);
          return reject(err);
        }
        console.log("Connected to the SQLite database.");

        this.db?.get(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='accountsettings';",
          async (err, row) => {
            if (err) {
              console.error("Failed to check for table existence:", err.message);
              return reject(err);
            }

            if (!row) {
              console.log("Table 'accountsettings' does not exist. Creating it now...");
              try {
                await this.createTables();
                console.log("Tables created successfully.");
                resolve();
              } catch (tableErr) {
                console.error("Failed to create tables:", tableErr);
                reject(tableErr);
              }
            } else {
              console.log("Table 'accountsettings' already exists.");
              resolve();
            }
          },
        );
      });
    });
  }

  // Create the tables
  private createTables(): Promise<void> {
    return this.createTable(`
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
  }

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

  // Insert an account
  insertAccount(
    username: string,
    password: string,
    email: string,
    ethWalletId: string,
    nftAddresses: string,
    marketplaceListingIds: string,
  ): Promise<number> {
    const insertSQL = `
      INSERT INTO accountsettings (username, password, email, eth_wallet_id, nft_addresses, marketplace_listing_ids)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    return this.insert(insertSQL, [username, password, email, ethWalletId, nftAddresses, marketplaceListingIds]);
  }

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

  getAllAccounts(): Promise<any[]> {
    const fetchSQL = `SELECT * FROM accountsettings`;
    return this.fetch(fetchSQL);
  }

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
          resolve(rows);
        }
      });
    });
  }

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
          resolve();
        }
      });
    });
  }
}

export default async function accountMiddleware(req: NextApiRequest, res: NextApiResponse) {
  const db = new AccountDatabase();

  try {
    await db.open();

    if (req.method === "POST") {
      const { username, password, email, ethWalletId, nftAddresses, marketplaceListingIds } = req.body;

      const accountId = await db.insertAccount(
        username,
        password,
        email,
        ethWalletId,
        nftAddresses,
        marketplaceListingIds,
      );
      res.status(201).json({ success: true, accountId });
    } else if (req.method === "GET") {
      const accounts = await db.getAllAccounts();
      res.status(200).json(accounts);
    } else {
      res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  } finally {
    await db.close();
  }
}
