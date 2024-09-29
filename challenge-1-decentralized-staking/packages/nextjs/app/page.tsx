// app/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import "./carousel.css";
import type { NextPage } from "next";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";


// app/page.tsx

const Home: NextPage = () => {
  const [imagesHotOffPress] = useState<string[]>([
    "/nft1.jpg",
    "/nft2.jpg",
    "/nft3.png",
    "/nft4.jpg",
    "/nft5.jpg",
  ]);

  const [imagesUpcomingReleases] = useState<string[]>([
    "/nft6.jpg",
    "/nft7.jpg",
    "/nft8.jpg",
    "/nft9.jpg",
    "/nft10.jpg",
  ]);

  

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    centerMode: true,
    centerPadding: "150px",
  };

  const { address } = useAccount();
  // Specify the contractName with the correct literal type
  const { writeContractAsync, isMining } = useScaffoldWriteContract("FreshMint");

  const handleMint = async (ipfsLink: string) => {
    if (!ipfsLink) {
      alert("Please enter an IPFS link.");
      return;
    }
    try {
      await writeContractAsync({
        functionName: "mintNFT",
        args: [address, ipfsLink],
      });
      alert("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Error minting NFT. See console for details.");
    }
  };

  return (
    <div className="flex items-center flex-col justify-center flex-grow pt-10 overflow-visible">
      <div className="px-5 w-[90%] md:w-[75%] overflow-visible">
        <h1 className="text-center mb-6">
          <span className="block text-4xl mb-2 font-bold">Level-Up ⏫</span>
          <span className="block text-2xl">Level-Up Your Lifestyle, Decentralized NFT Rewards Platform</span>
        </h1>

        <div className="w-full mb-8">
          <span className="block text-2xl text-left font-bold ml-2">Hot Off The Press</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex justify-center items-center w-full max-w-3xl relative">
            <Slider {...settings} className="w-full">
              {imagesHotOffPress.map((imageSrc, index) => (
                <div key={index} className="slide-container">
                  <div
                    className="carousel-image-wrapper border-4 border-primary rounded-xl overflow-hidden"
                    style={{ width: "450px", height: "300px" }}
                  >
                    <Image
                      src={imageSrc}
                      width={450}
                      height={300}
                      alt={`Hot Off The Press Image ${index + 1}`}
                      className="rounded-md"
                      style={{
                        objectFit: "cover",
                        display: "block",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    <button
                      className={`btn btn-primary absolute bottom-4 left-1/2 transform -translate-x-1/2 ${
                        isMining ? "loading" : ""
                      }`}
                      onClick={() => handleMint(imageSrc)}
                      disabled={isMining}
                    >
                      {isMining ? "Minting..." : "Mint Now"}
                    </button>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        <div className="w-full mt-12 mb-8">
          <span className="block text-2xl text-left font-bold ml-2">Upcoming Releases</span>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <div className="flex justify-center items-center w-full max-w-3xl relative">
            <Slider {...settings} className="w-full">
              {imagesUpcomingReleases.map((imageSrc, index) => (
                <div key={index} className="slide-container">
                  <div
                    className="carousel-image-wrapper border-4 border-primary rounded-xl overflow-hidden"
                    style={{ width: "450px", height: "300px" }}
                  >
                    <Image
                      src={imageSrc}
                      width={450}
                      height={300}
                      alt={`Upcoming Release Image ${index + 1}`}
                      className="rounded-md"
                      style={{
                        objectFit: "cover",
                        display: "block",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        <div className="w-full mt-12 mb-8">
          <span className="block text-2xl font-bold ml-2 text-center">About Us</span>
        </div>

        <div className="max-w-3xl mx-auto text-center mt-8">
          <p className="text-center text-lg">
          Level-Up connects People with Experiences. Through community collaboration and blockchain technology,
           we hope to add new utility for NFTs on the Ethereum blockchain. Users can mint new, or use the market place to acquire upgradeable NFT passes.
          </p>
          <p className="text-center text-lg mt-4">
            🌟 Insipired by FIU's passion for Hospitality. In collaboration with EthMiami. Built for ShellHacks. Powered by Scaffold-eth and {" "}
            <a href="https://speedrunethereum.com/" target="_blank" rel="noreferrer" className="underline">
              SpeedRunEthereum.com
            </a>{" "}
            !
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
