module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  testEnvironmentOptions: {
    url: "https://developer.android.com/docs/quality-guidelines/wear-app-quality",
  },
};
