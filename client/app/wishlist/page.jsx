
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MdFavorite,
  MdShoppingBag,
  MdDeleteOutline,
  MdArrowBack,
  MdAdd,
  MdRemove,
} from 'react-icons/md';

const API_URL = 'http://localhost:8000/api';

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const loadCart = useCallback(() => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem('foodCart')) || [];
      setCart(savedCart);
    } catch (err) {
      console.error('Error loading cart:', err);
      setCart([]);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        method: 'GET',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Unable to load wishlist.');
      }

      setWishlist(
        (result.data || [])
          .map((item) => ({
            ...item.products,
            wishlistId: item.id,
            productId: item.product_id,
          }))
          .filter((item) => item.id)
      );
    } catch (err) {
      setError(err.message || 'Unable to load wishlist.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
    loadCart();

    const handleCartUpdated = () => loadCart();

    window.addEventListener('cartUpdated', handleCartUpdated);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdated);
    };
  }, [fetchWishlist, loadCart]);

  const getQuantity = (productId) => {
    const item = cart.find(
      (entry) => String(entry.id) === String(productId)
    );

    return item ? Number(item.quantity) : 0;
  };

  const updateCart = (product, newQuantity) => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem('foodCart')) || [];

      const updatedCart = [...savedCart];
      const index = updatedCart.findIndex(
        (item) => String(item.id) === String(product.id)
      );

      if (newQuantity <= 0) {
        if (index !== -1) updatedCart.splice(index, 1);
      } else {
        const cartItem = {
          id: product.id,
          title: product.title,
          category: product.category,
          price: Number(product.price),
          quantity: newQuantity,
          image: product.image,
        };

        if (index !== -1) {
          updatedCart[index] = cartItem;
        } else {
          updatedCart.push(cartItem);
        }
      }

      localStorage.setItem('foodCart', JSON.stringify(updatedCart));
      setCart(updatedCart);
      window.dispatchEvent(new Event('cartUpdated'));

      setMessage(
        newQuantity <= 0
          ? `${product.title} removed from cart.`
          : `${product.title} cart quantity updated.`
      );
      setError('');
    } catch (err) {
      setError('Unable to update your cart.');
    }
  };

  const removeFromWishlist = async (productId) => {
    setRemovingId(productId);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `${API_URL}/wishlist/remove/${encodeURIComponent(productId)}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Could not remove product.');
      }

      setWishlist((items) =>
        items.filter((item) => String(item.id) !== String(productId))
      );

      setMessage('Product removed from your wishlist.');
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (err) {
      setError(err.message || 'Could not remove product.');
    } finally {
      setRemovingId(null);
    }
  };

  const formatPrice = (price) =>
    `₹${Number(price || 0).toFixed(2)}`;

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f8f8f8',
        padding: '115px 20px 60px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Link
          href="/menu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#555',
            textDecoration: 'none',
            marginBottom: '20px',
          }}
        >
          <MdArrowBack size={20} />
          Continue shopping
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '25px',
          }}
        >
          <MdFavorite size={32} color="#ff5722" />
          <div>
            <h1 style={{ margin: 0, color: '#222' }}>My Wishlist</h1>
            <p style={{ margin: '5px 0 0', color: '#777' }}>
              Your favourite food, all in one place
            </p>
          </div>
        </div>

        {message && (
          <div
            role="status"
            style={{
              background: '#e8f5e9',
              color: '#256029',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              background: '#ffebee',
              color: '#b71c1c',
              padding: '12px 15px',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '70px 20px' }}>
            Loading your wishlist...
          </div>
        ) : wishlist.length === 0 ? (
          <div
            style={{
              background: '#fff',
              padding: '55px 20px',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <MdFavorite size={65} color="#ddd" />
            <h2 style={{ color: '#333', marginTop: '15px' }}>
              Your wishlist is empty
            </h2>
            <p style={{ color: '#777' }}>
              Browse the menu and save the food you love.
            </p>
            <Link
              href="/menu"
              style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '12px 22px',
                background: '#ff5722',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '7px',
                fontWeight: '600',
              }}
            >
              Explore Menu
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '22px',
            }}
          >
            {wishlist.map((product) => {
              const quantity = getQuantity(product.id);

              return (
                <article
                  key={product.id}
                  style={{
                    background: '#fff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #eee',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  }}
                >
                  <Link href={`/product/${product.id}`}>
                    <img
                      src={product.image || '/placeholder.png'}
                      alt={product.title || 'Food product'}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                      }}
                    />
                  </Link>

                  <div style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px', color: '#222' }}>
                      {product.title}
                    </h3>

                    <p
                      style={{
                        color: '#777',
                        fontSize: '14px',
                        minHeight: '40px',
                        margin: '0 0 12px',
                      }}
                    >
                      {product.description || product.category || ''}
                    </p>

                    <strong
                      style={{
                        display: 'block',
                        fontSize: '18px',
                        marginBottom: '15px',
                        color: '#222',
                      }}
                    >
                      {formatPrice(product.price)}
                    </strong>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {quantity === 0 ? (
                        <button
                          type="button"
                          onClick={() => updateCart(product, 1)}
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px',
                            border: 'none',
                            borderRadius: '6px',
                            background: '#ff5722',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '15px',
                          }}
                        >
                          <MdShoppingBag size={19} />
                          Add to Cart
                        </button>
                      ) : (
                        <div
                          style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: '#ff5722',
                            color: '#fff',
                            borderRadius: '6px',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => updateCart(product, quantity - 1)}
                            aria-label="Decrease quantity"
                            style={quantityButtonStyle}
                          >
                            <MdRemove size={21} />
                          </button>

                          <span style={{ fontWeight: 'bold' }}>
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => updateCart(product, quantity + 1)}
                            aria-label="Increase quantity"
                            style={quantityButtonStyle}
                          >
                            <MdAdd size={21} />
                          </button>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFromWishlist(product.id)}
                        disabled={removingId === product.id}
                        aria-label={`Remove ${product.title} from wishlist`}
                        title="Remove from wishlist"
                        style={{
                          width: '44px',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#d32f2f',
                          cursor: 'pointer',
                        }}
                      >
                        <MdDeleteOutline size={22} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

const quantityButtonStyle = {
  width: '44px',
  height: '44px',
  border: 'none',
  background: '#ff5722',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
