'use client';

import { useState } from 'react';

export default function AddProductPage() {
  const [product, setProduct] = useState({
    title: '',
    category: 'pizza',
    price: '',
    rating: '4.8',
    description: '',
    image: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProduct((prev) => ({
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
      'http://localhost:8000/api/admin/create-product',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: product.title,
          category: product.category,
          price: Number(product.price),
          rating: Number(product.rating),
          description: product.description,
          image: product.image,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setSuccessMsg(data.message || 'Failed to create product.');
      return;
    }

    setSuccessMsg(
      data.message || 'Product added successfully!'
    );

    setProduct({
      title: '',
      category: 'pizza',
      price: '',
      rating: '4.8',
      description: '',
      image: '',
    });
  } catch (error) {
    console.error('Product error:', error);
    setSuccessMsg('Unable to connect to the server.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{
        maxWidth: '800px',
      }}
    >
      <h1
        style={{
          marginBottom: '10px',
        }}
      >
        Add New Food Product
      </h1>

      <p
        style={{
          color: '#666',
          marginBottom: '30px',
        }}
      >
        Add a new food item to your menu.
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
        {/* Product Title */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '7px',
              fontWeight: 'bold',
            }}
          >
            Product Name
          </label>

          <input
            type="text"
            name="title"
            value={product.title}
            onChange={handleChange}
            placeholder="Example: Margherita Pizza"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
            }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '7px',
              fontWeight: 'bold',
            }}
          >
            Category
          </label>

          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              background: '#fff',
            }}
          >
            <option value="pizza">Pizza</option>
            <option value="burger">Burger</option>
            <option value="dessert">Dessert</option>
            <option value="drinks">Drinks</option>
            <option value="biryani">Biryani</option>
          </select>
        </div>

        {/* Price + Rating */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px',
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontWeight: 'bold',
              }}
            >
              Price
            </label>

            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleChange}
              placeholder="Example: 299"
              min="0"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '6px',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontWeight: 'bold',
              }}
            >
              Rating
            </label>

            <input
              type="number"
              name="rating"
              value={product.rating}
              onChange={handleChange}
              min="0"
              max="5"
              step="0.1"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ccc',
                borderRadius: '6px',
              }}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '7px',
              fontWeight: 'bold',
            }}
          >
            Description
          </label>

          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="Describe the food item..."
            rows="5"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Image */}
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
            value={product.image}
            onChange={handleChange}
            placeholder="Enter image URL"
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
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Adding Product...' : 'Add Product'}
        </button>
      </form>
    </div>
  );
}