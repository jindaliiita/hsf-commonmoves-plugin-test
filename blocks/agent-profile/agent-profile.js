import { decorateIcons, getMetadata } from '../../scripts/aem.js';
import {
  a, div, h1, ul, li, img, span,
} from '../../scripts/dom-helpers.js';

const getPhoneDiv = () => {
  let phoneDiv;
  let phoneUl;

  if (getMetadata('direct-phone')) {
    phoneUl = ul({});
    phoneUl.append(li({}, 'Direct: ', getMetadata('direct-phone')));
  }

  if (getMetadata('office-phone')) {
    phoneUl = phoneUl || ul({});
    phoneUl.append(li({}, 'Office: ', getMetadata('office-phone')));
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
    socialUl = socialUl || ul({});
    if (url) {
      const socialLi = li({}, a({
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

export default async function decorate(block) {
  const profileImage = getImageDiv();
  const profileContent = div({ class: 'profile-content' },
    div({ class: 'name' }, h1({}, getMetadata('name'))),
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
  block.replaceChildren(profileImage, profileContent);
}
