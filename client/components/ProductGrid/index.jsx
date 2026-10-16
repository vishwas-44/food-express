'use client';

import { useEffect, useState } from 'react';
import ProductCard from '../ProductCard';

export default function ProductGrid({
  selectedCategory,
}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          productsResponse,
          categoriesResponse,
        ] = await Promise.all([
          fetch(
            'http://localhost:8000/api/admin/products'
          ),
          fetch(
            'http://localhost:8000/api/admin/categories'
          ),
        ]);

        const productsData =
          await productsResponse.json();

        const categoriesData =
          await categoriesResponse.json();

        if (!productsResponse.ok) {
          throw new Error(
            productsData.message ||
              'Failed to fetch products'
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.message ||
              'Failed to fetch categories'
          );
        }

        setProducts(
          productsData.data || []
        );

        setCategories(
          categoriesData.data || []
        );
      } catch (error) {
        console.error(
          'Fetch products/categories error:',
          error
        );

        setError(
          'Unable to load products.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedCategoryData =
    categories.find(
      (category) =>
        String(category.id) ===
        String(selectedCategory)
    );

  const selectedCategoryName =
    selectedCategoryData?.name || '';

  const filteredProducts =
    selectedCategory === 'all'
      ? products
      : products.filter((product) => {
          const productCategory =
            String(
              product.category || ''
            )
              .trim()
              .toLowerCase();

          const selectedId =
            String(
              selectedCategory || ''
            )
              .trim()
              .toLowerCase();

          const selectedName =
            String(
              selectedCategoryName || ''
            )
              .trim()
              .toLowerCase();

          return (
            productCategory === selectedId ||
            productCategory === selectedName
          );
        });

  return (
    <section
      style={{
        padding: '40px 20px',
      }}
    >
      <div>
        {/* Heading */}
        <div
          style={{
            marginBottom: '25px',
          }}
        >
          <h2>Popular Dishes</h2>

          <p>
            Select your favourite meals and
            order online
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              padding: '30px 0',
              color: '#666',
            }}
          >
            Loading products...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              padding: '20px',
              background: '#ffebee',
              color: '#c62828',
              borderRadius: '8px',
            }}
          >
            {error}
          </div>
        )}

        {/* No Products */}
        {!loading &&
          !error &&
          filteredProducts.length === 0 && (
            <div
              style={{
                padding: '30px 0',
                color: '#666',
              }}
            >
              No products found in this
              category.
            </div>
          )}

        {/* Products */}
        {!loading &&
          !error &&
          filteredProducts.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
              }}
            >
              {filteredProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                )
              )}
            </div>
          )}
      </div>
    </section>
  );
}