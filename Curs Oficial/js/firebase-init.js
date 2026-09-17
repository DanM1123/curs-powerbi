(function () {
  'use strict';

  const DB = 'https://curspowerbi-7d88b-default-rtdb.europe-west1.firebasedatabase.app';

  const jsonUrl = (path) => DB + '/' + String(path).replace(/^\/+|\/+$/g, '') + '.json';

  window.LIVE_POLLS = {
    listen(path, onData, onError) {
      const url = jsonUrl(path);
      const pull = () => fetch(url).then((r) => {
        if (!r.ok) throw new Error('read failed');
        return r.json();
      }).then(onData).catch(onError);

      pull();
      const es = new EventSource(url);
      es.addEventListener('put', (e) => {
        try {
          const parsed = JSON.parse(e.data);
          onData(parsed && Object.prototype.hasOwnProperty.call(parsed, 'data') ? parsed.data : parsed);
        } catch (err) {
          if (onError) onError(err);
        }
      });
      es.addEventListener('patch', pull);
      return () => es.close();
    },
    vote(path, optionIndex) {
      const key = Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      return fetch(jsonUrl(path + '/ballots/' + key), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optionIndex)
      }).then((r) => {
        if (!r.ok) throw new Error('write failed');
      });
    }
  };

  window.LIVE_POLLS_READY = Promise.resolve(window.LIVE_POLLS);
  console.info('[polls] live sync enabled');
})();
