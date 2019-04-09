module.exports = function (api) {
  api.cache(true);

  return {
    "presets": [
      "@babel/preset-react",
      ["@babel/preset-env", { "modules": false }],
    ],
    "plugins": [
      "lodash",
      "@babel/plugin-proposal-class-properties",
    ]
  };
};
