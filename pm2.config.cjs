module.exports = {
  apps: [
    {
      name: "gi-tcg-assets-moyu-s7",
      script: "src/main.ts",
      env: {
        NODE_ENV: "production",
      },
      interpreter: "bun",
      min_uptime: "5s",
      max_restarts: 5,
    }
  ]
};