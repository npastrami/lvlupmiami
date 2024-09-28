import { NextApiRequest, NextApiResponse } from 'next';
import NFTDatabase from './nftdatabase';

const db = new NFTDatabase('nft_database.db');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await db.open();

  try {
    if (req.method === 'GET') {
      // Fetch marketplace listings
      const listings = await db.getAllListings();
      res.status(200).json(listings);
    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching market listings", details: error });
  } finally {
    await db.close();
  }
}
