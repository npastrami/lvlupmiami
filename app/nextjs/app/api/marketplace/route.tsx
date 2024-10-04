import { NextResponse } from "next/server";
import NFTDatabase from "../../../database/nftdatabase"; // Adjust the relative path accordingly

const db = new NFTDatabase("nft_database.db");

// Handle GET requests to fetch all listings
export async function GET() {
  try {
    await db.open();

    // Fetch all marketplace listings
    const listings = await db.getAllListings();

    return NextResponse.json(listings);
  } catch (error) {
    console.error("Error fetching marketplace listings:", error);
    return NextResponse.json({ error: "Failed to fetch marketplace listings" }, { status: 500 });
  } finally {
    await db.close();
  }
}

// Handle POST requests to create a new listing
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nftId: nftId, sellerAddress: sellerAddress, price: price, image_url: image_url } = body;

    if (!nftId || !sellerAddress || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.open();
    const newListingId = await db.insertListing(nftId, sellerAddress, price, image_url);

    return NextResponse.json({ message: "Listing created successfully", listingId: newListingId });
  } catch (error) {
    console.error("Error creating marketplace listing:", error);
    return NextResponse.json({ error: "Failed to create marketplace listing" }, { status: 500 });
  } finally {
    await db.close();
  }
}
