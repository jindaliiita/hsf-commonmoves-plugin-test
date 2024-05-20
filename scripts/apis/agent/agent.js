const urlParams = new URLSearchParams(window.location.search);
export const DOMAIN = urlParams.get('env') === 'stage' ? 'ignite-staging.bhhs.com' : 'www.bhhs.com';
const API_URL = `https://${DOMAIN}/bin/bhhs`;

/**
 * Search for Agents
 * @param {SearchParameters} params the parameters
 * @return {Promise<Object>}
 */
export async function search(params) {
  return new Promise((resolve) => {
    const worker = new Worker(`${window.hlx.codeBasePath}/scripts/apis/agent/workers/search.js`);
    const url = `${API_URL}/solrAgentSearchServlet?${params.asQueryString()}&_=${Date.now()}`;
    worker.onmessage = (e) => resolve(e.data);
    worker.postMessage({ url });
  });
}
