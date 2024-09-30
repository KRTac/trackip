const fs = require('fs');

const { initCacheDir, supabase, errorPath, config } = require('./common.js');


async function dbError(message) {
  console.log('Error:', message);

  const { data: lastReported } = await supabase
    .from('errors')
    .select('id, message, created_at, last_reported_at')
    .order('created_at', { ascending: false })
    .limit(1);

  if (Array.isArray(lastReported) && lastReported.length && lastReported[0].message === message) {
    reportedLastAt = new Date(`${lastReported[0].last_reported_at || lastReported[0].created_at}+0000`);
    intervalMs = (config.interval + .5) * 60 * 1000;

    if (new Date().getTime() - reportedLastAt.getTime() < intervalMs) {
      await supabase
        .from('errors')
        .update({ last_reported_at: new Date().toISOString() })
        .eq('id', lastReported[0].id);

      return;
    }
  }

  await supabase
    .from('errors')
    .insert({
      created_at: new Date().toISOString(),
      message
    });
}

function localError(msg) {
  console.log('Error:', message);
  initCacheDir();

  fs.writeFileSync(errorPath, msg, { encoding: 'utf8' });
}

module.exports = { 
  dbError, localError
};