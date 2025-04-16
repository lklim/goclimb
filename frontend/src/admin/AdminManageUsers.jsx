import { useEffect, useState } from "react";
import supabase from "../supabaseClient";
import Navbar from "../components/Navbar";
import AdminSidebar from "./AdminSidebar";
import "./AdminManageUsers.css";

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [editingUsernames, setEditingUsernames] = useState({}); // Track username edits

    useEffect(() => {
        const fetchUsers = async () => {
            const { data, error } = await supabase.from("profiles").select("*");
            if (!error) {
                setUsers(data);
                // initialize editing values
                const initial = {};
                data.forEach(user => {
                    initial[user.id] = user.username;
                });
                setEditingUsernames(initial);
            }
        };
        fetchUsers();
    }, []);

    const updateUserRole = async (id, newRole) => {
        await supabase.from("profiles").update({ account_type: newRole }).eq("id", id);
        setUsers(prev =>
            prev.map(u => (u.id === id ? { ...u, account_type: newRole } : u))
        );
        setOpenDropdown(null);
    };

    const updateUsername = async (id) => {
        const newUsername = editingUsernames[id];
        await supabase.from("profiles").update({ username: newUsername }).eq("id", id);
        setUsers(prev =>
            prev.map(u => (u.id === id ? { ...u, username: newUsername } : u))
        );
    };

    const deleteUser = async (id) => {
        try {
            await supabase.auth.admin.deleteUser(id); // remove from auth
            await supabase.from("profiles").delete().eq("id", id); // remove from table
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error("Error deleting user:", err.message);
        }
    };

    const getRoleLabel = (type) => {
        if (type === 2) return "Admin";
        if (type === 1) return "Premium";
        return "User";
    };

    return (
        <div className="admin-wrapper">
            <Navbar />
            <div className="admin-layout">
                <AdminSidebar />
                <div className="admin-content">
                    <h1>Manage Users</h1>

                    {users.map((user) => (
                        <div className="user-card" key={user.id}>
                        <img src="/default-avatar.png" alt="avatar" className="avatar" />
                      
                        <div className="user-info">
                          <div className="user-info-pair">
                            <label>Email:</label>
                            <p>{user.email}</p>
                          </div>
                      
                          <div className="username-block">
                            <div className="user-info-pair">
                              <label>Username:</label>
                              <input
                                type="text"
                                value={editingUsernames[user.id]}
                                onChange={(e) =>
                                  setEditingUsernames(prev => ({
                                    ...prev,
                                    [user.id]: e.target.value
                                  }))
                                }
                              />
                            </div>
                            <div className="save-wrapper">
                              <button className="save-btn" onClick={() => updateUsername(user.id)}>
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      
                        <div className="dropdown-wrapper">
                          <div className="dropdown-group">
                            <label className="dropdown-label">Account Type:</label>
                            <button
                              className="acctype-btn"
                              onClick={() =>
                                setOpenDropdown(openDropdown === user.id ? null : user.id)
                              }
                            >
                              {getRoleLabel(user.account_type)} ▾
                            </button>
                      
                            {openDropdown === user.id && (
                              <div className="dropdown-menu">
                                <button onClick={() => updateUserRole(user.id, 0)}>User</button>
                                <button onClick={() => updateUserRole(user.id, 1)}>Premium</button>
                                <button onClick={() => updateUserRole(user.id, 2)}>Admin</button>
                              </div>
                            )}
                          </div>
                      
                          <button className="delete-btn" onClick={() => deleteUser(user.id)}>
                            Delete Account
                          </button>
                        </div>
                      </div>
                      
                    ))}
                </div>
            </div>
        </div>
    );
}

export default ManageUsers;
