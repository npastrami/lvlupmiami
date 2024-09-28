// CreateListingButton.tsx
"use client";

import { useState } from "react";

const CreateListingButton = () => {
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [newListing, setNewListing] = useState({
    nftId: "",
    sellerAddress: "",
    price: "",
  });

  const handleCreateListing = async () => {
    try {
      const response = await fetch("/api/marketplace", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nftId: newListing.nftId,
          sellerAddress: newListing.sellerAddress,
          price: parseFloat(newListing.price),
        }),
      });

      if (response.ok) {
        alert("Listing created successfully!");
        setShowCreateListingModal(false);
        setNewListing({ nftId: "", sellerAddress: "", price: "" }); // Reset form
      } else {
        alert("Failed to create listing.");
      }
    } catch (error) {
      console.error("Error creating listing:", error);
    }
  };

  return (
    <div>
      {/* Create New Listing Button */}
      <button className="btn btn-primary mt-8" onClick={() => setShowCreateListingModal(true)}>
        Create New Listing
      </button>

      {/* Modal for Creating New Listing */}
      {showCreateListingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Create New Listing</h3>
            <input
              type="text"
              placeholder="NFT ID"
              value={newListing.nftId}
              onChange={(e) => setNewListing({ ...newListing, nftId: e.target.value })}
              className="input input-bordered mb-4 w-full"
            />
            <input
              type="text"
              placeholder="Seller Address"
              value={newListing.sellerAddress}
              onChange={(e) => setNewListing({ ...newListing, sellerAddress: e.target.value })}
              className="input input-bordered mb-4 w-full"
            />
            <input
              type="number"
              placeholder="Price (ETH)"
              value={newListing.price}
              onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
              className="input input-bordered mb-4 w-full"
            />
            <div className="flex justify-end">
              <button className="btn btn-primary mr-2" onClick={handleCreateListing}>
                Submit
              </button>
              <button className="btn btn-secondary" onClick={() => setShowCreateListingModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateListingButton;
