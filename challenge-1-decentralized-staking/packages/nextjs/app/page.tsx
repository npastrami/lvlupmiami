// app/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import "./carousel.css";
import type { NextPage } from "next";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

// app/page.tsx

const Home: NextPage = () => {
  const [imagesHotOffPress] = useState<string[]>([
    "/placeholder1.jpg",
    "/placeholder2.png",
    "/placeholder3.jpg",
    "/placeholder4.jpg",
    "/placeholder5.jpg",
  ]);

  const [imagesUpcomingReleases] = useState<string[]>([
    "/placeholder6.jpg",
    "/placeholder7.png",
    "/placeholder8.jpg",
    "/placeholder9.jpg",
    "/placeholder10.jpg",
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
          Our project harnesses the power of decentralized technology to redefine the way users interact with blockchain ecosystems.
           Built with SpeedRunEthereum and Scaffoldeth, our solution addresses key challenges in decentralized finance and digital\
            ownership through a seamless and user-friendly application. Through innovation, we aim to set a new standard for 
            decentralized applications and contribute meaningfully to the future of Web3.
          </p>
          <p className="text-center text-lg mt-4">
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
  );
};

export default Home;
