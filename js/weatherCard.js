// Descriptions météorologiques selon l'API Météo Concept
const weatherDescriptions = {
  0: "Soleil", 1: "Peu nuageux", 2: "Ciel voilé", 3: "Nuageux", 4: "Très nuageux",
  5: "Brouillard", 6: "Brouillard givrant", 7: "Pluie faible", 8: "Pluie modérée",
  9: "Pluie forte", 10: "Pluie faible verglaçante", 11: "Pluie modérée verglaçante",
  12: "Pluie forte verglaçante", 13: "Bruine", 14: "Neige faible", 15: "Neige modérée",
  16: "Neige forte", 20: "Orage", 21: "Grêle", 22: "Neige faible", 30: "Temps ensoleillé",
  31: "Éclaircies", 32: "Nuageux", 33: "Brume", 34: "Variable"
};

// Icônes météorologiques en emoji
const weatherIcons = {
  0: "☀️", 1: "🌤️", 2: "⛅", 3: "☁️", 4: "☁️",
  5: "🌫️", 6: "🌫️", 7: "🌦️", 8: "🌧️", 9: "⛈️",
  10: "🌧️", 11: "🌧️", 12: "⛈️", 13: "🌦️", 14: "🌨️",
  15: "❄️", 16: "❄️", 20: "⛈️", 21: "⛈️", 22: "🌨️",
  30: "☀️", 31: "🌤️", 32: "☁️", 33: "🌫️", 34: "⛅"
};

function getWeatherDescription(code) {
  return weatherDescriptions[code] || "Conditions inconnues";
}

function getWeatherIcon(code) {
  return weatherIcons[code] || "❓";
}

function getWindDirection(degrees) {
  if (degrees == null || isNaN(degrees)) return "N/A";
  
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function createWeatherCard(city, forecast, options) {
  const card = document.createElement("div");
  card.className = "weather-card";
  
  // Construction du contenu HTML de la carte
  let content = `
    <h3>${city.name}</h3>
    <div class="weather-main">
      <div class="weather-icon">${getWeatherIcon(forecast.weather)}</div>
      <div class="weather-description">${getWeatherDescription(forecast.weather)}</div>
      <div class="temperature">${forecast.tmax || 'N/A'}°C</div>
      <div class="temp-range">
        ${forecast.tmin || 'N/A'}°C / ${forecast.tmax || 'N/A'}°C
      </div>
      <div style="margin-top: 0.5rem; color: #888; font-size: 0.9rem;">
        ${formatDate(forecast.datetime)}
      </div>
    </div>
    <div class="weather-details">
  `;

  // Ajout des informations optionnelles
  if (options.showLat && city.latitude) {
    content += `
      <div class="info-row">
        <span class="info-label">Latitude:</span>
        <span class="info-value">${parseFloat(city.latitude).toFixed(4)}°</span>
      </div>
    `;
  }

  if (options.showLon && city.longitude) {
    content += `
      <div class="info-row">
        <span class="info-label">Longitude:</span>
        <span class="info-value">${parseFloat(city.longitude).toFixed(4)}°</span>
      </div>
    `;
  }

  if (options.showRain) {
    const rainfall = forecast.rr10 || 0;
    content += `
      <div class="info-row">
        <span class="info-label">Cumul de pluie:</span>
        <span class="info-value">${rainfall} mm</span>
      </div>
    `;
  }

  if (options.showWind && forecast.wind10m) {
    const windSpeed = forecast.wind10m.speed || 0;
    content += `
      <div class="info-row">
        <span class="info-label">Vent moyen:</span>
        <span class="info-value">${windSpeed} km/h</span>
      </div>
    `;
  }

  if (options.showDir && forecast.wind10m && forecast.wind10m.direction != null) {
    const direction = getWindDirection(forecast.wind10m.direction);
    const degrees = Math.round(forecast.wind10m.direction);
    content += `
      <div class="info-row">
        <span class="info-label">Direction du vent:</span>
        <span class="info-value">${direction} (${degrees}°)</span>
      </div>
    `;
  }

  content += `</div>`;
  
  // Attribution du contenu HTML à la carte
  card.innerHTML = content;
  
  return card;
}