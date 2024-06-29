import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('London');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = 'f52d204c2a0c987ccb5051b947096138';
  const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

  useEffect(() => {
    fetchWeather();
  }, [city]);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setWeather(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch weather data');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  return (
    <div className="App">
      <h1>Weather App</h1>
      <input
        type="text"
        value={city}
        onChange={handleCityChange}
        placeholder="Enter city name"
      />
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {weather && (
        <div>
          <h2>{weather.name}</h2>
          <p>Temperature: {weather.main.temp}°C</p>
          <p>Description: {weather.weather[0].description}</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
        </div>
      )}
    </div>
  );
}

export default App;
