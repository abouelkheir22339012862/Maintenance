const searchBtn = document.getElementById("search-btn");
const compareBtn = document.getElementById("compare-btn");
const countryInp = document.getElementById("country-inp");
const countryInp1 = document.getElementById("country-inp-1");
const countryInp2 = document.getElementById("country-inp-2");
const resultDiv = document.getElementById("result");
const comparisonResultDiv = document.getElementById("comparison-result");

// Event Listener for Single Country Search
searchBtn.addEventListener("click", () => {
  const countryName = countryInp.value.trim();
  resultDiv.innerHTML = "";

  if (countryName === "") {
    resultDiv.innerHTML = `<h3 class="error">Please enter your country.</h3>`;
    return;
  }

  fetchCountryData(countryName)
    .then((data) => {
      displayCountryData(data, resultDiv);
    })
    .catch((error) => {
      resultDiv.innerHTML = `<h3 class="error">${error}</h3>`;
    });
});



compareBtn.addEventListener("click", () => {
  const countryName1 = countryInp1.value.trim();
  const countryName2 = countryInp2.value.trim();
  comparisonResultDiv.innerHTML = "";

  if (countryName1 === "" || countryName2 === "") {
    comparisonResultDiv.innerHTML = `<h3 class="error">Both country fields must be filled.</h3>`;
    return;
  }

  if (countryName1.toLowerCase() === countryName2.toLowerCase()) {
    comparisonResultDiv.innerHTML = `<h3 class="error">Please enter two different countries for comparison.</h3>`;
    return;
  }

  Promise.all([fetchCountryData(countryName1), fetchCountryData(countryName2)])
    .then(([data1, data2]) => {
      displayCountryData(data1, comparisonResultDiv, "comparison-card-1");
      displayCountryData(data2, comparisonResultDiv, "comparison-card-2");
      calculateAndDisplayDistance(data1, data2);
    })
    .catch((error) => {
      comparisonResultDiv.innerHTML = `<h3 class="error">${error}</h3>`;
    });
});



async function fetchCountryData(countryName) {
  const finalURL = `https://restcountries.com/v3.1/name/${encodeURIComponent(
    countryName
  )}?fullText=true`;

  const response = await fetch(finalURL);
  if (!response.ok) {
    throw new Error(`Country "${countryName}" not found.`);
  }
  const data = await response.json();
  return data[0];
}

function displayCountryData(data, container, cardId = "country-card") {
  const {
    name,
    capital,
    flags,
    continents,
    population,
    currencies,
    languages,
    latlng,
  } = data;

  const currencyKeys = currencies ? Object.keys(currencies) : [];
  const currency = currencyKeys.length > 0 ? currencies[currencyKeys[0]] : null;
  const languageList = languages ? Object.values(languages).join(", ") : "N/A";

  const countryHTML = `
    <div class="country-card" id="${cardId}">
      <img src="${flags.svg}" alt="Flag of ${name.common}" class="flag-img" />
      <h2>${name.common}</h2>
      <div class="data-wrapper">
        <h4>Capital:</h4>
        <span>${capital ? capital[0] : "N/A"}</span>
      </div>
      <div class="data-wrapper">
        <h4>Continent:</h4>
        <span>${continents ? continents[0] : "N/A"}</span>
      </div>
      <div class="data-wrapper">
        <h4>Population:</h4>
        <span>${population.toLocaleString()}</span>
      </div>
      <div class="data-wrapper">
        <h4>Currency:</h4>
        <span>${currency ? `${currency.name} (${currency.symbol || "N/A"})` : "N/A"}</span>
      </div>
      <div class="data-wrapper">
        <h4>Languages:</h4>
        <span>${languageList}</span>
      </div>
      <div class="data-wrapper">
        <h4>Coordinates:</h4>
        <span>${latlng ? latlng.join(", ") : "N/A"}</span>
      </div>
    </div>
  `;
  container.innerHTML += countryHTML;
}


function calculateAndDisplayDistance(country1, country2) {
  if (!country1.latlng || !country2.latlng) {
    comparisonResultDiv.innerHTML += `<div class="distance-info">Distance: N/A</div>`;
    return;
  }

  const distance = getDistanceFromLatLonInKm(
    country1.latlng[0],
    country1.latlng[1],
    country2.latlng[0],
    country2.latlng[1]
  );

  comparisonResultDiv.innerHTML += `
    <div class="distance-info">
      Distance between ${country1.name.common} and ${country2.name.common}: ${distance.toLocaleString()} km
    </div>
  `;
}


function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
