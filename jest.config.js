module.exports = {
  testEnvironment: 'jsdom',
  moduleDirectories: ['node_modules', 'source'],
  moduleNameMapper: {
    '^.*\.(css|scss)$': 'babel-jest',
  },
  setupFiles: ['./jest.setup.js'],
  clearMocks: true,
  verbose: true,
  collectCoverage: true,
};
