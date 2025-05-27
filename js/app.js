const apiKey = "f007935b67890ffa00d16a73cd0101d9c84f9cdb7cd0c28189b7a05695a4f901";
const meteoBaseUrl = "https://api.meteo-concept.com/api";
const geoBaseUrl = "https://geo.api.gouv.fr/communes";

const postalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const weatherInfoSection = document.getElementById("weatherInformation");
const nbDaysInput = document.getElementById("nbDays");
const daysCount = document.getElementById("daysCount");

nbDaysInput.addEventListener("input", () => {
  daysCount.textContent = nbDaysInput.value;
});

postalInput.addEventListener("input", debounce(async () => {
  const code = postalInput.value.trim();
  if (!/^\d{5}$/.test(code)) {
    communeSelect.innerHTML = "<option value=''>-- Sélectionnez une commune --</option>"; 
    return;
  }

  try {
    communeSelect.innerHTML = "<option value=''>Chargement des communes...</option>";
    const res = await fetch(`${geoBaseUrl}?codePostal=${code}`);
    const communes = await res.json();

    communeSelect.innerHTML = communes.length === 0 ? "<option value=''>Aucune commune trouvée</option>" : "<option value=''>-- Sélectionnez une commune --</option>";
    communes.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.nom;
      if (c.centre?.coordinates?.length >= 2) {
        opt.dataset.latitude = c.centre.coordinates[1];
        opt.dataset.longitude = c.centre.coordinates[0];
      }
      communeSelect.appendChild(opt);
    });
  } catch {
    communeSelect.innerHTML = "<option value=''>Erreur de chargement</option>";
  }
}, 300));

document.getElementById("cityForm_form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const insee = communeSelect.value;
  if (!insee) {
    alert("Veuillez sélectionner une commune.");
    return;
  }

  weatherInfoSection.innerHTML = "<div class='loading'>Chargement des prévisions...</div>";
  const nbDays = parseInt(nbDaysInput.value, 10);
  const options = {
    showLat: document.getElementById("lat").checked,
    showLon: document.getElementById("lon").checked,
    showRain: document.getElementById("rain").checked,
    showWind: document.getElementById("wind").checked,
    showDir: document.getElementById("dir").checked
  };
  const selectedOption = communeSelect.selectedOptions[0];
  const city = {
    name: selectedOption.textContent,
    latitude: selectedOption.dataset.latitude,
    longitude: selectedOption.dataset.longitude
  };

  try {
    const resF = await fetch(`${meteoBaseUrl}/forecast/daily?token=${apiKey}&insee=${insee}&days=${nbDays}`);
    const jsonF = await resF.json();

    weatherInfoSection.innerHTML = "";
    jsonF.forecast?.slice(0, nbDays).forEach(f => {
      weatherInfoSection.appendChild(createWeatherCard(city, f, options));
    });
  } catch {
    weatherInfoSection.innerHTML = "<div class='error-message'>Impossible de récupérer les prévisions.</div>";
  }
});

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
