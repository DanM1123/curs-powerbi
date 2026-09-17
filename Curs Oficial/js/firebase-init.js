(function () {
  'use strict';

  const API = '/.netlify/functions/polls';

  window.LIVE_POLLS = {
    listen(path, onData, onError) {
      const pull = () => fetch(API + '?id=' + encodeURIComponent(path))
        .then((r) => {
          if (!r.ok) throw new Error('read failed');
          return r.json();
        })
        .then(onData)
        .catch(onError);
      pull();
      const timer = setInterval(pull, 1500);
      return () => clearInterval(timer);
    },
    vote(path, optionIndex) {
      return fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: path, option: optionIndex })
      }).then((r) => {
        if (!r.ok) throw new Error('write failed');
        return r.json();
      });
    }
  };

  window.LIVE_POLLS_READY = Promise.resolve(window.LIVE_POLLS);
  console.info('[polls] live sync via Netlify');
})();
