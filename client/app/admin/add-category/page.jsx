'use client';

import { useState } from 'react';

export default function AddCategoryPage() {
  const [category, setCategory] = useState({
    name: '',
    image: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setCategory((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setLoading(true);
  setSuccessMsg('');

  try {
    const response = await fetch(
      'http://localhost:8000/api/admin/create-category',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(category),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setSuccessMsg(
        data.message || 'Failed to create category.'
      );
      return;
    }

    setSuccessMsg(
      data.message || 'Category added successfully!'
    );

    setCategory({
      name: '',
      image: '',
    });
  } catch (error) {
    console.error('Category error:', error);

    setSuccessMsg(
      'Unable to connect to the server.'
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{
        maxWidth: '700px',
      }}
    >
      <h1 style={{ marginBottom: '10px' }}>
        Add New Category
      </h1>

      <p
        style={{
          color: '#666',
          marginBottom: '30px',
        }}
      >
        Create a new food category for your menu.
      </p>

      {successMsg && (
        <div
          style={{
            background: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
          }}
        >
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '30px',
        }}
      >
        {/* Category Name */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '7px',
              fontWeight: 'bold',
            }}
          >
            Category Name
          </label>

          <input
            type="text"
            name="name"
            value={category.name}
            onChange={handleChange}
            placeholder="Example: Pizza"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
            }}
          />
        </div>

        {/* Image URL */}
        <div style={{ marginBottom: '25px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '7px',
              fontWeight: 'bold',
            }}
          >
            Image URL
          </label>

          <input
            type="text"
            name="image"
            value={category.image}
            onChange={handleChange}
            placeholder="Enter category image URL"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            border: 'none',
            borderRadius: '7px',
            background: loading ? '#aaa' : '#ff5722',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading
              ? 'not-allowed'
              : 'pointer',
          }}
        >
          {loading
            ? 'Adding Category...'
            : 'Add Category'}
        </button>
      </form>
    </div>
  );
}