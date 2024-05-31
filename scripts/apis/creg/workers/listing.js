/**
 * Handle the Worker event. Fetches details for each provided listing id.
 *
 * @param {Object} event the worker event.
 * @param {string} event.data.api the URL to fetch.
 * @param {string[]} event.data.ids list of listing ids
 */
onmessage = async (event) => {
  const { ids, officeId } = event.data;
  const promises = [];
  ids.forEach((id) => {
    promises.push(
      fetch(`/bin/bhhs/CregPropertySearchServlet?SearchType=ListingId&ListingId=${id}${officeId ? `&OfficeCode=${officeId}` : ''}`)
        .then((resp) => (resp.ok ? resp.json() : undefined)),
    );
  });

  Promise.all(promises).then((values) => {
    postMessage(values.filter((v) => v));
  });
};
