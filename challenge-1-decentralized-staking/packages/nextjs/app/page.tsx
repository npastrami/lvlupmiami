"use client";
import Image from "next/image";
import type { NextPage } from "next";
import Slider from "react-slick";
import { useState } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./carousel.css"; // Import custom styles

const Home: NextPage = () => {
  // Image URLs for the first carousel (Hot Off The Press)
  const [imagesHotOffPress, setImagesHotOffPress] = useState<string[]>([
    "/placeholder1.jpg",
    "/placeholder2.png",
    "/placeholder3.jpg",
    "/placeholder4.jpg",
    "/placeholder5.jpg",
  ]);

  // Image URLs for the second carousel (Upcoming Releases)
  const [imagesUpcomingReleases, setImagesUpcomingReleases] = useState<string[]>([
    "/placeholder6.jpg",
    "/placeholder7.png",
    "/placeholder8.jpg",
    "/placeholder9.jpg",
    "/placeholder10.jpg",
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
    arrows: true,
    centerMode: true,
    centerPadding: "150px", // Adjust to determine how much of adjacent slides is visible
  };

  return (
    <div className="flex items-center flex-col justify-center flex-grow pt-10 overflow-visible">
      <div className="px-5 w-[90%] md:w-[75%] overflow-visible">
        <h1 className="text-center mb-6">
          <span className="block text-4xl mb-2 font-bold">Level-Up ⏫</span>
          <span className="block text-2xl">
            Level-Up Your Lifestyle, Decentralized NFT Rewards Platform
          </span>
        </h1>
        
        {/* Hot Off The Press Carousel */}
        <div className="w-full mb-8">
          <span className="block text-2xl text-left font-bold ml-2">
            Hot Off The Press
          </span>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          {/* Centered Carousel Container */}
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
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* Upcoming Releases Carousel */}
        <div className="w-full mt-12 mb-8">
          <span className="block text-2xl text-left font-bold ml-2">
            Upcoming Releases
          </span>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          {/* Centered Carousel Container */}
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
          <span className="block text-2xl text-left font-bold ml-2 text-center">
            About Us
          </span>
        </div>

        {/* Centered Text Content */}
        <div className="max-w-3xl mx-auto text-center mt-8">
          <p className="text-center text-lg">
            🦸 A superpower of Ethereum is allowing you, the builder, to create
            a simple set of rules that an adversarial group of players can use
            to work together. In this challenge, you create a decentralized
            application where users can coordinate a group funding effort. If
            the users cooperate, the money is collected in a second smart
            contract. If they defect, the worst that can happen is everyone
            gets their money back. The users only have to trust the code.
          </p>
          <p className="text-center text-lg mt-4">
            🌟 The final deliverable is deploying a Dapp that lets users send
            ether to a contract and stake if the conditions are met, then
            deploy your app to a public webserver. Submit the url on{" "}
            <a
              href="https://speedrunethereum.com/"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
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
