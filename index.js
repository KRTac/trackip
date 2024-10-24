const fs = require('fs');
const https = require('https');
const net = require('net');

const { initCacheDir, latestPath, supabase } = require('./common.js');
const { dbError } = require('./errors.js');


https.get('https://icanhazip.com/', (res) => {
  res.setEncoding('utf8');

  let currentIp = '';
  res.on('data', (chunk) => { currentIp += chunk; });
  res.on('end', async () => {
    currentIp = currentIp.trim();

    if (net.isIP(currentIp) !== 4) {
      await dbError('icanhazip.com returned something that\'s not an IPv4 address.');

      return;
    }

    const { data: lastReported } = await supabase
      .from('addresses')
      .select('id, address')
      .order('created_at', { ascending: false })
      .limit(1);

    if (Array.isArray(lastReported) && lastReported.length && lastReported[0].address === currentIp) {
      await supabase
        .from('addresses')
        .update({ last_checked_at: new Date().toISOString() })
        .eq('id', lastReported[0].id);

      console.log(`No IP address change detected, updating last checked timestamp. IP: ${currentIp}`);
    } else {
      await supabase
        .from('addresses')
        .insert({
          created_at: new Date().toISOString(),
          address: currentIp
        });

      // TODO update DNS with new ip

      initCacheDir();

      fs.writeFileSync(latestPath, currentIp, { encoding: 'utf8' });

      console.log(`Detected and reported IP address change. Old IP: ${lastReported[0].address} IP: ${currentIp}`);
    }
  });
}).on('error', () => {
  require('dns').lookup('google.com', (err) => {
    if (err && err.code === 'ENOTFOUND') {
      dbError(`Internet is down.`);
    } else {
      dbError(`icanhazip.com is down.`);
    }
  });
});
