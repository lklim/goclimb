import { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import { useNavigate } from "react-router-dom";
import "./editProfile.css";
import Navbar from "./components/Navbar";

function EditProfile() {
    const [fullName, setFullName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const {
                data: { user }
            } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", user.email)
                .single();

            if (data) {
                setFullName(data.full_name || "");
                setDateOfBirth(data.date_of_birth || "");
            }
        };

        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            data: { user }
        } = await supabase.auth.getUser();

        let imageUrl = null;

        if (profilePicture) {
            const fileExt = profilePicture.name.split(".").pop();
            const fileName = `${user.id}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("profile-pictures")
                .upload(filePath, profilePicture, {
                    upsert: true,
                    contentType: profilePicture.type,
                    cacheControl: "3600"
                });

            if (uploadError) {
                console.error("Upload failed:", uploadError.message);
                return;
            }

            const { data: publicUrlData } = supabase.storage
                .from("profile-pictures")
                .getPublicUrl(filePath);

            imageUrl = publicUrlData.publicUrl;
        }

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: fullName,
                date_of_birth: dateOfBirth,
                profile_picture: imageUrl || undefined
            })
            .eq("email", user.email);

        if (!error) {
            navigate("/profile");
        } else {
            console.error("Update failed:", error.message);
        }
    };

    return (
        <div className="edit-profile-page">
            <Navbar />
            <div className="edit-form-container">
                <h2>Edit Profile</h2>
                <form onSubmit={handleSubmit} className="edit-profile-form">
                    <label>
                        Username:
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Date of Birth:
                        <input
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Profile Picture:
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProfilePicture(e.target.files[0])}
                        />
                    </label>
                    <button type="submit">Save Changes</button>
                </form>
            </div>
        </div>
    );
}

export default EditProfile;
