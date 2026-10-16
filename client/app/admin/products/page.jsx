'use client';

import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';

import { MyContext } from '../../../context/ThemeContext';

export default function ManageProducts() {
  const context = useContext(MyContext);

  const user = context?.userDetails;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [editingProduct, setEditingProduct] =
    useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    rating: '',
    description: '',
    image: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:8000/api/admin/products'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch products'
        );
      }

      setProducts(data.data || []);
    } catch (error) {
      console.error(
        'Fetch products error:',
        error
      );

      setError(
        error.message ||
          'Unable to load products'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await fetch(
        'http://localhost:8000/api/admin/categories'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to fetch categories'
        );
      }

      setCategories(data.data || []);
    } catch (error) {
      console.error(
        'Fetch categories error:',
        error
      );

      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Start editing
  const handleEdit = (product) => {
    setEditingProduct(product);

    /*
      Find the matching database category.

      Example:
      Product category = "burger"
      Database category = "Burgers"

      This makes the dropdown select
      the correct category automatically.
    */
    const matchingCategory =
      categories.find(
        (category) =>
          String(category.name || '')
            .trim()
            .toLowerCase() ===
          String(product.category || '')
            .trim()
            .toLowerCase()
      );

    setFormData({
      title: product.title || '',

      category:
        matchingCategory?.name ||
        product.category ||
        '',

      price: product.price || '',
      rating: product.rating || '',
      description:
        product.description || '',
      image: product.image || '',
    });

    setMessage('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Form input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Update product
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingProduct) {
      return;
    }

    try {
      setMessage('');
      setError('');

      const productId =
        editingProduct._id ||
        editingProduct.id;

      const response = await fetch(
        `http://localhost:8000/api/admin/update-product/${productId}`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          credentials: 'include',

          body: JSON.stringify({
            title: formData.title,
            category: formData.category,
            price: Number(formData.price),
            rating: Number(formData.rating),
            description: formData.description,
            image: formData.image,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update product'
        );
      }

      setMessage(
        'Product updated successfully.'
      );

      setEditingProduct(null);

      setFormData({
        title: '',
        category: '',
        price: '',
        rating: '',
        description: '',
        image: '',
      });

      await fetchProducts();
    } catch (error) {
      console.error(
        'Update product error:',
        error
      );

      setError(
        error.message ||
          'Unable to update product'
      );
    }
  };

  // Delete product
  const handleDelete = async (product) => {
    const productId =
      product._id || product.id;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.title}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage('');
      setError('');

      const response = await fetch(
        `http://localhost:8000/api/admin/delete-product/${productId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to delete product'
        );
      }

      setMessage(
        'Product deleted successfully.'
      );

      await fetchProducts();
    } catch (error) {
      console.error(
        'Delete product error:',
        error
      );

      setError(
        error.message ||
          'Unable to delete product'
      );
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingProduct(null);

    setFormData({
      title: '',
      category: '',
      price: '',
      rating: '',
      description: '',
      image: '',
    });

    setMessage('');
    setError('');
  };

  // Access check
  if (
    !context?.isLoggedIn ||
    user?.role !== 'Admin'
  ) {
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '50px',
          textAlign: 'center',
        }}
      >
        <h1>Access Denied</h1>

        <p
          style={{
            color: '#666',
            marginTop: '10px',
          }}
        >
          Admin privileges are required to
          access this page.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '12px 25px',
            background: '#ff5722',
            color: '#fff',
            borderRadius: '7px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          gap: '15px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1>Manage Products</h1>

          <p
            style={{
              color: '#666',
              marginTop: '8px',
            }}
          >
            Edit or delete products from your
            menu.
          </p>
        </div>

        <Link
          href="/admin/add-product"
          style={{
            background: '#ff5722',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '7px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          + Add Product
        </Link>
      </div>

      {/* Success Message */}
      {message && (
        <div
          style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            border: '1px solid #a5d6a7',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          {message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            background: '#ffebee',
            color: '#c62828',
            border: '1px solid #ef9a9a',
            padding: '12px 15px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {/* Edit Form */}
      {editingProduct && (
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '30px',
          }}
        >
          <h2
            style={{
              marginBottom: '20px',
            }}
          >
            Edit Product
          </h2>

          <form onSubmit={handleUpdate}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
              }}
            >
              {/* Product Name */}
              <div>
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
                  value={formData.title}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                />
              </div>

              {/* Category Dropdown */}
              <div>
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
                  value={formData.category}
                  onChange={handleChange}
                  required
                  style={inputStyle}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading
                      ? 'Loading categories...'
                      : categories.length === 0
                      ? 'No categories available'
                      : 'Select a category'}
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    )
                  )}

                  {/* 
                    If the old product category
                    doesn't exist in the database
                    yet, keep it temporarily visible.
                  */}
                  {formData.category &&
                    !categories.some(
                      (category) =>
                        String(
                          category.name
                        )
                          .trim()
                          .toLowerCase() ===
                        String(
                          formData.category
                        )
                          .trim()
                          .toLowerCase()
                    ) && (
                      <option
                        value={
                          formData.category
                        }
                      >
                        {formData.category}
                      </option>
                    )}
                </select>
              </div>

              {/* Price */}
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
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Rating */}
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
                  value={formData.rating}
                  onChange={handleChange}
                  min="0"
                  max="5"
                  step="0.1"
                  style={inputStyle}
                />
              </div>

              {/* Image */}
              <div
                style={{
                  gridColumn: '1 / -1',
                }}
              >
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
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div
                style={{
                  gridColumn: '1 / -1',
                }}
              >
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
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '20px',
              }}
            >
              <button
                type="submit"
                style={{
                  background: '#ff5722',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Update Product
              </button>

              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: '#eee',
                  color: '#333',
                  border: 'none',
                  padding: '12px 22px',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products */}
      {loading ? (
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <h2>No Products Found</h2>

          <p
            style={{
              color: '#666',
              marginTop: '10px',
            }}
          >
            Add your first product to see it
            here.
          </p>

          <Link
            href="/admin/add-product"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              background: '#ff5722',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '7px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Add Product
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {products.map((product) => (
            <div
              key={
                product._id || product.id
              }
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Product Image */}
              <div
                style={{
                  width: '100%',
                  height: '220px',
                  background: '#f5f5f5',
                }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999',
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div
                style={{
                  padding: '20px',
                }}
              >
                <h2
                  style={{
                    marginBottom: '8px',
                  }}
                >
                  {product.title}
                </h2>

                <p
                  style={{
                    color: '#ff5722',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  Category: {product.category}
                </p>

                <p
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  ₹{product.price}
                </p>

                <p
                  style={{
                    color: '#666',
                    marginBottom: '10px',
                  }}
                >
                  ⭐ {product.rating || 0}
                </p>

                <p
                  style={{
                    color: '#666',
                    lineHeight: '1.5',
                    marginBottom: '20px',
                  }}
                >
                  {product.description}
                </p>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(product)
                    }
                    style={{
                      flex: 1,
                      background: '#1976d2',
                      color: '#fff',
                      border: 'none',
                      padding: '11px',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(product)
                    }
                    style={{
                      flex: 1,
                      background: '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      padding: '11px',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ccc',
  borderRadius: '7px',
  fontSize: '15px',
  boxSizing: 'border-box',
};