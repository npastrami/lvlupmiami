import React from 'react';
import Particles from 'react-tsparticles';

const ParticlesBackground: React.FC = () => {
  return (
    <Particles
      id="tsparticles"
      options={{
        background: {
          color: {
            value: "#000000",
          },
        },
        particles: {
          number: {
            value: 100,
          },
          move: {
            enable: true,
            speed: 1,
          },
          color: {
            value: "#ffffff",
          },
          size: {
            value: 2,
          },
        },
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
};

export default ParticlesBackground;
