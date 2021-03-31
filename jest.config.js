module.exports = {
  moduleDirectories: ['node_modules', 'source'],
  moduleNameMapper: {
    '^.*\.(css|scss)$': 'babel-jest',
  },
  clearMocks: true,
  verbose: true,
  collectCoverage: true,
};
