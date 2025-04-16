import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import "./Navbar.css"; 
import logo from "../assets/goclimblogo_woBG.png";

const Navbar = () => {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState(null); // Track role

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("account_type")
                    .eq("id", user.id)
                    .single();

                if (!error && profile) {
                    setAccountType(profile.account_type);
                }
            }
        };

        fetchUserRole();
    }, []);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout failed:", error.message);
            return;
        }
        navigate("/", { replace: true });
        window.location.reload();
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <img src={logo} alt="GoClimb Logo" className="navbar-logo" />
                <h1>GoClimb</h1>
            </div>

            <div className="navbar-right">
                <a href="/home">Home</a>
                <a href="/map">Map</a>
                <a href="/search">Search</a>
                <a href="/profile">Profile</a>

                {/* Conditionally show Admin tab */}
                {accountType === 2 && <a href="/admin">Admin</a>}

                <button className="logout-button" onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
