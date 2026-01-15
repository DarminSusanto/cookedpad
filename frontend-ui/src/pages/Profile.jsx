// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Profile() {
  const { user, token, updateUser, logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    bio: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  // API URLs
  const API_URL = process.env.REACT_APP_API_USERS || 'http://localhost:3002';
  const RECIPE_API = process.env.REACT_APP_API_RECIPES || 'http://localhost:3003';

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        bio: user.bio || ''
      });
      fetchUserRecipes();
    }
  }, [user]);

  // Fetch user's recipes
  const fetchUserRecipes = async () => {
    try {
      const response = await axios.get(`${RECIPE_API}/recipes`);
      const userRecipes = response.data.recipes.filter(
        recipe => recipe.author._id === user.id
      );
      setRecipes(userRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.put(`${API_URL}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setMessage('Profil berhasil diperbarui!');
      }
    } catch (error) {
      setMessage('Gagal memperbarui profil: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Convert file to Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle profile picture upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploadMessage('Mengupload gambar...');
    
    try {
      const imageBase64 = await convertToBase64(selectedFile);
      
      const response = await axios.put(`${API_URL}/profile/picture`, 
        { profilePicture: imageBase64 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        updateUser(response.data.user);
        setUploadMessage('Foto profil berhasil diperbarui!');
        setSelectedFile(null);
      }
    } catch (error) {
      setUploadMessage('Upload gagal: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">Profil Saya</h1>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Left Column - Profile Info */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <img 
                src={user.profilePicture || 'https://via.placeholder.com/150'} 
                alt="Profile" 
                style={{ 
                  width: '150px', 
                  height: '150px', 
                  borderRadius: '50%', 
                  objectFit: 'cover',
                  marginBottom: '15px' 
                }} 
              />
              <h2>{user.fullName}</h2>
              <p className="muted">@{user.username}</p>
              <p style={{ marginTop: '10px' }}>{user.bio || 'Tidak ada bio'}</p>
            </div>
          </div>

          {/* My Recipes */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Resep Saya</h3>
            {recipes.length === 0 ? (
              <div style={{ textAlign: 'center' }}>
                <p className="muted">Belum ada resep</p>
                <Link to="/create-recipe" className="btn btn-primary" style={{ marginTop: '10px' }}>
                  Buat Resep Pertama
                </Link>
              </div>
            ) : (
              <div>
                {recipes.slice(0, 5).map(recipe => (
                  <div key={recipe._id} style={{ 
                    padding: '10px', 
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {recipe.images && recipe.images.length > 0 && (
                      <img 
                        src={recipe.images[0]} 
                        alt={recipe.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <Link to={`/recipe/${recipe._id}`} style={{ textDecoration: 'none', color: '#333' }}>
                        <strong>{recipe.title}</strong>
                      </Link>
                      <p className="muted" style={{ fontSize: '12px' }}>
                        {new Date(recipe.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recipes.length > 5 && (
                  <Link to="/recipes" style={{ display: 'block', textAlign: 'center', marginTop: '10px' }}>
                    Lihat semua resep ({recipes.length})
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Forms */}
        <div style={{ flex: '2', minWidth: '300px' }}>
          {/* Edit Profile Form */}
          <form onSubmit={handleSubmit} className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Edit Profil</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Nama Lengkap</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="form-control"
                rows="3"
                placeholder="Ceritakan tentang diri Anda..."
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            
            {message && <p className="muted" style={{ marginTop: '10px' }}>{message}</p>}
          </form>

          {/* Upload Profile Picture */}
          <form onSubmit={handleUploadSubmit} className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Ubah Foto Profil</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ width: '100%' }}
              />
              {selectedFile && (
                <div style={{ marginTop: '10px' }}>
                  <p>Preview:</p>
                  <img 
                    src={URL.createObjectURL(selectedFile)} 
                    alt="Preview" 
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginTop: '5px'
                    }} 
                  />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-outline" 
              disabled={!selectedFile || loading}
              style={{ marginRight: '10px' }}
            >
              Upload Gambar
            </button>
            
            {uploadMessage && <p className="muted" style={{ marginTop: '10px' }}>{uploadMessage}</p>}
          </form>

          {/* Logout Button */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>Akun</h3>
            <button onClick={logout} className="btn btn-secondary">
              Keluar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;