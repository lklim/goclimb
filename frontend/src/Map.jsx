import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import supabase from "./supabaseClient";
import "leaflet/dist/leaflet.css";
import "./Map.css"; 
import Navbar from "./components/Navbar"; 
import { useParams } from "react-router-dom";

const WEATHER_API_KEY = "c2d5fc58f652fc3214d931e830f6d7fa";

// Render star rating as emojis
const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <>
            {"🌟".repeat(fullStars)}
            {halfStar && "⭐"}
            {"☆".repeat(emptyStars)}
            <span> ({rating.toFixed(1)}/5)</span>
        </>
    );
};

function Map() {
    const { cragId } = useParams(); // Get the cragId from URL params
    const [crags, setCrags] = useState([]);
    const [weatherData, setWeatherData] = useState({});
    const [selectedCrag, setSelectedCrag] = useState(null);
    const [currentWeather, setCurrentWeather] = useState(null);

    useEffect(() => {
        const fetchCrags = async () => {
            const { data, error } = await supabase.from("crags").select("*");
            if (error) console.error("Error fetching crags:", error);
            else {
                setCrags(data);
                fetchWeatherForCrags(data);
            }
        };
        fetchCrags();
    }, []);

    const fetchWeatherForCrags = async (crags) => {
        let weatherUpdates = {};
        for (let crag of crags) {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${crag.latitude}&lon=${crag.longitude}&appid=${WEATHER_API_KEY}&units=metric`
                );
                const data = await response.json();
                weatherUpdates[crag.id] = data;
            } catch (error) {
                console.error(`Failed to fetch weather for ${crag.name}:`, error);
            }
        }
        setWeatherData(weatherUpdates);
    };

    useEffect(() => {
        if (cragId) {
            const crag = crags.find(crag => crag.id === parseInt(cragId));
            setSelectedCrag(crag);
        }
    }, [cragId, crags]);

    useEffect(() => {
        if (selectedCrag) {
            fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${selectedCrag.latitude}&lon=${selectedCrag.longitude}&appid=${WEATHER_API_KEY}&units=metric`
            )
            .then((res) => res.json())
            .then((data) => setCurrentWeather(data))
            .catch((err) => console.error("Error fetching current weather:", err));
        }
    }, [selectedCrag]);

    return (
        <div className="map-container">
            <Navbar />

            {/* Wrap sidebar and map in a horizontal layout container */}
            <div className="map-content">
                <div className={`sidebar ${selectedCrag !== null ? "visible" : ""}`}>
                    {selectedCrag ? (
                        <div className="sidebar-content">
                            {selectedCrag.image_url && (
                                <div className="image-container">
                                    <img src={selectedCrag.image_url} alt={selectedCrag.name} className="crag-image" />
                                </div>
                            )}
                            <div className="crag-info-box">
                                <h2>{selectedCrag.name}</h2>
                                <p><strong>Description:</strong> {selectedCrag.description}</p>
                                <p><strong>Difficulty:</strong> {selectedCrag.difficulty}</p>
                                {selectedCrag.user_rating ? (
                                    <p><strong>Rating:</strong> {renderStars(selectedCrag.user_rating)}</p>
                                ) : (
                                    <p><strong>Rating:</strong> No rating yet</p>
                                )}
                                <hr className="divider" />
                                {currentWeather ? (
                                    <div className="weather-info">
                                        <h3>Current Weather</h3>
                                        <p><strong>Condition:</strong> {currentWeather.weather[0].description}</p>
                                        <p><strong>Temperature:</strong> {currentWeather.main.temp}°C</p>
                                        <p><strong>Wind Speed:</strong> {currentWeather.wind.speed} m/s</p>
                                    </div>
                                ) : (
                                    <p>Loading weather...</p>
                                )}
                                <div className="button-container">
                                    {selectedCrag.ar_url && (
                                        <a href={selectedCrag.ar_url} target="_blank" rel="noopener noreferrer" className="ar-button">
                                            View AR
                                        </a>
                                    )}
                                    <button className="close-button" onClick={() => setSelectedCrag(null)}>Close ⛌</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="sidebar-placeholder">
                            <p>Select a crag to view details.</p>
                        </div>
                    )}
                </div>

                {/* The map itself */}
                <MapContainer center={[1.3521, 103.8198]} zoom={12} className="map">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {crags.map((crag) => (
                        <Marker 
                            key={crag.id} 
                            position={[crag.latitude, crag.longitude]}
                            eventHandlers={{
                                click: () => {
                                    setSelectedCrag(crag); // Show the sidebar when a marker is clicked
                                }
                            }}
                        >
                            <Tooltip>{crag.name}</Tooltip>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}

export default Map;
