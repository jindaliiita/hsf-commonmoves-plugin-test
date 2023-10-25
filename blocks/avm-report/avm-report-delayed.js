import { fetchPlaceholders } from '../../scripts/aem.js';

async function initGooglePlacesAPI() {
  const placeholders = await fetchPlaceholders();
  const CALLBACK_FN = 'initAvmPlaces';
  const { mapsApiKey } = placeholders;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.defer = true;
  script.innerHTML = `
    window.${CALLBACK_FN} = function(){
      const input = document.querySelector('form input[name="avmaddress"]');
      const autocomplete = new google.maps.places.Autocomplete(input, {fields:['formatted_address'], types: ['address']});
    }
    const script = document.createElement('script');
      script.src = "https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&libraries=places&callback=${CALLBACK_FN}";
      document.head.append(script);
  `;
  document.head.append(script);
}

initGooglePlacesAPI();
