import { BrowserRouter, Routes, Route, Navigate } from "react-router/dom";
import { useEffect, useState } from "react";
import supabase from "./supabaseClient";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import Map from "./Map";
import Search from "./Search";
import AdminHome from "./admin/AdminHome";
import AdminManageUser from "./admin/AdminManageUsers";
import AdminManageEvent from "./admin/AdminManageEvents";
import Profile from "./Profile";
import EditProfile from "./editProfile";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };

        fetchUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => authListener.subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={user ? <Navigate to="/home" replace /> : <Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/home" element={user ? <Home /> : <Navigate to="/" replace />} />
                <Route path="/map" element={user ? <Map /> : <Navigate to="/" replace />} />
                <Route path="/map/:cragId" element={user ? <Map /> : <Navigate to="/" replace />} />
                <Route path="/search" element={user ? <Search /> : <Navigate to="/" replace />} />
                <Route path="/profile" element={user ? <Profile /> : <Navigate to="/" replace/>} />
                <Route path="/editprofile" element={user ? <EditProfile /> : <Navigate to="/" replace />} />
                <Route path="/admin" element={<AdminHome />} />
                <Route path="/admin/users" element={<AdminManageUser />} />
                {/* <Route path="/admin/events" element={<AdminManageEvent />} /> */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
