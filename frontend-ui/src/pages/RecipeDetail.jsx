// src/pages/RecipeDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function RecipeDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [showVideo, setShowVideo] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('bahan');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);

  const API_URL = process.env.REACT_APP_API_RECIPES || 'http://localhost:3003';
  const COMMENT_API = process.env.REACT_APP_API_COMMENTS || 'http://localhost:3004';

  useEffect(() => {
    fetchRecipe();
    fetchComments();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`${API_URL}/recipes/${id}`);
      if (response.data.success) {
        const recipeData = response.data.recipe;
        setRecipe(recipeData);
        setLikeCount(recipeData.likes?.length || 0);
        setSaveCount(recipeData.saves?.length || 0);
        
        if (user && recipeData.likes) {
          setIsLiked(recipeData.likes.some(like => like._id === user.id));
        }
        if (user && recipeData.saves) {
          setIsSaved(recipeData.saves.some(save => save._id === user.id));
        }
      }
    } catch (error) {
      setError('Resep tidak ditemukan');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${COMMENT_API}/recipes/${id}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('Silakan login untuk menyukai resep');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/recipes/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsLiked(!isLiked);
        setLikeCount(response.data.likes);
      }
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert('Silakan login untuk menyimpan resep');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/recipes/${id}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIsSaved(!isSaved);
        setSaveCount(response.data.saves);
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
    }
  };

  // Fungsi untuk extract YouTube ID dari URL
  const getYouTubeId = (url) => {
    if (!url) return null;
    
    // Handle berbagai format YouTube URL
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Fungsi untuk format YouTube URL untuk embed
  const getYouTubeEmbedUrl = (url) => {
    const videoId = getYouTubeId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Silakan login untuk berkomentar');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`${COMMENT_API}/recipes/${id}/comments`, {
        content: newComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setComments([response.data.comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Memuat resep...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h3>{error || 'Resep tidak ditemukan'}</h3>
        <Link to="/recipes" className="btn btn-primary" style={{ marginTop: '20px' }}>
          Kembali ke Daftar Resep
        </Link>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      {/* Recipe Header */}
      <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <span style={{ 
              background: '#ff6b6b', 
              color: 'white',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              display: 'inline-block',
              marginBottom: '15px'
            }}>
              {recipe.category}
            </span>
            
            <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>{recipe.title}</h1>
            
            <p className="muted" style={{ fontSize: '16px', marginBottom: '20px' }}>
              {recipe.description}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src={recipe.author.profilePicture || 'https://via.placeholder.com/40'} 
                  alt={recipe.author.fullName}
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }} 
                />
                <div>
                  <Link 
                    to={`/profile/${recipe.author._id}`}
                    style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontWeight: '500'
                    }}
                  >
                    {recipe.author.fullName}
                  </Link>
                  <p className="muted" style={{ fontSize: '12px' }}>
                    {new Date(recipe.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleLike}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {isLiked ? '❤️' : '🤍'} {likeCount}
            </button>
            <button 
              onClick={handleSave}
              className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              {isSaved ? '⭐' : '☆'} {saveCount}
            </button>
            {user && user._id === recipe.author._id && (
              <Link 
                to={`/edit-recipe/${id}`}
                className="btn btn-primary"
              >
                ✏️ Edit Resep
              </Link>
            )}
          </div>
        </div>

        {/* Recipe Info Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px',
          marginTop: '30px'
        }}>
          <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
            <div className="muted">Waktu Prep</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
              {recipe.prepTime} menit
            </div>
          </div>
          <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
            <div className="muted">Waktu Masak</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
              {recipe.cookTime} menit
            </div>
          </div>
          <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
            <div className="muted">Porsi</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
              {recipe.servings} orang
            </div>
          </div>
          <div className="card" style={{ padding: '15px', textAlign: 'center' }}>
            <div className="muted">Tingkat Kesulitan</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
              {recipe.difficulty}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Left Column - Recipe Content */}
        <div style={{ flex: '2', minWidth: '300px' }}>
          {/* Tabs */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #eee' }}>
              <button
                onClick={() => setActiveTab('bahan')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'bahan' ? '#ff6b6b' : 'transparent',
                  color: activeTab === 'bahan' ? 'white' : '#666',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'bahan' ? '2px solid #ff6b6b' : 'none'
                }}
              >
                Bahan-bahan
              </button>
              <button
                onClick={() => setActiveTab('langkah')}
                style={{
                  padding: '10px 20px',
                  background: activeTab === 'langkah' ? '#ff6b6b' : 'transparent',
                  color: activeTab === 'langkah' ? 'white' : '#666',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: activeTab === 'langkah' ? '2px solid #ff6b6b' : 'none'
                }}
              >
                Langkah Pembuatan
              </button>
            </div>

            {/* Tab Content */}
            <div className="card" style={{ padding: '30px' }}>
              {activeTab === 'bahan' && (
                <div>
                  <h3 style={{ marginBottom: '20px' }}>Bahan-bahan</h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index} style={{ 
                        padding: '10px 0',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>{ingredient.name}</span>
                        <span style={{ color: '#666' }}>
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === 'langkah' && (
                <div>
                  <h3 style={{ marginBottom: '20px' }}>Langkah Pembuatan</h3>
                  <div>
                    {recipe.instructions.map((step, index) => (
                      <div key={index} style={{ 
                        marginBottom: '30px',
                        display: 'flex',
                        gap: '20px'
                      }}>
                        <div style={{ 
                          width: '40px',
                          height: '40px',
                          background: '#ff6b6b',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontWeight: 'bold'
                        }}>
                          {step.step}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ marginBottom: '10px' }}>{step.description}</p>
                          {step.image && (
                            <img 
                              src={step.image} 
                              alt={`Langkah ${step.step}`}
                              style={{ 
                                maxWidth: '100%',
                                borderRadius: '8px',
                                marginTop: '10px'
                              }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {recipe.youtubeUrl && (
            <div className="card" style={{ padding: '30px', marginTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>🎬 Video Resep</h3>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => setShowVideo(!showVideo)}
                    className="btn btn-outline"
                  >
                    {showVideo ? 'Sembunyikan Video' : 'Tampilkan Video'}
                  </button>
                  {showVideo && (
                    <button 
                      onClick={() => setShowVideoModal(true)}
                      className="btn btn-outline"
                      title="Buka video dalam fullscreen"
                    >
                      ⛶ Fullscreen
                    </button>
                  )}
                </div>
              </div>
              
              {showVideo ? (
                <div>
                  <div style={{ 
                    position: 'relative', 
                    paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
                    height: 0, 
                    overflow: 'hidden',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}>
                    <iframe
                      src={getYouTubeEmbedUrl(recipe.youtubeUrl)}
                      title="Video resep"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <a 
                      href={recipe.youtubeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline"
                      style={{ marginTop: '10px' }}
                    >
                      <span style={{ marginRight: '8px' }}>▶️</span>
                      Buka di YouTube
                    </a>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setShowVideo(true)}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    padding: '40px 20px',
                    background: '#f8f9fa',
                    borderRadius: '8px',
                    border: '2px dashed #ddd'
                  }}
                >
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                    ▶️
                  </div>
                  <h4 style={{ marginBottom: '10px' }}>Tonton Video Resep</h4>
                  <p className="muted" style={{ marginBottom: '20px' }}>
                    Klik untuk menonton video tutorial resep ini
                  </p>
                  <button className="btn btn-primary">
                    Putar Video
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="card" style={{ padding: '30px', marginTop: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Komentar ({comments.length})</h3>
            
            {/* Add Comment Form */}
            {user ? (
              <form onSubmit={handleCommentSubmit} style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <img 
                    src={user.profilePicture || 'https://via.placeholder.com/40'} 
                    alt={user.fullName}
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%',
                      objectFit: 'cover',
                      flexShrink: 0
                    }} 
                  />
                  <div style={{ flex: 1 }}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Tulis komentar Anda..."
                      className="form-control"
                      rows="3"
                      style={{ marginBottom: '10px' }}
                    />
                    <button type="submit" className="btn btn-primary">
                      Kirim Komentar
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '15px', 
                borderRadius: '4px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                <p>Silakan <Link to="/login">login</Link> untuk menambahkan komentar</p>
              </div>
            )}

            {/* Comments List */}
            <div>
              {comments.length === 0 ? (
                <p className="muted" style={{ textAlign: 'center', padding: '20px' }}>
                  Belum ada komentar. Jadilah yang pertama berkomentar!
                </p>
              ) : (
                <div>
                  {comments.map(comment => (
                    <div key={comment._id} style={{ 
                      padding: '20px 0',
                      borderBottom: '1px solid #eee'
                    }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <img 
                          src={comment.author.profilePicture || 'https://via.placeholder.com/40'} 
                          alt={comment.author.fullName}
                          style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '50%',
                            objectFit: 'cover',
                            flexShrink: 0
                          }} 
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: '10px' }}>
                            <strong>{comment.author.fullName}</strong>
                            <span className="muted" style={{ marginLeft: '10px', fontSize: '12px' }}>
                              {new Date(comment.createdAt).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p>{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Recipe Images */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Galeri Resep</h3>
            {recipe.images && recipe.images.length > 0 ? (
              <div style={{ display: 'grid', gap: '10px' }}>
                {recipe.images.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${recipe.title} - ${index + 1}`}
                    style={{ 
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '40px 20px',
                textAlign: 'center',
                borderRadius: '4px'
              }}>
                <p className="muted">Tidak ada gambar</p>
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Tentang Penulis</h3>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={recipe.author.profilePicture || 'https://via.placeholder.com/80'} 
                alt={recipe.author.fullName}
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '10px'
                }} 
              />
              <h4>{recipe.author.fullName}</h4>
              <p className="muted">@{recipe.author.username}</p>
              <Link 
                to={`/profile/${recipe.author._id}`}
                className="btn btn-outline"
                style={{ marginTop: '15px' }}
              >
                Lihat Profil
              </Link>
            </div>
          </div>
        </div>

        {/* Video Modal Fullscreen */}
        {showVideoModal && recipe?.youtubeUrl && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{ width: '100%', maxWidth: '1200px', position: 'relative' }}>
              <button
                onClick={() => setShowVideoModal(false)}
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: 0,
                  background: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
              
              <div style={{ 
                position: 'relative', 
                paddingBottom: '56.25%', 
                height: 0, 
                overflow: 'hidden',
                borderRadius: '8px'
              }}>
                <iframe
                  src={getYouTubeEmbedUrl(recipe.youtubeUrl)}
                  title="Video resep fullscreen"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 0
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecipeDetail;