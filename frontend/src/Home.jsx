import { useEffect, useState } from "react";
import supabase from "./supabaseClient";
import Navbar from "./components/Navbar";
import "./Home.css";

function Home() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newComment, setNewComment] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, comments(*)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data);
      }
    };

    fetchUser();
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    const { error } = await supabase.rpc("increment_likes", { post_id: postId });
    if (error) console.error(error);
    else {
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );
    }
  };

  const handleAddComment = async (postId) => {
    const content = newComment[postId];
    if (!content) return;

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: currentUser.id,
      content
    });

    if (error) console.error(error);
    else {
      setNewComment(prev => ({ ...prev, [postId]: "" }));
      // Refresh only the comments without reloading the entire page
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), { content }] }
          : post
      ));
    }
  };

  const handleDeletePost = async (postId) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) console.error(error);
    else {
      setPosts(prev => prev.filter(post => post.id !== postId));
    }
  };

  return (
    <>
    <Navbar />
    <div className="home-feed">
      
      <h2>Recent Posts</h2>
      {posts.length === 0 && <p>No posts found.</p>}

      <div className="posts-container">
        {posts.map(post => (
          <div key={post.id} className="post">
            <img src={post.image_url} alt="Post" className="post-image" />

            <div className="caption-box">
              <p className="caption">{post.caption}</p>
            </div>

            {/* Like & Delete Buttons Side by Side */}
            <div className="actions">
              <button className="like-button" onClick={() => handleLike(post.id)}>
                Like ♡︎ ({post.likes})
              </button>

              {currentUser?.id === post.user_id && (
                <button className="delete-button" onClick={() => handleDeletePost(post.id)}>
                  Delete Post ⛌
                </button>
              )}
            </div>

            {/* Comments Section */}
            <div className="comments-section">
              <h4>Comments:</h4>
              {(post.comments || []).map((comment, index) => (
                <p key={index} className="comment">{comment.content}</p>
              ))}

              {/* Input and Post Button aligned properly */}
              <div className="comment-input-group">
                <input
                  type="text"
                  placeholder="Add a comment"
                  value={newComment[post.id] || ""}
                  onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                />
                <button onClick={() => handleAddComment(post.id)}>Post ➤</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
}

export default Home;
