/**
 * Handle the Worker event. Fetches details for each provided listing id.
 *
 * @param {Object} event the worker event.
 * @param {string} event.data.api the URL to fetch.
 * @param {string[]} event.data.ids list of listing ids
 */
onmessage = async (event) => {
  const { listingId } = event.data;

  try {
    const response = await fetch(`/bin/bhhs/CregPropertySearchServlet?SearchType=Envelope&ListingId=${listingId}`);
    const data = response.ok ? await response.json() : undefined;

    postMessage(data);
  } catch (error) {
    postMessage({});
  }
};
