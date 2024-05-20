/**
 * Handle the Worker event.
 *
 * @param {Object} event the worker event.
 * @param {string} event.data.url the URL to fetch.
 *
 */
onmessage = (event) => {
  fetch(event.data.url).then(async (resp) => {
    if (resp.ok) {
      postMessage(await resp.json());
    } else {
      postMessage({});
    }
  });
};
