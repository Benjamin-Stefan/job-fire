module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    projects: ["./packages/core", "./packages/adapter-mongo", "./packages/adapter-redis"],
    transformIgnorePatterns: ["/node_modules/"],
};
