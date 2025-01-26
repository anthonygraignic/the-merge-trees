// svgo.config.js
module.exports = {
  multipass: true, // boolean. false by default
  datauri: 'unenc', // 'base64' (default), 'enc' or 'unenc'.
  plugins: [
    // set of built-in plugins enabled by default
    'preset-default',

    // enable built-in plugins by name
    'prefixIds',
  ],
};
