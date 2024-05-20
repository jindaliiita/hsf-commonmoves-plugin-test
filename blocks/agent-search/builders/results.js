/**
 * The selector for the results div.
 *
 * @type {string}
 */
export const RESULTS_SELECTOR = '.search-results';

const phoneFormat = (num) => {
  if (!num) {
    return '';
  }
  const regex = /\((\d+)\).*?(\d+).*?(\d+)/;
  const match = num.match(regex);
  return `${match[1]}.${match[2]}.${match[3]}`;
};

const buildCard = (agent) => {
  const li = document.createElement('li');
  li.classList.add('agent-card');

  li.innerHTML = `
    <div class="profile">
      <div class="img">
        <picture>
         <img src="${agent.Photo}" loading="lazy" width="120" height="150"  alt="${agent.MemberFullName} photo">
        </picture>
      </div>
      <div class="agent-details">
        <h2>${agent.MemberFullName}</h2>
        <span class="title">${agent.JobTitle}</span>
        <span class="team">${agent.TeamName}</span>
        <div class="contact">
          <p class="phone">Direct: <a href="tel:${phoneFormat(agent.MemberOtherPhone)}">${phoneFormat(agent.MemberOtherPhone)}</a></p>
          <p class="phone">Office: <a href="tel:${phoneFormat(agent.MemberOfficePhone)}">${phoneFormat(agent.MemberOfficePhone)}</a></p>
          <ul class="social">
          </ul>
        </div>
      </div>
    </div>
    <div class="cta">
      <p class="button-container"><a class="button primary" href="">Contact Me</a></p>
      <p class="button-container"><a class="button secondary" href="${agent.MemberUrl}">Agent Details</a></p>
    </div>
    <div class="office">
      <h4>Office</h4>
      <div class="address">
        <p>Berkshire Hathaway HomeServices</p>
        <p>${agent.OfficeName}</p>
        <p>${agent.MemberAddress1}</p>
        <p>${agent.MemberCity}, ${agent.MemberStateOrProvince} ${agent.MemberPostalCode}</p>
      </div>
    </div>
  `;

  return li;
};

/**
 * Builds the agent results list
 *
 * @param {Object[]} list the list of agents
 *
 * @return {HTMLDivElement}
 */
export const buildResults = (list) => {
  const results = document.createElement('div');
  results.classList.add('search-results');
  const ul = document.createElement('ul');
  results.append(ul);

  ul.classList.add('agent-list');
  list.forEach((agent) => ul.append(buildCard(agent)));

  return results;
};
