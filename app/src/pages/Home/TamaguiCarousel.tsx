import React from 'react';
import { Card, Image, View, Button } from 'tamagui';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

type TamaguiCarouselProps = {
  imageRange: {
    start: number;
    end: number;
  };
  showPurchaseButton?: boolean; // New prop to determine if the button should be displayed
};

const TamaguiCarousel: React.FC<TamaguiCarouselProps> = ({ imageRange, showPurchaseButton = false }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Show 3 slides at a time to show the current and partial adjacent cards
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    centerMode: true, // Enable center mode to show parts of the adjacent slides
    centerPadding: '60px', // Add more padding to create visible spacing between cards
  };

  // Generate image paths based on the provided range
  const images = [];
  for (let i = imageRange.start; i <= imageRange.end; i++) {
    images.push(`/src/assets/nftsample${i}.jpg`);
  }

  return (
    <View style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <Slider {...settings}>
        {images.map((src, index) => (
          <Card
            key={index}
            elevate
            size="$4"
            width={200} // Set the width to 200px
            height={400} // Set the height to 400px
            alignItems="center"
            justifyContent="center"
            bordered
            borderRadius="$4"
            hoverStyle={{ scale: 1.05 }}
            pressStyle={{ scale: 0.98 }}
            style={{
              margin: '0 15px', // Set horizontal margin to add consistent gap between the cards
              opacity: 0.85, // Set opacity for non-current slides
              transition: 'opacity 0.3s ease-in-out',
              position: 'relative', // Set position to relative for containing the absolute button
            }}
            className="slider-card"
          >
            <Card.Background>
              <Image
                resizeMode="cover"
                source={{
                  uri: src,
                  width: 180, // Adjusted width to fit comfortably within the card
                  height: 300, // Adjusted height to fit comfortably within the card
                }}
                style={{
                  borderRadius: '16px', // Round the edges of the image
                  width: '90%', // Reduce width to fit comfortably within the card
                  height: '90%', // Reduce height to fit comfortably within the card
                  margin: '5%',
                  objectFit: 'cover',
                }}
              />
            </Card.Background>
            <Card.Header padded>
              {/* <Text fontSize="$6" color="white" textAlign="center">
                NFT {index + 1} Description
              </Text> */}
            </Card.Header>
            {showPurchaseButton && (
              <Button
                backgroundColor="$lightBlue"
                hoverStyle={{ backgroundColor: '$blue' }}
                color="black"
                borderRadius="$4"
                marginTop="$2"
                style={{
                  position: 'absolute',
                  bottom: '20px', // Set the button at the bottom with some margin
                  left: '50%',
                  transform: 'translateX(-50%)', // Center the button horizontally within the card
                }}
              >
                Buy Now
              </Button>
            )}
          </Card>
        ))}
      </Slider>
    </View>
  );
};

export default TamaguiCarousel;
