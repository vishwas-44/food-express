'use client';

import { useEffect, useState } from 'react';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [name, setName] = useState('');
  const [image, setImage] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');

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

      setError(
        error.message ||
          'Failed to load categories'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const startEdit = (category) => {
    setEditingCategory(category);

    setName(category.name || '');
    setImage(category.image || '');

    setMessage('');
    setError('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setImage('');
    setMessage('');
    setError('');
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError(
        'Category name is required'
      );
      return;
    }

    try {
      setMessage('');
      setError('');

      const response = await fetch(
        `http://localhost:8000/api/admin/update-category/${editingCategory.id}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            image: image.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to update category'
        );
      }

      setMessage(
        'Category updated successfully!'
      );

      setEditingCategory(null);
      setName('');
      setImage('');

      await fetchCategories();
    } catch (error) {
      console.error(
        'Update category error:',
        error
      );

      setError(
        error.message ||
          'Failed to update category'
      );
    }
  };

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this category?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage('');
      setError('');

      const response = await fetch(
        `http://localhost:8000/api/admin/delete-category/${categoryId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Failed to delete category'
        );
      }

      setMessage(
        'Category deleted successfully!'
      );

      await fetchCategories();
    } catch (error) {
      console.error(
        'Delete category error:',
        error
      );

      setError(
        error.message ||
          'Failed to delete category'
      );
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Manage Categories</h1>

        <p
          style={{
            color: '#666',
            marginTop: '10px',
          }}
        >
          Loading categories...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Page Heading */}
      <div
        style={{
          marginBottom: '30px',
        }}
      >
        <h1
          style={{
            marginBottom: '10px',
          }}
        >
          Manage Categories
        </h1>

        <p
          style={{
            color: '#666',
          }}
        >
          View, edit, and delete your food
          categories.
        </p>
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
      {editingCategory && (
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
            Edit Category
          </h2>

          <form onSubmit={handleUpdate}>
            {/* Category Name */}
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px',
                }}
              >
                Category Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter category name"
                style={{
                  width: '100%',
                  padding: '13px',
                  border: '1px solid #ccc',
                  borderRadius: '7px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Image URL */}
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontWeight: '600',
                  marginBottom: '8px',
                }}
              >
                Image URL
              </label>

              <input
                type="text"
                value={image}
                onChange={(event) =>
                  setImage(event.target.value)
                }
                placeholder="Enter category image URL"
                style={{
                  width: '100%',
                  padding: '13px',
                  border: '1px solid #ccc',
                  borderRadius: '7px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <button
                type="submit"
                style={{
                  padding: '12px 22px',
                  background: '#ff5722',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Update Category
              </button>

              <button
                type="button"
                onClick={cancelEdit}
                style={{
                  padding: '12px 22px',
                  background: '#777',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories */}
      {categories.length === 0 ? (
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
          }}
        >
          <h2>No Categories Found</h2>

          <p
            style={{
              color: '#666',
              marginTop: '10px',
            }}
          >
            Add a category from the Add
            Category section.
          </p>
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
          {categories.map((category) => (
            <div
              key={category.id}
              style={{
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
            >
              {/* Category Image */}
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                  onError={(event) => {
                    event.currentTarget.style.display =
                      'none';
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '180px',
                    background: '#f2f2f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '50px',
                  }}
                >
                  🍽️
                </div>
              )}

              {/* Category Details */}
              <div
                style={{
                  padding: '20px',
                }}
              >
                <h2
                  style={{
                    marginBottom: '15px',
                  }}
                >
                  {category.name}
                </h2>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  {/* Edit */}
                  <button
                    onClick={() =>
                      startEdit(category)
                    }
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#ff5722',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() =>
                      handleDelete(category.id)
                    }
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      fontWeight: '600',
                    }}
                  >
                    Delete
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