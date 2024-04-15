module.exports = {
  testEnvironment: 'node',
  roots: ['lib'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
