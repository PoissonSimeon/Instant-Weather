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
    if (!res.ok) throw new Error(res.status);
    const communes = await res.json();

    if (communes.length === 0) {
      communeSelect.innerHTML = "<option value=''>Aucune commune trouvée</option>";
      return;
    }

    communeSelect.innerHTML = "<option value=''>-- Sélectionnez une commune --</option>";
    communes.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.code;
      opt.textContent = c.nom;
      if (c.centre && Array.isArray(c.centre.coordinates) && c.centre.coordinates.length >= 2) {
        const lon = c.centre.coordinates[0]; 
        const lat = c.centre.coordinates[1];
        if (!isNaN(lat) && !isNaN(lon)) {
          opt.setAttribute("data-latitude", lat);
          opt.setAttribute("data-longitude", lon);
        }
      }
      communeSelect.appendChild(opt);
    });
  } catch (err) {
    console.error("Erreur Geo API :", err);
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

  weatherInfoSection.innerHTML = "<div class='loading'><span class='material-icons'>hourglass_top</span> Chargement des prévisions...</div>";

  const nbDays = parseInt(nbDaysInput.value, 10);
  const showLat = document.getElementById("lat").checked;
  const showLon = document.getElementById("lon").checked;
  const showRain = document.getElementById("rain").checked;
  const showWind = document.getElementById("wind").checked;
  const showDir = document.getElementById("dir").checked;

  const selectedOption = communeSelect.selectedOptions[0];
  const city = {
    name: selectedOption.textContent,
    latitude: selectedOption.getAttribute("data-latitude"),
    longitude: selectedOption.getAttribute("data-longitude")
  };

  try {
    const resF = await fetch(`${meteoBaseUrl}/forecast/daily?token=${apiKey}&insee=${insee}&days=${nbDays}`);
    if (!resF.ok) throw new Error(`Erreur API: ${resF.status}`);
    const jsonF = await resF.json();

    if (!jsonF.forecast || !Array.isArray(jsonF.forecast)) {
      throw new Error("Réponse API inattendue : prévisions manquantes.");
    }

    const forecasts = jsonF.forecast.slice(0, nbDays);

    if ((!city.latitude || !city.longitude) && jsonF.city) {
      city.latitude = jsonF.city.latitude;
      city.longitude = jsonF.city.longitude;
    }

    weatherInfoSection.innerHTML = "";
    forecasts.forEach(f => {
      const card = createWeatherCard(city, f, { showLat, showLon, showRain, showWind, showDir });
      weatherInfoSection.appendChild(card);
    });
  } catch (err) {
    console.error("Erreur Météo API :", err);
    weatherInfoSection.innerHTML = "<div class='error-message'><span class='material-icons'>error</span> Impossible de récupérer les prévisions.</div>";
  }
});

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
