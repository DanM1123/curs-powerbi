const json = (status, body) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  },
  body: JSON.stringify(body)
});

const keyFor = (id) => String(id || '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180);

const countsFrom = (record) => {
  const counts = {};
  const ballots = record && record.ballots ? record.ballots : {};
  Object.values(ballots).forEach((choice) => {
    const n = parseInt(choice, 10);
    if (Number.isNaN(n)) return;
    counts[n] = (counts[n] || 0) + 1;
  });
  return counts;
};

exports.handler = async (event) => {
  try {
    const { getStore } = await import('@netlify/blobs');
    const store = getStore('polls');

    if (event.httpMethod === 'GET') {
      const id = keyFor((event.queryStringParameters || {}).id);
      if (!id) return json(400, { error: 'missing id' });
      const record = (await store.get(id, { type: 'json' })) || { ballots: {} };
      return json(200, countsFrom(record));
    }

    if (event.httpMethod === 'POST') {
      const payload = JSON.parse(event.body || '{}');
      const id = keyFor(payload.id);
      const option = parseInt(payload.option, 10);
      if (!id || Number.isNaN(option)) return json(400, { error: 'missing vote' });
      const record = (await store.get(id, { type: 'json' })) || { ballots: {} };
      record.ballots = record.ballots || {};
      record.ballots[`${Date.now()}_${Math.random().toString(36).slice(2, 8)}`] = option;
      await store.setJSON(id, record);
      return json(200, countsFrom(record));
    }

    return json(405, { error: 'method not allowed' });
  } catch (err) {
    return json(500, { error: String(err && err.message ? err.message : err) });
  }
};
