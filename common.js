const fs = require('fs');
const path = require('path');
const userHome = require('os').homedir();
const { createClient } = require('@supabase/supabase-js');

const config = require(path.join(userHome, '.config/trackip/config.json'));


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