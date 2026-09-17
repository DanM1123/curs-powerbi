const DB = 'https://curspowerbi-7d88b-default-rtdb.europe-west1.firebasedatabase.app';

const json = (status, body) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  },
  body: JSON.stringify(body)
});

const pathFor = (id) => String(id || '')
  .replace(/[^a-zA-Z0-9/_-]/g, '_')
  .replace(/^\/+|\/+$/g, '')
  .slice(0, 180);

const countsFrom = (ballots) => {
  const counts = {};
  Object.values(ballots || {}).forEach((choice) => {
    const n = parseInt(choice, 10);
    if (Number.isNaN(n)) return;
    counts[n] = (counts[n] || 0) + 1;
  });
  return counts;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return json(200, { ok: true });

  try {
    const id = pathFor(
      event.httpMethod === 'GET'
        ? (event.queryStringParameters || {}).id
        : JSON.parse(event.body || '{}').id
    );
    if (!id) return json(400, { error: 'missing id' });

    if (event.httpMethod === 'GET') {
      const res = await fetch(`${DB}/${id}/ballots.json`);
      const ballots = await res.json();
      return json(200, countsFrom(ballots));
    }

    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');
      if (payload.action === 'reset') {
        const res = await fetch(`${DB}/${id}.json`, { method: 'DELETE' });
        if (!res.ok) throw new Error('reset failed ' + res.status);
        return json(200, { ok: true });
      }

      const option = parseInt(payload.option, 10);
      if (Number.isNaN(option)) return json(400, { error: 'missing vote' });
      const key = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const res = await fetch(`${DB}/${id}/ballots/${key}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(option)
      });
      if (!res.ok) throw new Error('firebase write ' + res.status);
      const all = await fetch(`${DB}/${id}/ballots.json`);
      return json(200, countsFrom(await all.json()));
    }

    return json(405, { error: 'method not allowed' });
  } catch (err) {
    return json(500, { error: String(err && err.message ? err.message : err) });
  }
};
