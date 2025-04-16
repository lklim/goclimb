import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import supabase from "./supabaseClient";
import "./Search.css";
import Navbar from "./components/Navbar";

function CragSearch() {
    const [crags, setCrags] = useState([]);
    const [filteredCrags, setFilteredCrags] = useState([]);
    const [query, setQuery] = useState("");
    const [address, setAddress] = useState("");
    const [country, setCountry] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [rating, setRating] = useState("");
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");

    useEffect(() => {
        const fetchCrags = async () => {
            const { data, error } = await supabase.from("crags").select("*");
            if (error) console.error("Error fetching crags:", error);
            else {
                setCrags(data);
                setFilteredCrags(data); // Show all locations by default
            }
        };
        fetchCrags();
    }, []);

    const handleSearch = () => {
        let results = crags;

        // Filter by name
        if (query) {
            results = results.filter(crag => 
                crag.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        // Filter by difficulty
        if (difficulty) {
            results = results.filter(crag => crag.difficulty === difficulty);
        }

        // Filter by rating
        if (rating) {
            results = results.filter(crag => crag.user_rating >= parseFloat(rating));
        }

        // Filter by longitude
        if (longitude) {
            results = results.filter(crag => crag.longitude === parseFloat(longitude));
        }

        // Filter by latitude
        if (latitude) {
            results = results.filter(crag => crag.latitude === parseFloat(latitude));
        }

        // Filter by address
        if (address) {
            results = results.filter(crag => 
                crag.address.toLowerCase().includes(address.toLowerCase())
            );
        }

        // Filter by country
        if (country) {
            results = results.filter(crag => 
                crag.country.toLowerCase().includes(country.toLowerCase())
            );
        }

        setFilteredCrags(results);
    };

    return (
        <div className="search-page">
            <Navbar />
            <div className="search-content">
                <input 
                    type="text" 
                    placeholder="Search Crags" 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                />
                <select onChange={(e) => setDifficulty(e.target.value)}>
                    <option value="">All Difficulties</option>
                    <option value="Beginner To Intermediate">Beginner To Intermediate</option>
                    <option value="Intermediate to Advanced">Intermediate to Advanced</option>
                </select>
                <input 
                    type="number" 
                    placeholder="Minimum Rating" 
                    step="0.1" 
                    value={rating} 
                    onChange={(e) => setRating(e.target.value)} 
                />
                <input 
                    type="number" 
                    placeholder="Longitude" 
                    step="any" 
                    value={longitude} 
                    onChange={(e) => setLongitude(e.target.value)} 
                />
                <input 
                    type="number" 
                    placeholder="Latitude" 
                    step="any" 
                    value={latitude} 
                    onChange={(e) => setLatitude(e.target.value)} 
                />
                <input 
                    type="text" 
                    placeholder="Search Address" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)} 
                />
                <input 
                    type="text" 
                    placeholder="Search Country" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)} 
                />
                <button onClick={handleSearch}>Search</button>
            </div>
    
            {/* List filtered crags */}
            <div className="search-page">
                <h2>Filtered Crags</h2>
                <ul>
                    {filteredCrags.map((crag) => (
                        <li key={crag.id}>
                            <strong>{crag.name}</strong> - {crag.description} (Difficulty: {crag.difficulty}, Rating: {crag.user_rating})
                            <p>Address: {crag.address}</p>
                            <p>Country: {crag.country}</p>
                            <p>Location: Longitude: {crag.longitude}, Latitude: {crag.latitude}</p>
                            {/* Link to Map.jsx with crag data */}
                            <Link to={`/map/${crag.id}`} className="view-details-link">
                                View Details
                            </Link>
                        </li>
                    ))}
                </ul>
                {filteredCrags.length === 0 && <p>No crags match your search criteria.</p>}
            </div>
        </div>
    );
}

export default CragSearch;
