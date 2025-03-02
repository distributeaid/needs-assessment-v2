module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "./jest.global-setup.ts",
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transformIgnorePatterns: ["node_modules/(?!(next-auth)/)"],
};
