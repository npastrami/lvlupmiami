import { createTamagui } from 'tamagui';

const config = createTamagui({
  themes: {
    light: {
      background: '#ffffff',
      color: '#000000',
      borderColor: '#e0e0e0',
      shadowColor: '#000000',
    },
    dark: {
      background: '#000000',
      color: '#ffffff',
      borderColor: '#333333',
      shadowColor: '#ffffff',
    },
  },
  tokens: {
    color: {
      white: '#ffffff',
      black: '#000000',
      gray1: '#f0f0f0',
      gray2: '#e0e0e0',
    },
    space: {
      '$0': 0,
      '$1': 4,
      '$2': 8,
      '$3': 12,
      '$4': 16,
      '$5': 20,
      '$6': 24,
      '$7': 28,
      '$8': 32,
    },
    size: {
      '$0': 0,
      '$1': 16,
      '$2': 32,
      '$3': 64,
      '$4': 128,
      '$5': 256,
      '$6': 512,
    },
    radius: {
      '$0': 0,
      '$1': 4,
      '$2': 8,
      '$3': 12,
      '$4': 16,
      '$5': 20,
    },
    zIndex: {
      '$0': 0,
      '$1': 1,
      '$2': 10,
      '$3': 100,
      '$4': 1000,
    },
    fontSize: {
      '$1': 12,
      '$2': 14,
      '$3': 16,
      '$4': 18,
      '$5': 20,
      '$6': 24,
      '$7': 30,
      '$8': 36,
    },
  },
  fonts: {
    heading: {
      family: 'Arial, sans-serif',
      size: {
        '$1': 20,
        '$2': 24,
        '$3': 30,
        '$4': 36,
        '$5': 48,
      },
      lineHeight: {
        '$1': 24,
        '$2': 28,
        '$3': 36,
        '$4': 42,
        '$5': 56,
      },
      weight: {
        '$1': '400',
        '$2': '500',
        '$3': '700',
      },
    },
    body: {
      family: 'Verdana, sans-serif',
      size: {
        '$1': 14,
        '$2': 16,
        '$3': 18,
        '$4': 20,
        '$5': 22,
      },
      lineHeight: {
        '$1': 20,
        '$2': 24,
        '$3': 28,
        '$4': 32,
        '$5': 36,
      },
      weight: {
        '$1': '400',
        '$2': '600',
      },
    },
  },
  shorthands: {
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    mx: 'marginHorizontal',
    my: 'marginVertical',
  } as const,
});

export default config;
