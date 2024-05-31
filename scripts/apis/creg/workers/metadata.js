import Search from '../search/Search.js';

/**
 * Handle the Worker event.
 *
 * @param {Object} event the worker event.
 * @param {string} event.data.api the URL to fetch.
 * @param {Search} event.data.searches search context
 *
 */
onmessage = async (event) => {
  const { search } = event.data;
  const results = await Search.fromJSON(search)
    .then((s) => {
      try {
        return fetch(`/bin/bhhs/CregPropertySearchServlet?${s.asCregURLSearchParameters()}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log('Failed to fetch properties from API.', error);
        return {};
      }
    })
    .then((resp) => {
      if (resp.ok) {
        return resp.json();
      }
      return {};
    }) || {};
  Object.keys(results).forEach((k) => {
    if (typeof results[k] === 'object' || Array.isArray(results[k])) {
      delete results[k];
    }
  });
  postMessage(results);
};
