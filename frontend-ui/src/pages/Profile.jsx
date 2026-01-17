// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function Profile() {
  const { user, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploadMessage, setUploadMessage] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'password', 'settings'

  // API URLs
  const API_URL = process.env.REACT_APP_API_USERS || 'http://localhost:3002';
  const RECIPE_API = process.env.REACT_APP_API_RECIPES || 'http://localhost:3003';

  // Fungsi logout dengan konfirmasi
  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/'); // Redirect ke home setelah logout
    }
  };

  // Initialize form with user data
  useEffect(() => {
  console.log('Profile page loaded');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length);
  
  // Debug: cek token di localStorage
  const localToken = localStorage.getItem('token');
  console.log('LocalStorage token:', localToken?.substring(0, 20) + '...');
  
  if (!token) {
    console.warn('Token tidak ditemukan! Redirect ke login...');
    // navigate('/login');
    // return;
  }
  
  if (user) {
    setFormData({
      fullName: user.fullName || '',
      bio: user.bio || ''
    });
    fetchUserRecipes();
  }
}, [user, token, navigate]);

  // Fetch user's recipes
  const fetchUserRecipes = async () => {
    try {
      if (!user || !user._id) {
        console.warn('User ID not available');
        return;
      }
      
      const response = await axios.get(`${RECIPE_API}/users/${user._id}/recipes`);
      setRecipes(response.data.recipes || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    }
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.put(`${API_URL}/api/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        updateUser(response.data.user);
        setMessage('✅ Profil berhasil diperbarui!');
      }
    } catch (error) {
      setMessage('❌ Gagal memperbarui profil: ' + (error.response?.data?.message || error.message));
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

    setUploadMessage('⏳ Mengupload gambar...');
    setLoading(true);
    
    try {
      const imageBase64 = await convertToBase64(selectedFile);
      
      const response = await axios.put(`${API_URL}/api/profile/picture`, 
        { profilePicture: imageBase64 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        updateUser(response.data.user);
        setUploadMessage('✅ Foto profil berhasil diperbarui!');
        setSelectedFile(null);
      }
    } catch (error) {
      setUploadMessage('❌ Upload gagal: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
  e.preventDefault();
  setPasswordMessage('');
  
  // Validation
  if (!passwordForm.currentPassword) {
    setPasswordMessage('❌ Password saat ini harus diisi');
    return;
  }
  
  if (!passwordForm.newPassword) {
    setPasswordMessage('❌ Password baru harus diisi');
    return;
  }
  
  if (passwordForm.newPassword.length < 6) {
    setPasswordMessage('❌ Password baru minimal 6 karakter');
    return;
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    setPasswordMessage('❌ Password baru dan konfirmasi password tidak cocok');
    return;
  }
  
  setLoading(true);
  
  try {
    console.log('Mengirim request ubah password...');
    console.log('Token:', token ? 'Token ada' : 'Token tidak ada');
    
    // Coba beberapa endpoint yang mungkin
    const endpoints = [
      `${API_URL}/api/users/change-password`,
      `${API_URL}/api/profile/password`,
      `${API_URL}/api/auth/change-password`,
      `${API_URL}/change-password`
    ];
    
    let response;
    let lastError;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Mencoba endpoint: ${endpoint}`);
        response = await axios.put(
          endpoint,
          {
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
          },
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.data) {
          console.log('Response dari server:', response.data);
          break;
        }
      } catch (err) {
        lastError = err;
        console.log(`Endpoint ${endpoint} gagal:`, err.message);
        continue;
      }
    }
    
    if (!response) {
      throw lastError || new Error('Tidak ada endpoint yang berhasil');
    }
    
    if (response.data.success || response.data.message) {
      setPasswordMessage('✅ Password berhasil diubah!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Auto logout setelah ubah password (optional)
      setTimeout(() => {
        alert('Password berhasil diubah. Silakan login kembali.');
        logout();
        navigate('/login');
      }, 2000);
    }
  } catch (error) {
    console.error('Error detail:', error);
    
    // Cek jika token invalid
    if (error.response?.status === 401 || error.response?.status === 403) {
      setPasswordMessage('❌ Token tidak valid. Silakan login kembali.');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } 
    // Cek jika password lama salah
    else if (error.response?.status === 400) {
      setPasswordMessage('❌ Password saat ini salah');
    } 
    // Error lainnya
    else {
      setPasswordMessage('❌ ' + (error.response?.data?.message || error.message || 'Gagal mengubah password'));
    }
  } finally {
    setLoading(false);
  }
};

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token');
      }
      
      const response = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken
      });
      
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
      }
      
      return response.data.accessToken;
    } catch (error) {
      console.error('Refresh token failed:', error);
      logout();
      navigate('/login');
      return null;
    }
  };
  // Handle password form changes
  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Delete account function
  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm('⚠️ PERINGATAN: Menghapus akun akan menghapus semua data Anda termasuk resep. Tindakan ini tidak dapat dibatalkan!');
    
    if (confirmDelete) {
      const password = prompt('Masukkan password Anda untuk mengkonfirmasi penghapusan akun:');
      
      if (password) {
        setLoading(true);
        axios({
          method: 'delete',
          url: `${API_URL}/api/profile`,
          data: { password },
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(response => {
            if (response.data.success) {
              alert('Akun Anda telah dihapus');
              logout();
              navigate('/');
            }
          })
          .catch(error => {
            console.error('Delete account error:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message;
            alert('Gagal menghapus akun: ' + errorMsg);
          })
          .finally(() => setLoading(false));
      }
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop: '20px' }}>Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h1 className="page-title">Profil Saya</h1>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Left Column - Profile Info */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={user.profilePicture || 'https://via.placeholder.com/150'} 
                  alt="Profile" 
                  style={{ 
                    width: '150px', 
                    height: '150px', 
                    borderRadius: '50%', 
                    objectFit: 'cover',
                    marginBottom: '15px',
                    border: '4px solid #fff',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }} 
                />
                {selectedFile && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: '#ff6b6b',
                    color: 'white',
                    borderRadius: '50%',
                    width: '30px',
                    height: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    ✏️
                  </div>
                )}
              </div>
              <h2 style={{ marginBottom: '5px' }}>{user.fullName}</h2>
              <p className="muted" style={{ marginBottom: '10px' }}>@{user.username}</p>
              <p style={{ 
                marginTop: '10px', 
                color: '#666',
                fontStyle: user.bio ? 'normal' : 'italic'
              }}>
                {user.bio || 'Belum ada bio. Tambahkan bio Anda!'}
              </p>
              
              <div style={{ marginTop: '20px' }}>
                <span style={{ 
                  background: '#f8f9fa', 
                  padding: '5px 15px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  📧 {user.email}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="card" style={{ padding: '0', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid #eee'
            }}>
              <button
                onClick={() => setActiveTab('profile')}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: activeTab === 'profile' ? '#f8f9fa' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'profile' ? '2px solid #ff6b6b' : 'none',
                  cursor: 'pointer',
                  color: activeTab === 'profile' ? '#ff6b6b' : '#666',
                  fontWeight: activeTab === 'profile' ? '600' : '400'
                }}
              >
                ✏️ Edit Profil
              </button>
              <button
                onClick={() => setActiveTab('password')}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: activeTab === 'password' ? '#f8f9fa' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'password' ? '2px solid #ff6b6b' : 'none',
                  cursor: 'pointer',
                  color: activeTab === 'password' ? '#ff6b6b' : '#666',
                  fontWeight: activeTab === 'password' ? '600' : '400'
                }}
              >
                🔒 Ubah Password
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: activeTab === 'settings' ? '#f8f9fa' : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === 'settings' ? '2px solid #ff6b6b' : 'none',
                  cursor: 'pointer',
                  color: activeTab === 'settings' ? '#ff6b6b' : '#666',
                  fontWeight: activeTab === 'settings' ? '600' : '400'
                }}
              >
                ⚙️ Pengaturan
              </button>
            </div>
          </div>

          {/* My Recipes */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📖</span> Resep Saya ({recipes.length})
            </h3>
            {recipes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '10px', opacity: '0.3' }}>
                  🍳
                </div>
                <p className="muted" style={{ marginBottom: '15px' }}>Belum ada resep</p>
                <Link to="/create-recipe" className="btn btn-primary" style={{ marginTop: '10px' }}>
                  + Buat Resep Pertama
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
                    gap: '10px',
                    transition: 'background 0.2s',
                    borderRadius: '4px'
                  }} className="recipe-item">
                    {recipe.images && recipe.images.length > 0 ? (
                      <img 
                        src={recipe.images[0]} 
                        alt={recipe.title}
                        style={{ 
                          width: '50px', 
                          height: '50px', 
                          objectFit: 'cover', 
                          borderRadius: '4px',
                          flexShrink: 0
                        }} 
                      />
                    ) : (
                      <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        background: '#f8f9fa',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                        flexShrink: 0
                      }}>
                        🍽️
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link 
                        to={`/recipe/${recipe._id}`} 
                        style={{ 
                          textDecoration: 'none', 
                          color: '#333',
                          fontWeight: '500',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {recipe.title}
                      </Link>
                      <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                        <span className="muted" style={{ fontSize: '11px' }}>
                          ⭐ {recipe.likes?.length || 0}
                        </span>
                        <span className="muted" style={{ fontSize: '11px' }}>
                          💬 {recipe.comments?.length || 0}
                        </span>
                        <span className="muted" style={{ fontSize: '11px' }}>
                          {new Date(recipe.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {recipes.length > 5 && (
                  <Link 
                    to="/recipes" 
                    style={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      marginTop: '15px',
                      padding: '10px',
                      background: '#f8f9fa',
                      borderRadius: '4px',
                      color: '#666',
                      textDecoration: 'none'
                    }}
                  >
                    Lihat semua resep ({recipes.length})
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Forms based on active tab */}
        <div style={{ flex: '2', minWidth: '300px' }}>
          
          {/* Profile Edit Tab */}
          {activeTab === 'profile' && (
            <>
              <form onSubmit={handleSubmit} className="card" style={{ padding: '25px', marginBottom: '20px' }}>
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>✏️</span> Edit Profil
                </h2>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Nama Lengkap *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={loading}
                    style={{ padding: '12px' }}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="form-control"
                    rows="4"
                    placeholder="Ceritakan tentang diri Anda, hobi memasak, spesialisasi resep, dll..."
                    disabled={loading}
                    style={{ padding: '12px', resize: 'vertical' }}
                  />
                  <small className="muted" style={{ fontSize: '12px', marginTop: '5px' }}>
                    Maksimal 200 karakter. {formData.bio.length}/200
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? '⏳ Menyimpan...' : '💾 Simpan Perubahan'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setFormData({
                      fullName: user.fullName || '',
                      bio: user.bio || ''
                    })}
                    disabled={loading}
                  >
                    🔄 Reset
                  </button>
                </div>
                
                {message && (
                  <div style={{ 
                    marginTop: '15px',
                    padding: '12px',
                    borderRadius: '4px',
                    background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
                    color: message.includes('✅') ? '#2e7d32' : '#c62828',
                    border: `1px solid ${message.includes('✅') ? '#c8e6c9' : '#ffcdd2'}`
                  }}>
                    {message}
                  </div>
                )}
              </form>

              <form onSubmit={handleUploadSubmit} className="card" style={{ padding: '25px' }}>
                <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>🖼️</span> Foto Profil
                </h2>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Unggah Foto Baru
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    style={{ 
                      width: '100%',
                      padding: '10px',
                      border: '2px dashed #ddd',
                      borderRadius: '4px',
                      background: '#f8f9fa'
                    }}
                  />
                  <small className="muted" style={{ fontSize: '12px', display: 'block', marginTop: '5px' }}>
                    Format: JPG, PNG, GIF. Maksimal: 5MB.
                  </small>
                  
                  {selectedFile && (
                    <div style={{ marginTop: '15px' }}>
                      <p style={{ marginBottom: '10px', fontWeight: '500' }}>Preview:</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="Preview" 
                          style={{ 
                            width: '80px', 
                            height: '80px', 
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #ff6b6b'
                          }} 
                        />
                        <div>
                          <p style={{ fontSize: '14px', marginBottom: '5px' }}>
                            <strong>{selectedFile.name}</strong>
                          </p>
                          <p className="muted" style={{ fontSize: '12px' }}>
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={!selectedFile || loading}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {loading ? '⏳ Uploading...' : '📤 Upload Foto Profil'}
                </button>
                
                {uploadMessage && (
                  <div style={{ 
                    marginTop: '15px',
                    padding: '12px',
                    borderRadius: '4px',
                    background: uploadMessage.includes('✅') ? '#e8f5e9' : '#ffebee',
                    color: uploadMessage.includes('✅') ? '#2e7d32' : '#c62828',
                    border: `1px solid ${uploadMessage.includes('✅') ? '#c8e6c9' : '#ffcdd2'}`
                  }}>
                    {uploadMessage}
                  </div>
                )}
              </form>
            </>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="card" style={{ padding: '25px' }}>
              <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🔒</span> Ubah Password
              </h2>
              
              {!token && (
                <div style={{ 
                  padding: '15px', 
                  background: '#fff3cd', 
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  color: '#856404'
                }}>
                  ⚠️ <strong>Token tidak ditemukan!</strong> 
                  <div style={{ marginTop: '5px', fontSize: '14px' }}>
                    Silakan <Link to="/login" style={{ color: '#d63031', fontWeight: 'bold' }}>login ulang</Link> 
                    untuk melanjutkan.
                  </div>
                </div>
              )}
              
              <form onSubmit={handlePasswordSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Password Saat Ini *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    required
                    disabled={loading}
                    style={{ padding: '12px' }}
                    placeholder="Masukkan password saat ini"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Password Baru *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    required
                    disabled={loading}
                    style={{ padding: '12px' }}
                    placeholder="Minimal 6 karakter"
                    minLength="6"
                  />
                  <small className="muted" style={{ fontSize: '12px', display: 'block', marginTop: '5px' }}>
                    Minimal 6 karakter
                  </small>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Konfirmasi Password Baru *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    required
                    disabled={loading}
                    style={{ padding: '12px' }}
                    placeholder="Ketik ulang password baru"
                    minLength="6"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading || !token}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      opacity: !token ? 0.5 : 1 
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <span>🔐</span> Ubah Password
                      </>
                    )}
                  </button>
                  
                  <button 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setPasswordForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    })}
                    disabled={loading}
                  >
                    🔄 Clear
                  </button>
                  
                  {!token && (
                    <Link 
                      to="/login" 
                      className="btn btn-warning"
                      style={{ 
                        marginLeft: 'auto',
                        padding: '8px 15px',
                        fontSize: '14px'
                      }}
                    >
                      🔑 Login Ulang
                    </Link>
                  )}
                </div>
                
                {passwordMessage && (
                  <div style={{ 
                    marginTop: '15px',
                    padding: '12px',
                    borderRadius: '4px',
                    background: passwordMessage.includes('✅') ? '#e8f5e9' : 
                              passwordMessage.includes('❌') ? '#ffebee' : '#fff3cd',
                    color: passwordMessage.includes('✅') ? '#2e7d32' : 
                          passwordMessage.includes('❌') ? '#c62828' : '#856404',
                    border: `1px solid ${passwordMessage.includes('✅') ? '#c8e6c9' : 
                              passwordMessage.includes('❌') ? '#ffcdd2' : '#ffeaa7'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    {passwordMessage.includes('✅') ? '✅' : 
                    passwordMessage.includes('❌') ? '❌' : '⚠️'}
                    <span>{passwordMessage.replace('✅ ', '').replace('❌ ', '').replace('⚠️ ', '')}</span>
                  </div>
                )}
                
                {/* Token Debug Info - hanya tampilkan di development */}
                {process.env.NODE_ENV === 'development' && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    background: '#f1f8ff', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    border: '1px solid #c8e1ff'
                  }}>
                    <h4 style={{ marginBottom: '8px', fontSize: '12px', color: '#0366d6' }}>
                      🐛 Debug Info:
                    </h4>
                    <div style={{ wordBreak: 'break-all' }}>
                      <strong>Token Status:</strong> {token ? '✅ Ada' : '❌ Tidak Ada'}<br/>
                      <strong>Token Preview:</strong> {token ? token.substring(0, 30) + '...' : 'N/A'}<br/>
                      <strong>User ID:</strong> {user?.id || 'N/A'}<br/>
                      <strong>API URL:</strong> {API_URL}
                    </div>
                  </div>
                )}
                
                <div style={{ 
                  marginTop: '30px', 
                  padding: '15px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  <h4 style={{ marginBottom: '10px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💡</span> Tips Password Aman:
                  </h4>
                  <ul style={{ paddingLeft: '20px', margin: 0, color: '#666' }}>
                    <li>Gunakan kombinasi huruf besar/kecil</li>
                    <li>Tambahkan angka dan simbol</li>
                    <li>Minimal 8 karakter lebih aman</li>
                    <li>Jangan gunakan password yang sama dengan akun lain</li>
                    <li>Hindari informasi pribadi (tanggal lahir, nama, dll)</li>
                  </ul>
                </div>
              </form>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="card" style={{ padding: '25px' }}>
              <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>⚙️</span> Pengaturan Akun
              </h2>
              
              {/* Session Info */}
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>🕐 Informasi Sesi</h3>
                <div style={{ 
                  padding: '15px', 
                  background: '#f8f9fa', 
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  <p style={{ marginBottom: '10px' }}>
                    <strong>Login terakhir:</strong> {new Date().toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p>
                    <strong>Email terverifikasi:</strong> {user.email ? '✅ Ya' : '❌ Belum'}
                  </p>
                </div>
                <button 
                  onClick={async () => {
                    try {
                      const response = await axios.post(`${API_URL}/api/auth/refresh`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      if (response.data.token) {
                        localStorage.setItem('token', response.data.token);
                        alert('Token refreshed!');
                        window.location.reload();
                      }
                    } catch (error) {
                      alert('Failed to refresh token: ' + error.message);
                    }
                  }}
                  style={{
                    padding: '5px 10px',
                    fontSize: '12px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh Token
                </button>
              </div>

              {/* Danger Zone */}
              <div style={{ 
                border: '2px solid #ffebee',
                borderRadius: '8px',
                padding: '20px',
                background: '#fff'
              }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#c62828' }}>⚠️ Zona Bahaya</h3>
                
                {/* Logout Button */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ marginBottom: '10px', fontSize: '14px' }}>
                    Keluar dari akun Anda di perangkat ini.
                  </p>
                  <button 
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ 
                      background: '#6c757d',
                      borderColor: '#6c757d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    🚪 Keluar
                  </button>
                </div>

                {/* Delete Account Button (Optional) */}
                <div style={{ 
                  paddingTop: '20px', 
                  borderTop: '1px solid #ffcdd2'
                }}>
                  <p style={{ marginBottom: '10px', fontSize: '14px', color: '#c62828' }}>
                    <strong>Hapus Akun Selamanya</strong>
                  </p>
                  <p style={{ marginBottom: '15px', fontSize: '13px', color: '#666' }}>
                    Tindakan ini akan menghapus semua data Anda termasuk resep dan komentar.
                    <br />
                    <strong>Tidak dapat dibatalkan!</strong>
                  </p>
                  <button 
                    onClick={handleDeleteAccount}
                    className="btn"
                    style={{ 
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    🗑️ Hapus Akun Saya
                  </button>
                </div>
              </div>

              {/* Account Stats */}
              <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                background: '#f8f9fa', 
                borderRadius: '8px'
              }}>
                <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>📊 Statistik Akun</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
                      {recipes.length}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Resep</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
                      {recipes.reduce((sum, recipe) => sum + (recipe.likes?.length || 0), 0)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Likes</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6b6b' }}>
                      {recipes.reduce((sum, recipe) => sum + (recipe.comments?.length || 0), 0)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Komentar</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional CSS for hover effects */}
      <style>{`
        .recipe-item:hover {
          background-color: #f8f9fa;
        }
        
        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn-primary:disabled {
          background-color: #ff8e8e;
          border-color: #ff8e8e;
        }
      `}</style>
    </div>
  );
}

export default Profile;