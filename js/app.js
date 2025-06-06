// Configuration de l'API
const apiKey = "f007935b67890ffa00d16a73cd0101d9c84f9cdb7cd0c28189b7a05695a4f901";
const meteoBaseUrl = "https://api.meteo-concept.com/api";
const geoBaseUrl = "https://geo.api.gouv.fr/communes";

const postalInput = document.getElementById("code-postal");
const communeSelect = document.getElementById("communeSelect");
const weatherInfoSection = document.getElementById("weatherInformation");
const nbDaysInput = document.getElementById("nbDays");
const daysCount = document.getElementById("daysCount");

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// Mise à jour du compteur de jours
nbDaysInput.addEventListener("input", () => {
  const value = nbDaysInput.value;
  daysCount.textContent = value;
});

// Recherche de communes par code postal
postalInput.addEventListener("input", debounce(async () => {
  const code = postalInput.value.trim();
  
  // Validation du code postal
  if (!/^\d{5}$/.test(code)) {
    communeSelect.innerHTML = "<option value=''>Sélectionnez une commune</option>"; 
    return;
  }

  try {
    // Chargement
    communeSelect.innerHTML = "<option value=''>Chargement des communes...</option>";
    
    // Récupérer les communes avec l'API
    const response = await fetch(`${geoBaseUrl}?codePostal=${code}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const communes = await response.json();

    // Si aucune commune n'est trouvé
    if (communes.length === 0) {
      communeSelect.innerHTML = "<option value=''>Aucune commune trouvée</option>";
      return;
    }

    // Réinitialisation et ajout des options
    communeSelect.innerHTML = "<option value=''>Sélectionnez une commune</option>";
    
    communes.forEach(commune => {
      const option = document.createElement("option");
      option.value = commune.code;
      option.textContent = commune.nom;
      
      // Ajout des coordonnées GPS si disponibles
      if (commune.centre && commune.centre.coordinates && commune.centre.coordinates.length >= 2) {
        option.dataset.latitude = commune.centre.coordinates[1];
        option.dataset.longitude = commune.centre.coordinates[0];
      }
      
      communeSelect.appendChild(option);
    });

  } catch (error) {
    console.error('Erreur lors de la recherche des communes:', error);
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

  // Affichage du message de chargement
  weatherInfoSection.innerHTML = "<div class='loading'>Chargement des prévisions météorologiques...</div>";

  // Récupération des paramètres du formulaire
  const nbDays = parseInt(nbDaysInput.value, 10);
  const options = {
    showLat: document.getElementById("lat").checked,
    showLon: document.getElementById("lon").checked,
    showRain: document.getElementById("rain").checked,
    showWind: document.getElementById("wind").checked,
    showDir: document.getElementById("dir").checked
  };

  // Récupération des informations de la ville sélectionnée
  const selectedOption = communeSelect.selectedOptions[0];
  const city = {
    name: selectedOption.textContent,
    latitude: selectedOption.dataset.latitude,
    longitude: selectedOption.dataset.longitude
  };

  try {
    // Appel de l'API
    const response = await fetch(`${meteoBaseUrl}/forecast/daily?token=${apiKey}&insee=${insee}&days=${nbDays}`);
    
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();

    // Vérification de la présence des données météo
    if (!data.forecast || data.forecast.length === 0) {
      throw new Error('Aucune donnée météo disponible pour cette commune');
    }

    weatherInfoSection.innerHTML = "";
    
    // Création et affichage des cartes météo
    data.forecast.slice(0, nbDays).forEach(forecast => {
      const card = createWeatherCard(city, forecast, options);
      weatherInfoSection.appendChild(card);
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données météo:', error);
    weatherInfoSection.innerHTML = `
      <div class='error-message'>
        Impossible de récupérer les prévisions météorologiques. 
        <br>Erreur: ${error.message}
        <br>Veuillez réessayer plus tard.
      </div>
    `;
  }
});