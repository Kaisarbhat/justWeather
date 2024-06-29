import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './WeatherApp.css';

function WeatherApp() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = 'f52d204c2a0c987ccb5051b947096138';

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherAndForecast(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          setError("Unable to retrieve your location. Please enter a city manually.");
        }
      );
    } else {
      setError("Geolocation is not supported by your browser. Please enter a city manually.");
    }
  };

  const fetchWeatherAndForecast = async (lat, lon) => {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  
    try {
      setLoading(true);
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl)
      ]);
      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
      setError(null);
    } catch (err) {
      console.error('Detailed error:', err);
      setError(`Failed to fetch weather data: ${err.message}`);
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = async (e) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${API_KEY}`);
        setSuggestions(response.data);
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (lat, lon, name) => {
    setLocation(name);
    setSuggestions([]);
    fetchWeatherAndForecast(lat, lon);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim() && suggestions.length > 0) {
      const { lat, lon } = suggestions[0];
      fetchWeatherAndForecast(lat, lon);
    }
  };

  return (
    <div className="weather-app">
      <div className="container">
        <h1>Weather Forecast</h1>
        <form onSubmit={handleSubmit}>
          <div className="search-container">
            <input
              type="text"
              value={location}
              onChange={handleLocationChange}
              placeholder="Enter city name"
            />
            <ul className="suggestions">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion.lat, suggestion.lon, suggestion.name)}>
                  {suggestion.name}, {suggestion.country}
                </li>
              ))}
            </ul>
          </div>
          <button type="submit">Get Weather</button>
        </form>
        <button onClick={getUserLocation} className="location-btn">Use My Location</button>
        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}
        {weather && (
          <div className="weather-card">
            <h2>{weather.name}</h2>
            <div className="weather-info">
              <p className="temperature">{Math.round(weather.main.temp)}°C</p>
              <p className="description">{weather.weather[0].description}</p>
            </div>
            <div className="weather-details">
              <p>Feels like: {Math.round(weather.main.feels_like)}°C</p>
              <p>Humidity: {weather.main.humidity}%</p>
              <p>Wind: {weather.wind.speed} m/s</p>
            </div>
          </div>
        )}
      {forecast && (
  <div className="forecast">
    <h3>5-Day Forecast</h3>
    <div className="forecast-list">
      {forecast.list.filter((item, index) => index % 8 === 0).map((item, index) => (
        <div key={index} className="forecast-item">
          <p>{new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</p>
          <p>{Math.round(item.main.temp)}°C</p>
          <img 
            src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`} 
            alt={item.weather[0].description} 
          />
        </div>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  );
}

export default WeatherApp;