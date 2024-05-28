/*
  Agent API
 */

/**
 * Search for Agents
 * @param {SearchParameters} params the parameters
 * @return {Promise<Object>}
 */
// eslint-disable-next-line import/prefer-default-export
export async function search(params) {
  return new Promise((resolve) => {
    const worker = new Worker(`${window.hlx.codeBasePath}/scripts/apis/agent/workers/search.js`);
    const url = `/bin/bhhs/solrAgentSearchServlet?${params.asQueryString()}&_=${Date.now()}`;
    worker.onmessage = (e) => resolve(e.data);
    worker.postMessage({ url });
  });
}
