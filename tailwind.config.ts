import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lato: ["lato", "sans-serif"],
        roboto: ["Roboto", "sans-serif"],
      },
      colors: {
        status: {
          done: "#67c18b",
          todo: "#d6dff5",
          disabled: "#a4a4a4",
          clicked: "#142851",
          hover: "#6bbf8f",
          error: "#d42f2f",
        },
      },
    },
  },

  plugins: [],
};
export default config;
