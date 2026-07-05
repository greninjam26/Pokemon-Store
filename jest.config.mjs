import nextJest from "next/jest.js";

const createJestConfig = nextJest({
	dir: "./",
});

const customJestConfig = {
	clearMocks: true,
	coverageProvider: "v8",
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	testEnvironment: "jsdom",
};

export default createJestConfig(customJestConfig);
