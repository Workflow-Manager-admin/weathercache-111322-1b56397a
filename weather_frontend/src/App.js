import React, { useState } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * Main App component for weather search and display.
 * Allows city name search, fetches data from backend, and displays
 * current weather, forecast, and air quality (if available).
 */
function App() {
  // State variables
  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handles search form submission
  // PUBLIC_INTERFACE
  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setWeather(null);
    setForecast(null);
    setAirQuality(null);
    setError(null);
    setLoading(true);
    try {
      // Fetch current weather
      const weatherResp = await fetch(
        `/weather?city=${encodeURIComponent(query.trim())}`
      );
      if (!weatherResp.ok) throw new Error("Weather not found");
      const weatherData = await weatherResp.json();
      setWeather(weatherData);

      // Forecast is optional, ignore errors
      fetch(`/forecast?city=${encodeURIComponent(query.trim())}`)
        .then((resp) => resp.ok ? resp.json() : null)
        .then(setForecast)
        .catch(() => setForecast(null));

      // Air quality is optional, ignore errors
      fetch(`/airquality?city=${encodeURIComponent(query.trim())}`)
        .then((resp) => resp.ok ? resp.json() : null)
        .then(setAirQuality)
        .catch(() => setAirQuality(null));
    } catch (err) {
      setError("Could not find weather data for this city.");
    } finally {
      setLoading(false);
    }
  }

  // Helper to pretty-format temperature
  function formatTemp(temp) {
    if (typeof temp !== "number") return "-";
    return `${Math.round(temp)}°C`;
  }

  // Helper for minimal forecast display
  function getSimpleForecast() {
    if (!forecast || !forecast.daily || forecast.daily.length === 0) return null;
    const showN = Math.min(3, forecast.daily.length); // Limit to 3 days
    return forecast.daily.slice(0, showN).map((day, idx) => (
      <div key={idx} className="forecast-day">
        <div>{day.date || day.dt_txt}</div>
        <div>{formatTemp(day.temp?.day || day.temp || day.main?.temp)}</div>
        <div>{day.weather && day.weather[0] && day.weather[0].description}</div>
      </div>
    ));
  }

  // Helper for minimal air quality display
  function getAirQuality() {
    if (!airQuality || !airQuality.aqi) return null;
    let level = "Unknown";
    if (airQuality.aqi <= 50) level = "Good";
    else if (airQuality.aqi <= 100) level = "Moderate";
    else if (airQuality.aqi <= 150) level = "Unhealthy for Sensitive Groups";
    else if (airQuality.aqi <= 200) level = "Unhealthy";
    else if (airQuality.aqi <= 300) level = "Very Unhealthy";
    else level = "Hazardous";
    return (
      <div className="airquality">
        <strong>Air Quality Index:</strong> {airQuality.aqi} ({level})
      </div>
    );
  }

  return (
    <div className="App" style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <header className="minimal-header" style={{
        padding: "2rem 0 1rem 0",
        marginBottom: "2rem",
        background: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
      }}>
        <h1 style={{
          fontWeight: 700, fontSize: "2rem", margin: 0, color: "var(--text-primary)"
        }}>
          Weather Now
        </h1>
        <form
          className="weather-search-bar"
          onSubmit={handleSearch}
          style={{
            maxWidth: 420,
            margin: "1.5rem auto 0 auto",
            display: "flex",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 1px 4px 0 #e9ecef",
            border: "1px solid var(--border-color)"
          }}
        >
          <input
            className="search-input"
            type="text"
            placeholder="Enter city name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              outline: "none",
              borderRadius: "8px 0 0 8px",
              fontSize: "1rem",
              background: "transparent",
              color: "var(--text-primary)"
            }}
            aria-label="Search city"
          />
          <button
            className="search-btn"
            type="submit"
            style={{
              background: "var(--button-bg)",
              color: "var(--button-text)",
              border: "none",
              borderRadius: "0 8px 8px 0",
              padding: "0 20px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            disabled={loading}
            aria-label="Fetch weather data"
          >
            {loading ? "..." : "Search"}
          </button>
        </form>
        <p style={{ color: "var(--text-secondary)", margin: "1rem 0 0 0", fontSize: "0.95rem" }}>
          Type your city and get instant weather info.
        </p>
      </header>
      <main style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        maxWidth: 900,
        margin: "0 auto",
        gap: "2rem",
        padding: "0 1rem"
      }}>
        {/* Main weather result/info */}
        <section
          className="main-weather-card"
          style={{
            flex: 2,
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            boxShadow: "0 2px 8px 0 #e9ecef",
            padding: "2rem",
            minHeight: 220,
            marginBottom: "2rem",
            border: "1px solid var(--border-color)"
          }}
        >
          {error && (
            <div style={{ color: "#d32f2f", margin: "1rem 0" }}>
              {error}
            </div>
          )}
          {/* No weather yet and not loading */}
          {!weather && !loading && (
            <div style={{ color: "var(--text-secondary)", fontSize: "1.1rem", opacity: 0.6 }}>
              Search for a city to see weather information.
            </div>
          )}
          {/* Weather display */}
          {weather && (
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 600 }}>
                {weather.name || weather.city}, {weather.sys?.country || ""}
              </div>
              <div style={{ fontSize: "4rem", fontWeight: 700, margin: "0.7rem 0" }}>
                {formatTemp(weather.main?.temp || weather.temp)}
              </div>
              <div style={{ fontSize: "1.4rem", color: "var(--text-secondary)" }}>
                {(weather.weather && weather.weather[0]?.main) || ""}
                <span style={{ fontSize: "1rem", marginLeft: 12, color: "#718096" }}>
                  {weather.weather && weather.weather[0]?.description}
                </span>
              </div>
              <div style={{
                display: "flex",
                gap: "2rem",
                marginTop: "1.3rem",
                justifyContent: "center"
              }}>
                <div>
                  <span style={{ fontWeight: 500 }}>Humidity: </span>
                  {weather.main?.humidity || weather.humidity}%
                </div>
                <div>
                  <span style={{ fontWeight: 500 }}>Wind: </span>
                  {weather.wind?.speed || weather.wind_speed} m/s
                </div>
              </div>
            </div>
          )}
        </section>
        {/* Sidebar for forecast and air quality (optional) */}
        <aside
          className="sidebar"
          style={{
            flex: 1,
            minWidth: 240,
            padding: "2rem 1rem 1.5rem 1rem",
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            boxShadow: "0 1px 6px 0 #ededed"
          }}
        >
          {forecast && (
            <div>
              <div style={{
                fontWeight: 600,
                fontSize: "1.1rem",
                marginBottom: "0.7rem"
              }}>
                Forecast
              </div>
              <div>
                {getSimpleForecast()}
              </div>
            </div>
          )}
          {airQuality && (
            <div style={{ marginTop: "1.6rem" }}>
              <div style={{
                fontWeight: 600,
                fontSize: "1.1rem",
                marginBottom: "0.5rem"
              }}>
                Air Quality
              </div>
              {getAirQuality()}
            </div>
          )}
          {!forecast && !airQuality && (
            <div style={{ color: "var(--text-secondary)", opacity: 0.6, fontSize: "0.98rem" }}>
              You’ll see forecast & air quality info here.
            </div>
          )}
        </aside>
      </main>
      <footer style={{
        textAlign: "center",
        fontSize: "0.9rem",
        color: "var(--text-secondary)",
        padding: "1rem 0",
        marginTop: "3rem"
      }}>
        <span>Powered by your weather backend &nbsp;|&nbsp; {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}

export default App;
