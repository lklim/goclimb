import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminHome.css"; // Layout styles for content positioning

function AdminHome() {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdmin = async () => {
            const {
                data: { user },
                error: authError
            } = await supabase.auth.getUser();

            if (authError || !user) {
                navigate("/"); // Not logged in
                return;
            }

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("account_type")
                .eq("id", user.id)
                .single();

            if (error || !profile || profile.account_type !== 2) {
                navigate("/"); // Not an admin
            } else {
                setIsAdmin(true);
            }

            setLoading(false);
        };

        checkAdmin();
    }, []);

    if (loading) return <p>Loading...</p>;

    return isAdmin ? (
        <div className="admin-home-wrapper">
            <Navbar />
            <div className="admin-main-body">
                <AdminSidebar />
                <main className="admin-home-content">
                    <h1>Admin Dashboard</h1>
                    <p>Only admins can see this page.</p>
                </main>
            </div>
        </div>
    ) : null;
    
}

export default AdminHome;
