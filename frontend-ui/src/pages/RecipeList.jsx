// src/pages/RecipeList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');

  const API_URL = process.env.REACT_APP_API_RECIPES || 'http://localhost:3003';

  const categories = [
    { value: '', label: 'Semua Kategori' },
    { value: 'makanan', label: 'Makanan' },
    { value: 'minuman', label: 'Minuman' },
    { value: 'kue', label: 'Kue' },
    { value: 'sarapan', label: 'Sarapan' },
    { value: 'cemilan', label: 'Cemilan' }
  ];

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/recipes?page=${page}&limit=12`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;

      const response = await axios.get(url);
      
      if (response.data.success) {
        setRecipes(response.data.recipes);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      setError('Gagal memuat resep');
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecipes();
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  if (loading && recipes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>Memuat resep...</p>
      </div>
    );
  }

  return (
    <div className="recipe-list-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="page-title">Resep Masakan</h1>
        <Link to="/create-recipe" className="btn btn-primary">
          + Buat Resep
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="card" style={{ padding: '20px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Cari resep..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary">
                  Cari
                </button>
              </div>
            </form>
          </div>

          <div style={{ minWidth: '200px' }}>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="form-control"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ 
          background: '#ffebee', 
          color: '#c62828', 
          padding: '15px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {/* Recipe Grid */}
      {recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h3>Tidak ada resep ditemukan</h3>
          <p className="muted" style={{ marginBottom: '20px' }}>
            {category ? `Coba cari dengan kategori lain` : 'Jadilah yang pertama membuat resep!'}
          </p>
          <Link to="/create-recipe" className="btn btn-primary">
            Buat Resep Pertama
          </Link>
        </div>
      ) : (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '25px',
            marginBottom: '40px'
          }}>
            {recipes.map(recipe => (
              <div key={recipe._id} className="card" style={{ overflow: 'hidden' }}>
                {/* Recipe Image */}
                {recipe.images && recipe.images.length > 0 ? (
                  <img 
                    src={recipe.images[0]} 
                    alt={recipe.title}
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover' 
                    }} 
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '200px', 
                    background: '#eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999'
                  }}>
                    Tidak ada gambar
                  </div>
                )}

                {/* Recipe Content */}
                <div style={{ padding: '20px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span style={{ 
                      background: '#ff6b6b', 
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      display: 'inline-block'
                    }}>
                      {recipe.category}
                    </span>
                  </div>

                  <h3 style={{ marginBottom: '10px' }}>
                    <Link to={`/recipe/${recipe._id}`} style={{ 
                      textDecoration: 'none', 
                      color: '#333',
                      fontSize: '18px'
                    }}>
                      {recipe.title}
                    </Link>
                  </h3>

                  <p className="muted" style={{ 
                    fontSize: '14px', 
                    marginBottom: '15px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {recipe.description}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <img 
                        src={recipe.author.profilePicture || 'https://via.placeholder.com/30'} 
                        alt={recipe.author.fullName}
                        style={{ 
                          width: '30px', 
                          height: '30px', 
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }} 
                      />
                      <span>{recipe.author.fullName}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <span>👨‍🍳 {recipe.prepTime + recipe.cookTime} min</span>
                      <span>👥 {recipe.servings} porsi</span>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid #eee'
                  }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn" style={{ padding: '5px 10px', fontSize: '12px' }}>
                        ❤️ {recipe.likes?.length || 0}
                      </button>
                      <button className="btn" style={{ padding: '5px 10px', fontSize: '12px' }}>
                        💾 {recipe.saves?.length || 0}
                      </button>
                    </div>
                    <Link 
                      to={`/recipe/${recipe._id}`} 
                      className="btn btn-primary"
                      style={{ padding: '5px 15px', fontSize: '12px' }}
                    >
                      Lihat Resep
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline"
              >
                Sebelumnya
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={page === pageNum ? 'btn btn-primary' : 'btn btn-outline'}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn btn-outline"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default RecipeList;