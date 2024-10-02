export default {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  testMatch: ['**/**/*.test.ts'],
  verbose: true,
  forceExit: true,
};
