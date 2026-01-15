// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CookieBanner from '../components/CookieBanner';
import './Home.css';

function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1>Selamat Datang di CookedPad</h1>
          <p>Temukan dan bagikan resep masakan terbaik dari seluruh Indonesia</p>
          
          <div className="hero-buttons">
            {isAuthenticated ? (
              <>
                <Link to="/recipes" className="btn btn-primary">
                  Jelajahi Resep
                </Link>
                <Link to="/create-recipe" className="btn btn-outline">
                  + Buat Resep
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Daftar Gratis
                </Link>
                <Link to="/login" className="btn btn-outline">
                  Masuk
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>Kenapa Memilih CookedPad?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🍳</div>
            <h3>Ribuan Resep</h3>
            <p>Akses ribuan resep dari berbagai daerah di Indonesia</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👨‍🍳</div>
            <h3>Dibuat oleh Komunitas</h3>
            <p>Resep dibuat dan diuji oleh komunitas cookpad</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Akses Mudah</h3>
            <p>Akses dari mana saja dengan antarmuka yang user-friendly</p>
          </div>
        </div>
      </div>

      {/* Trending Recipes Preview */}
      <div className="trending-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Resep Populer</h2>
          <Link to="/recipes" className="see-all-link">
            Lihat Semua →
          </Link>
        </div>
        
        <div className="trending-grid">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="recipe-preview-card">
              <div className="recipe-preview-image">
                {/* Placeholder untuk gambar */}
              </div>
              <div className="recipe-preview-content">
                <h4>Resep Nusantara {item}</h4>
                <p>Deskripsi singkat resep yang menarik</p>
                <div className="recipe-preview-meta">
                  <span>⏱️ 30 min</span>
                  <span>👥 4 porsi</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}

export default Home;