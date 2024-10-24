const fs = require('fs');
const path = require('path');
const userHome = require('os').homedir();
const { createClient } = require('@supabase/supabase-js');


let config = undefined;
try {
  config = require(path.join(userHome, '.config/trackip/config.json'));
} catch (err) {
  try {
    config = require(path.join(__dirname, 'config.json'));
  } catch (err) {
    console.log([
      `No config.json detected in the root directory (${__dirname})`,
      'or in ~/.config/trackip/config.json.',
      'Use config.sample.json to set one up.'
    ].join(' '));

    process.exit(1);
  }
}


const latestPath = path.join(userHome, '.cache/trackip/latest');
const errorPath = path.join(userHome, '.cache/trackip/error');
const cachePath = path.dirname(latestPath);


function initCacheDir() {
  if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
  }
}

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

module.exports = {
  config, latestPath, cachePath, initCacheDir, supabase, errorPath
};