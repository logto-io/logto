"use strict";

const path = require("path");

module.exports = {
  options: {
    buildType: "spa",
  },
  plugins: ["scss"],
  modifyWebpackConfig: ({ webpackConfig }) => {
    /** @type {import('webpack').Configuration} **/
    const config = { ...webpackConfig };

    config.resolve.alias = {
      "@": path.resolve("src/"),
    };

    return config;
  },
};
