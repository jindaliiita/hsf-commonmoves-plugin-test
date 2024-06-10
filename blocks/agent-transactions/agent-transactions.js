import {
  table, tbody, th, thead, tr, td, h1, a,
} from '../../scripts/dom-helpers.js';
import { getMetadata } from '../../scripts/aem.js';

const getClosedTransactions = async () => {
  const agentId = getMetadata('agent-id');
  const formattedData = [];

  try {
    const response = await fetch(`/bin/bhhs/agentPropertyListingsServlet.${agentId}.json`);
    const data = await response.json();

    if (data && data?.closedTransactions?.properties?.length) {
      data.closedTransactions.properties.forEach((property) => {
        formattedData.push({
          address: property.StreetName,
          city: property.City,
          state: property.StateOrProvince,
          'sold-price': property.closePrice,
          beds: property.BedroomsTotal,
          baths: property.BathroomsTotal,
          'approx-sq-ft': property.LivingArea,
          type: property.PropertyType,
          'closed-date': property.ClosedDate,
        });
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching closed transactions', error);
  }

  return formattedData;
};

export default async function decorate(block) {
  const transactionsData = await getClosedTransactions();
  if (transactionsData.length === 0) {
    return;
  }

  const thList = ['address', 'city', 'state', 'sold price', 'beds', 'baths', 'approx sq. ft.', 'type', 'closed date'];
  const thDefault = { class: 'default', list: [0, 3] };
  const thMedium = { class: 'medium', list: [1, 2] };
  const thLarge = { class: 'large', list: [4, 5, 8] };
  const thXL = { class: 'xl', list: [6, 7] };

  const theadTr = tr();
  const getClass = (index) => {
    if (thDefault.list.includes(index)) {
      return `${thDefault.class}`;
    }
    if (thMedium.list.includes(index)) {
      return `${thMedium.class}`;
    }
    if (thLarge.list.includes(index)) {
      return `${thLarge.class}`;
    }
    return `${thXL.class}`;
  };

  thList.forEach((x, index) => {
    theadTr.appendChild(th({ class: `${x.split(' ').join('-').replace(/\./g, '')} ${getClass(index)}` }, x));
  });

  const trBody = tbody();
  const intialTransactionsCount = 6; // show 6 transactions initially

  transactionsData.forEach((data, topIndex) => {
    const trElement = tr({ class: `${topIndex < intialTransactionsCount ? 'show' : 'hide'}` });

    thList.forEach((x, index) => {
      const key = x.split(' ').join('-').replace(/\./g, '');
      trElement.appendChild(td({ class: `${x.split(' ').join('-').replace(/\./g, '')} ${getClass(index)}` }, (data[key]) || ''));
    });

    trBody.appendChild(trElement);
  });

  const tableElement = table(thead(theadTr), trBody);
  const heading1 = h1('Closed Transactions');
  const anchor = a({ class: 'show-more' });
  anchor.addEventListener('click', () => {
    if (anchor.classList.contains('show-more')) {
      anchor.classList.remove('show-more');
      anchor.classList.add('show-less');
      const tBodyTr = block.querySelectorAll('tbody tr.hide');
      tBodyTr.forEach((trElement) => {
        trElement.classList.remove('hide');
      });
    } else {
      anchor.classList.remove('show-less');
      anchor.classList.add('show-more');
      const tBodyTr = block.querySelectorAll('tbody tr');
      tBodyTr.forEach((trElement, index) => {
        if (index >= intialTransactionsCount) {
          trElement.classList.add('hide');
        }
      });
    }
  });

  block.replaceChildren(heading1, tableElement, anchor);
}
