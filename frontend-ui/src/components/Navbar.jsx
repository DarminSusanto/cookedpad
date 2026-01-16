// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav style={{
      background: 'white',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      padding: '15px 0',
      position: 'sticky',
      top: 0,
      zIndex: 1000
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
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#ff6b6b',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            CP
          </div>
          <span>CookedPad</span>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
          <Link to="/recipes" style={{ 
            textDecoration: 'none', 
            color: '#333',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}>
            Resep
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link 
                to="/create-recipe" 
                style={{
                  textDecoration: 'none',
                  background: '#ff6b6b',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#ff5252'}
                onMouseLeave={(e) => e.target.style.background = '#ff6b6b'}
              >
                + Buat Resep
              </Link>
              
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <button 
                  onClick={toggleDropdown}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '5px',
                    borderRadius: '50px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#ff6b6b',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    overflow: 'hidden'
                  }}>
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt="Profile" 
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }} 
                      />
                    ) : (
                      user?.username?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <span style={{ 
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {user?.username || 'User'}
                  </span>
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    style={{
                      transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s'
                    }}
                  >
                    <path d="M2 4L6 8L10 4" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    background: 'white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    minWidth: '200px',
                    overflow: 'hidden',
                    zIndex: 1000,
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <div style={{
                      padding: '15px',
                      borderBottom: '1px solid #eee'
                    }}>
                      <div style={{ 
                        fontWeight: 'bold',
                        fontSize: '16px',
                        marginBottom: '5px'
                      }}>
                        {user?.username || 'User'}
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        {user?.email || ''}
                      </div>
                    </div>
                    
                    <Link 
                      to="/profile" 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 15px',
                        textDecoration: 'none',
                        color: '#333',
                        transition: 'background 0.2s'
                      }}
                      onClick={() => setIsDropdownOpen(false)}
                      onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#666"/>
                      </svg>
                      Profil Saya
                    </Link>
                    
                    <button 
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '12px 15px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: '#ff6b6b',
                        borderTop: '1px solid #eee',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                      onMouseLeave={(e) => e.target.style.background = 'white'}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="#ff6b6b"/>
                      </svg>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '15px' }}>
              <Link 
                to="/login" 
                style={{
                  textDecoration: 'none',
                  color: '#ff6b6b',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #ff6b6b',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#ff6b6b';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#ff6b6b';
                }}
              >
                Masuk
              </Link>
              <Link 
                to="/register" 
                style={{
                  textDecoration: 'none',
                  background: '#ff6b6b',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#ff5252'}
                onMouseLeave={(e) => e.target.style.background = '#ff6b6b'}
              >
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