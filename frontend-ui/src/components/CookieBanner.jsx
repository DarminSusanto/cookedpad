// src/components/CookieBanner.jsx
import React, { useState, useEffect } from 'react';
import './CookieBanner.css'; // Buat file CSS terpisah

function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Cek jika user sudah menerima cookie
    const cookieAccepted = localStorage.getItem('cookedpad_cookie_accepted');
    if (!cookieAccepted) {
      // Tampilkan banner setelah 2 detik
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    // Simpan preferensi di localStorage
    localStorage.setItem('cookedpad_cookie_accepted', 'true');
    localStorage.setItem('cookedpad_cookie_date', new Date().toISOString());
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookedpad_cookie_accepted', 'false');
    setIsVisible(false);
  };

  const learnMore = () => {
    window.open('/privacy-policy', '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-content">
        <div className="cookie-text">
          <h3>🍪 Kami menggunakan cookie</h3>
          <p>
            Kami menggunakan cookie untuk meningkatkan pengalaman Anda di CookedPad. 
            Cookie membantu kami memberikan konten yang relevan dan mengingat preferensi Anda.
          </p>
          <div className="cookie-links">
            <a href="/privacy" onClick={learnMore}>Pelajari lebih lanjut</a>
          </div>
        </div>
        
        <div className="cookie-buttons">
          <button 
            onClick={declineCookies} 
            className="cookie-btn decline"
          >
            Hanya Cookie Penting
          </button>
          <button 
            onClick={acceptCookies} 
            className="cookie-btn accept"
          >
            Terima Semua Cookie
          </button>
        </div>
        
        <button 
          onClick={declineCookies} 
          className="cookie-close"
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;