import Search from '../search/Search.js';

/**
 * Handle the Worker event.
 *
 * @param {Object} event the worker event.
 * @param {string} event.data.api the URL to fetch.
 * @param {Search} event.data.searches search context
 */
onmessage = async (event) => {
  const { api, search } = event.data;
  const results = await Search.fromJSON(search)
    .then((s) => {
      try {
        return fetch(`${api}/CregPropertySearchServlet?${s.asCregURLSearchParameters()}`);
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
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log('Failed to fetch properties from API.', error);
      return {};
    });
  if (results) {
    const resp = {
      properties: results.properties || [],
      disclaimer: results.disclaimer.Text,
      clusters: results.listingClusters || [],
      pins: results.listingPins || [],
      pages: results['@odata.context'],
      page: search.page,
      count: results['@odata.count'],
    };
    postMessage(resp);
  } else {
    postMessage([]);
  }
};
