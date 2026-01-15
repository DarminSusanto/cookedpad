// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '15px 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          textDecoration: 'none',
          color: '#ff6b6b',
          fontSize: '24px',
          fontWeight: 'bold'
        }}>
          CookedPad
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <Link to="/recipes" style={{ textDecoration: 'none', color: '#333' }}>
            Resep
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/create-recipe" className="btn btn-primary">
                + Buat Resep
              </Link>
              
              <div style={{ position: 'relative' }}>
                <button style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <img 
                    src={user?.profilePicture || 'https://via.placeholder.com/35'} 
                    alt="Profile" 
                    style={{ 
                      width: '35px', 
                      height: '35px', 
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }} 
                  />
                  <span>{user?.username}</span>
                </button>
                
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  background: 'white',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  minWidth: '150px',
                  marginTop: '10px',
                  display: 'none'
                }} className="dropdown-menu">
                  <Link to="/profile" style={{
                    display: 'block',
                    padding: '10px 15px',
                    textDecoration: 'none',
                    color: '#333',
                    borderBottom: '1px solid #eee'
                  }}>
                    Profil Saya
                  </Link>
                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '10px 15px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#ff6b6b'
                    }}
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link to="/login" className="btn btn-outline">
                Masuk
              </Link>
              <Link to="/register" className="btn btn-primary">
                Daftar
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;