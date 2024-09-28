"use client";
import Image from "next/image";
import type { NextPage } from "next";
import Slider from "react-slick";
import { useState, useEffect } from "react";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const Home: NextPage = () => {
  // Hardcoded image URLs for now
  const [images, setImages] = useState<string[]>([
    "/carousel/placeholder1.png",
    "/carousel/placeholder2.png",
    "/carousel/placeholder3.png",
    "/carousel/placeholder4.png",
    "/carousel/placeholder5.png"
  ]);

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <div className="px-5 w-[90%] md:w-[75%]">
        <h1 className="text-center mb-6">
          <span className="block text-4xl mb-2 font-bold">Level-Up ⏫</span>
          <span className="block text-2xl">Level-Up Your Lifestyle, Decentralized NFT Staking Platform</span>
        </h1>
        <div className="flex flex-col items-center justify-center">
          {/* Image Carousel */}
          <Slider {...settings} className="w-full max-w-3xl mb-8">
            {images.map((imageSrc, index) => (
              <div key={index} className="flex justify-center">
                <Image
                  src={imageSrc}
                  width={727}
                  height={400}
                  alt={`Carousel Image ${index + 1}`}
                  className="rounded-xl border-4 border-primary"
                />
              </div>
            ))}
          </Slider>

          <div className="max-w-3xl">
            <p className="text-center text-lg mt-8">
              🦸 A superpower of Ethereum is allowing you, the builder, to create a simple set of rules that an
              adversarial group of players can use to work together. In this challenge, you create a decentralized
              application where users can coordinate a group funding effort. If the users cooperate, the money is
              collected in a second smart contract. If they defect, the worst that can happen is everyone gets their
              money back. The users only have to trust the code.
            </p>
            <p className="text-center text-lg">
              🌟 The final deliverable is deploying a Dapp that lets users send ether to a contract and stake if the
              conditions are met, then deploy your app to a public webserver. Submit the url on{" "}
              <a href="https://speedrunethereum.com/" target="_blank" rel="noreferrer" className="underline">
                SpeedRunEthereum.com
              </a>{" "}
              !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
