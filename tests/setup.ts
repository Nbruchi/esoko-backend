import { config } from "dotenv";

// Load environment variables from .env.test
config({ path: ".env" });

// Set test environment
process.env.NODE_ENV = "test";

// Mock console methods to keep test output clean
global.console = {
    ...console,
    // Uncomment to suppress console output during tests
    // log: jest.fn(),
    // debug: jest.fn(),
    // info: jest.fn(),
    // warn: jest.fn(),
    error: jest.fn(),
};

// Increase timeout for all tests
jest.setTimeout(10000);
