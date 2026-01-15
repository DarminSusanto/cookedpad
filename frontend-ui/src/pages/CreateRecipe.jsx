// src/pages/CreateRecipe.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function CreateRecipe() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'makanan',
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: 'sedang',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: [{ step: 1, description: '', image: '' }],
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API_URL = process.env.REACT_APP_API_RECIPES || 'http://localhost:3003';

  const categories = [
    { value: 'makanan', label: 'Makanan' },
    { value: 'minuman', label: 'Minuman' },
    { value: 'kue', label: 'Kue' },
    { value: 'sarapan', label: 'Sarapan' },
    { value: 'cemilan', label: 'Cemilan' }
  ];

  const difficulties = [
    { value: 'mudah', label: 'Mudah' },
    { value: 'sedang', label: 'Sedang' },
    { value: 'sulit', label: 'Sulit' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const handleInstructionChange = (index, field, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index][field] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { 
        step: prev.instructions.length + 1, 
        description: '', 
        image: '' 
      }]
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions
        .filter((_, i) => i !== index)
        .map((inst, idx) => ({ ...inst, step: idx + 1 }));
      setFormData(prev => ({ ...prev, instructions: newInstructions }));
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.images.length > 10) {
      alert('Maksimal 10 gambar');
      return;
    }

    try {
      const base64Images = await Promise.all(files.map(file => convertToBase64(file)));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...base64Images]
      }));
    } catch (error) {
      console.error('Error converting images:', error);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.title.trim()) {
      setError('Judul resep harus diisi');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Deskripsi resep harus diisi');
      setLoading(false);
      return;
    }

    if (formData.ingredients.some(ing => !ing.name.trim())) {
      setError('Semua bahan harus memiliki nama');
      setLoading(false);
      return;
    }

    if (formData.instructions.some(inst => !inst.description.trim())) {
      setError('Semua langkah harus memiliki deskripsi');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/recipes`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('Resep berhasil dibuat!');
        setTimeout(() => {
          navigate(`/recipe/${response.data.recipe._id}`);
        }, 2000);
      }
    } catch (error) {
      setError('Gagal membuat resep: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-recipe-page">
      <h1 className="page-title">Buat Resep Baru</h1>

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

      {success && (
        <div style={{ 
          background: '#e8f5e9', 
          color: '#2e7d32', 
          padding: '15px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>Informasi Dasar</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Judul Resep *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control"
              placeholder="Contoh: Nasi Goreng Spesial"
              required
              disabled={loading}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Deskripsi *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Ceritakan tentang resep ini..."
              required
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Kategori</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
                disabled={loading}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Tingkat Kesulitan</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="form-control"
                disabled={loading}
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Waktu Persiapan (menit)</label>
              <input
                type="number"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                className="form-control"
                min="0"
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Waktu Memasak (menit)</label>
              <input
                type="number"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleChange}
                className="form-control"
                min="0"
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px' }}>Porsi (orang)</label>
              <input
                type="number"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
                className="form-control"
                min="1"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Bahan-bahan</h2>
            <button type="button" onClick={addIngredient} className="btn btn-outline" disabled={loading}>
              + Tambah Bahan
            </button>
          </div>

          {formData.ingredients.map((ingredient, index) => (
            <div key={index} style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 100px 100px auto', 
              gap: '15px', 
              alignItems: 'center',
              marginBottom: '15px',
              paddingBottom: '15px',
              borderBottom: index < formData.ingredients.length - 1 ? '1px solid #eee' : 'none'
            }}>
              <div>
                <label className="muted" style={{ fontSize: '12px' }}>Nama Bahan</label>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  className="form-control"
                  placeholder="Contoh: Bawang Merah"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="muted" style={{ fontSize: '12px' }}>Jumlah</label>
                <input
                  type="text"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  className="form-control"
                  placeholder="2"
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="muted" style={{ fontSize: '12px' }}>Satuan</label>
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="form-control"
                  placeholder="siung"
                  disabled={loading}
                />
              </div>
              
              <div>
                <button 
                  type="button" 
                  onClick={() => removeIngredient(index)}
                  className="btn"
                  style={{ color: '#ff6b6b', marginTop: '20px' }}
                  disabled={loading || formData.ingredients.length === 1}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions Section */}
        <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Langkah Pembuatan</h2>
            <button type="button" onClick={addInstruction} className="btn btn-outline" disabled={loading}>
              + Tambah Langkah
            </button>
          </div>

          {formData.instructions.map((instruction, index) => (
            <div key={index} style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
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
                  {instruction.step}
                </div>
                <div style={{ flex: 1 }}>
                  <label className="muted" style={{ fontSize: '12px' }}>Deskripsi Langkah</label>
                  <textarea
                    value={instruction.description}
                    onChange={(e) => handleInstructionChange(index, 'description', e.target.value)}
                    className="form-control"
                    rows="3"
                    placeholder="Deskripsikan langkah ini..."
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <label className="muted" style={{ fontSize: '12px' }}>Gambar Langkah (Opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      if (e.target.files[0]) {
                        const base64 = await convertToBase64(e.target.files[0]);
                        handleInstructionChange(index, 'image', base64);
                      }
                    }}
                    className="form-control"
                    disabled={loading}
                  />
                  {instruction.image && (
                    <div style={{ marginTop: '10px' }}>
                      <img 
                        src={instruction.image} 
                        alt={`Langkah ${instruction.step}`}
                        style={{ 
                          width: '100px',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <button 
                  type="button" 
                  onClick={() => removeInstruction(index)}
                  className="btn"
                  style={{ color: '#ff6b6b', marginTop: '20px' }}
                  disabled={loading || formData.instructions.length === 1}
                >
                  Hapus Langkah
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Images Section */}
        <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '20px' }}>Gambar Resep (Maksimal 10)</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <label className="muted" style={{ fontSize: '12px' }}>Upload Gambar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="form-control"
              multiple
              disabled={loading || formData.images.length >= 10}
            />
          </div>

          {formData.images.length > 0 && (
            <div>
              <p className="muted" style={{ marginBottom: '10px' }}>
                {formData.images.length} gambar terpilih
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '15px' 
              }}>
                {formData.images.map((image, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={image} 
                      alt={`Preview ${index + 1}`}
                      style={{ 
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '25px',
                        height: '25px',
                        cursor: 'pointer'
                      }}
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '15px 40px', fontSize: '16px' }}
            disabled={loading}
          >
            {loading ? 'Menyimpan Resep...' : 'Publikasikan Resep'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateRecipe;