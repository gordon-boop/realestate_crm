import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0e2841",
        line: "#ded7e4",
        brand: "#196B24",
        accent: "#ffac00",
        canvas: "#f8f5f0"
      }
    }
  },
  plugins: []
};

export default config;
