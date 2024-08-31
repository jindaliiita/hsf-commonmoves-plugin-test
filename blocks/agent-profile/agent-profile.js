import { decorateIcons, getMetadata } from '../../scripts/aem.js';
import {
  a, div, h1, ul, li, img, span, p,
} from '../../scripts/dom-helpers.js';

const getPhoneDiv = () => {
  let phoneDiv;
  let phoneUl;

  if (getMetadata('direct-phone')) {
    phoneUl = ul();
    phoneUl.append(li('Direct: ', getMetadata('direct-phone')));
  }

  if (getMetadata('office-phone')) {
    phoneUl = phoneUl || ul();
    phoneUl.append(li('Office: ', getMetadata('office-phone')));
  }

  if (phoneUl) {
    phoneDiv = div({ class: 'phone' });
    phoneDiv.append(phoneUl);
    return phoneDiv;
  }

  return phoneDiv;
};

const getWebsiteDiv = () => {
  let websiteDiv;
  const websiteUrl = getMetadata('website');

  if (websiteUrl) {
    const text = 'my website';
    const anchor = a({ href: websiteUrl, title: text, 'aria-label': text }, text);
    websiteDiv = div({ class: 'website' }, anchor);
  }

  return websiteDiv;
};

const getEmailDiv = () => {
  let emailDiv;
  const agentEmail = getMetadata('email');

  if (agentEmail) {
    const anchor = a({ href: `mailto:${agentEmail}`, title: agentEmail, 'aria-label': agentEmail }, agentEmail);
    emailDiv = div({ class: 'email' }, anchor);
  }

  return emailDiv;
};

const getImageDiv = () => {
  const agentPhoto = getMetadata('photo');
  return div({ class: 'profile-image' }, img({ src: agentPhoto, alt: getMetadata('name'), loading: 'lazy' }));
};

const getSocialDiv = () => {
  const socialDiv = div({ class: 'social' });
  let socialUl;

  ['facebook', 'instagram', 'linkedin'].forEach((x) => {
    const url = getMetadata(x);
    socialUl = socialUl || ul();
    if (url) {
      const socialLi = li(a({
        href: url, class: x, title: x, 'aria-label': x,
      }, span({ class: `icon icon-${x}` })));
      socialUl.append(socialLi);
    }
  });

  if (socialUl) {
    socialDiv.append(socialUl);
    return socialDiv;
  }

  return null;
};

const decorateAddress = (block) => {
  const streetAddress = getMetadata('street-address');
  const city = getMetadata('city');
  const state = getMetadata('state');
  const zip = getMetadata('zip');
  const text = `${streetAddress}, ${city}, ${state} ${zip}`;

  const addressDiv = div({ class: 'address' },
    p('Berkshire Hathaway HomeServices'),
    p('Commonwealth Real Estate'),
    p(streetAddress),
    p(`${city}, ${state} ${zip}`),
    a({ href: `https://maps.google.com/maps?q=${text}`, target: '_blank' }, 'Directions'),
  );

  block.append(addressDiv);
};

const decorateProfileDetails = (block) => {
  const profileDetails = div({ class: 'profile-details' });
  const profileImage = getImageDiv();
  const profileContent = div({ class: 'profile-content' },
    div({ class: 'name' }, h1(getMetadata('name'))),
    div({ class: 'designation' }, getMetadata('designation')),
  );

  const licenseNumber = getMetadata('license-number');
  if (licenseNumber) {
    profileContent.append(div({ class: 'license-number' }, `LIC# ${licenseNumber}`));
  }

  const emailDiv = getEmailDiv();
  if (emailDiv) {
    profileContent.append(emailDiv);
  }

  const websiteDiv = getWebsiteDiv();
  if (websiteDiv) {
    profileContent.append(websiteDiv);
  }

  const phoneDiv = getPhoneDiv();
  if (phoneDiv) {
    profileContent.append(phoneDiv);
  }

  const contactMeText = 'Contact Me';
  profileContent.append(div({ class: 'contact-me' },
    a({ href: '#', title: contactMeText, 'aria-label': contactMeText }, contactMeText)));

  const socialDiv = getSocialDiv();
  if (socialDiv) {
    profileContent.append(socialDiv);
  }

  decorateIcons(profileContent);
  profileDetails.append(profileImage, profileContent);
  block.replaceChildren(profileDetails);
};

const viewMoreOnClick = (name, anchor, block) => {
  anchor.addEventListener('click', (event) => {
    event.preventDefault();
    if (anchor.classList.contains('view-more')) {
      anchor.classList.remove('view-more');
      anchor.classList.add('view-less');
      block.querySelector(`.${name}-non-truncate`).classList.remove('hide');
      block.querySelector(`.${name}-truncate`).classList.add('hide');
    } else {
      anchor.classList.remove('view-less');
      anchor.classList.add('view-more');
      block.querySelector(`.${name}-non-truncate`).classList.add('hide');
      block.querySelector(`.${name}-truncate`).classList.remove('hide');
    }
  });
};

const decorateAbout = (block) => {
  const text = 'about';
  const aboutText = getMetadata(text);
  const aboutDiv = div({ class: text });
  const threshold = 245;
  aboutDiv.append(div({ class: `${text}-truncate` }, aboutText.substring(0, threshold)));
  aboutDiv.append(div({ class: `${text}-non-truncate hide` }, aboutText));
  aboutDiv.append(a({ href: '#', class: 'view-more' }));
  viewMoreOnClick(text, aboutDiv.querySelector('a'), block);
  block.append(aboutDiv);
};

const createLangoOrProfAccred = (key, langProfAccredDiv) => {
  const threshold = 3;
  const truncateDiv = ul({ class: `${key}-truncate` });
  const nontruncateDiv = ul({ class: `${key}-non-truncate hide` });

  getMetadata(key).split(',').filter((x) => x).forEach((x, index) => {
    if (index < threshold) {
      truncateDiv.append(li(x.trim()));
    }
    nontruncateDiv.append(li(x.trim()));
  });

  const anchor = a({ href: '#', class: 'view-more' });
  langProfAccredDiv.append(div({ class: key },
    truncateDiv,
    nontruncateDiv,
    anchor,
  ));

  viewMoreOnClick(key, anchor, langProfAccredDiv);
};

const decorateLangProfAccred = (block) => {
  const langProfAccredDiv = div({ class: 'lang-prof-accred' });
  createLangoOrProfAccred('languages', langProfAccredDiv);
  createLangoOrProfAccred('professional-accreditations', langProfAccredDiv);
  block.append(langProfAccredDiv);
};

export default async function decorate(block) {
  decorateProfileDetails(block);
  decorateAbout(block);
  decorateLangProfAccred(block);
  decorateAddress(block);
}
