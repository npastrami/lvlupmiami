"use client";

import { useState } from "react";

interface CreateListingButtonProps {
  onAddListing: () => void;
}

const CreateListingButton: React.FC<CreateListingButtonProps> = ({ onAddListing }) => {
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [newListing, setNewListing] = useState({
    nftId: "",
    sellerAddress: "",
    price: "",
    image_url: ""
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
          image_url: newListing.image_url, // Include image URL in request
        }),
      });

      if (response.ok) {
        alert("Listing created successfully!");
        setShowCreateListingModal(false);
        setNewListing({ nftId: "", sellerAddress: "", price: "", image_url: "" }); // Reset form

        // Call onAddListing to refresh the marketplace listings in the parent component
        if (onAddListing) {
          onAddListing();
        }
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
            <input
              type="text"
              placeholder="File Path"
              value={newListing.image_url}
              onChange={(e) => setNewListing({ ...newListing, image_url: e.target.value })}
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
