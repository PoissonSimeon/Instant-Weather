const weatherDescriptions = {
  0: "Soleil", 1: "Peu nuageux", 2: "Ciel voilé", 3: "Nuageux", 4: "Très nuageux",
  5: "Brouillard", 6: "Brouillard givrant", 7: "Pluie faible", 8: "Pluie modérée",
  9: "Pluie forte", 10: "Pluie faible verglaçante", 11: "Pluie modérée verglaçante",
  12: "Pluie forte verglaçante", 13: "Bruine", 14: "Neige faible", 15: "Neige modérée",
  16: "Neige forte", 20: "Orage", 21: "Grêle", 22: "Neige faible", 30: "Temps ensoleillé",
  31: "Éclaircies (jour)", 32: "Nuageux", 33: "Brume", 34: "Variable"
};

function getWeatherDescription(code) {
  return weatherDescriptions[code] || "Inconnu";
}

function getWindDirection(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
  return directions[Math.round(degrees / 45) % 8];
}

function createWeatherCard(city, forecast, options) {
  const card = document.createElement("div");
  card.className = "weather-card";
  const date = new Date(forecast.datetime);
  let content = `<h3>${city.name} - ${date.toLocaleDateString("fr-FR")}</h3><p>${getWeatherDescription(forecast.weather)}</p>`;
  if (options.showLat) content += `<p>Latitude: ${city.latitude}</p>`;
  if (options.showLon) content += `<p>Longitude: ${city.longitude}</p>`;
  if (options.showRain) content += `<p>Cumul pluie: ${forecast.rr10} mm</p>`;
  if (options.showWind) content += `<p>Vent moyen: ${forecast.wind10m.speed} km/h</p>`;
  if (options.showDir) content += `<p>Direction du vent: ${getWindDirection(forecast.wind10m.direction)}</p>`;
  card.innerHTML = content;
  return card;
}
