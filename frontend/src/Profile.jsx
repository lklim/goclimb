import { useState, useEffect } from "react";
import supabase from "./supabaseClient";
import "./Profile.css";
import Navbar from "./components/Navbar";
import { useNavigate } from "react-router-dom";

function GetProfile() {
    const [profile, setProfile] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [activities, setActivities] = useState([]);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const {
                data: { user },
                error: userError
            } = await supabase.auth.getUser();

            if (userError || !user) {
                console.error("User not found:", userError);
                return;
            }

            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", user.email)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
            } else {
                setProfile(profileData);
            }

            const { data: postData, error: postError } = await supabase
                .from("posts")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (postError) {
                console.error("Error fetching posts:", postError);
            } else {
                setPosts(postData);
            }

            const { data: achievementData, error: achievementError } = await supabase
                .from("user_achievement")
                .select(`
                    id,
                    created_at,
                    achievements (
                        id,
                        achievement_name,
                        description,
                        achievement_picture
                    )
                `)
                .eq("user_id", user.id);

            if (achievementError) {
                console.error("Error fetching achievements:", achievementError);
            } else {
                setAchievements(achievementData);
            }

            const { data: activitiesData, error: activitiesError } = await supabase
                .from("user_activities")
                .select(`
                    id,
                    created_at,
                    activities (
                        id,
                        activity_name,
                        activity_description
                    )
                `)
                .eq("user_id", user.id);

            if (activitiesError) {
                console.error("Error fetching achievements:", activitiesError);
            } else {
                setActivities(activitiesData);
            }
        };

        fetchProfile();
    }, []);

    if (!profile) {
        return (
            <div className="profile-page">
                <Navbar />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <Navbar />
            <h2>My Profile</h2>
            <div className="profile-card">
                {profile.profile_picture ? (
                    <img src={profile.profile_picture} alt="Profile" className="profile-pic" />
                ) : (
                    <div className="profile-pic" style={{ backgroundColor: "#ccc", lineHeight: "120px" }}>
                        No Image
                    </div>
                )}
                <p><strong>Username: </strong> {profile.username || "Not set"}</p>
                <p><strong>Date of Birth:</strong> {profile.date_of_birth || "Not set"}</p>
                <button className="edit-profile-btn" onClick={() => navigate("/editprofile")}>Edit Profile</button>
            </div>

            <div className="achievement-section">
                <h3>My Achievements</h3>
                {achievements.length > 0 ? (
                    achievements.map(({ id, achievements: ach, created_at }) => (
                        <div key={id} className="achievement-card">
                            {ach.achievement_picture ? (
                                <img src={ach.achievement_picture} alt={ach.achievement_name} className="achievement-image" />
                            ) : (
                                <div className="achievement-image" style={{ backgroundColor: "#999", lineHeight: "80px" }}>
                                    No Image
                                </div>
                            )}
                            <div className="achievement-info">
                                <h4>{ach.achievement_name}</h4>
                                <p>{ach.description}</p>
                                <small>Earned on: {new Date(created_at).toLocaleDateString()}</small>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No achievements yet.</p>
                )}
            </div>

            <div className="achievement-section">
                <h3>My Activities</h3>
                {activities.length > 0 ? (
                    activities.map(({ id, activities: act, created_at }) => (
                        <div key={id} className="achievement-card">
                            <div className="achievement-info">
                                <h4>{act.activity_name}</h4>
                                <p>{act.activity_description}</p>
                                <small>Participated on: {new Date(created_at).toLocaleDateString()}</small>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No activities yet.</p>
                )}
            </div>


            <h3>My Posts</h3>
            {posts.map((post) => (
                <div key={post.id} className="post">
                    <img src={post.image_url} alt="Post" className="post-image" />
                    <div className="caption-box">
                        <p className="caption">{post.caption}</p>
                    </div>
                    <div className="actions">
                        <button className="like-button">Like ({post.likes})</button>
                        <button className="delete-button">Delete</button>
                    </div>
                    <div className="comments-section">
                        <h4>Comments</h4>
                        {post.comments ? (
                            post.comments.split(",").map((c, i) => (
                                <p key={i} className="comment">{c}</p>
                            ))
                        ) : (
                            <p className="comment">No comments yet.</p>
                        )}
                        <div className="comment-input-group">
                            <input type="text" placeholder="Add a comment..." />
                            <button>Post</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default GetProfile;
