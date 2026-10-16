
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import {
  MdFavorite,
  MdFavoriteBorder,
  MdStar,
  MdShoppingBag,
  MdAdd,
  MdRemove,
} from 'react-icons/md';

const API_URL = 'http://localhost:8000/api';

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');

  const loadWishlistStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setIsWishlisted(false);
        return;
      }

      const result = await response.json();
      const items = result.data || [];

      setIsWishlisted(
        items.some(
          (item) =>
            String(item.product_id) === String(product.id)
        )
      );
    } catch (error) {
      console.error('Error loading wishlist status:', error);
    }
  }, [product.id]);

  // Load cart quantity and wishlist status
  useEffect(() => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem('foodCart')) || [];

      const existingItem = savedCart.find(
        (item) => String(item.id) === String(product.id)
      );

      setQuantity(
        existingItem ? Number(existingItem.quantity) : 0
      );
    } catch (error) {
      console.error('Error loading cart:', error);
    }

    loadWishlistStatus();
  }, [product.id, loadWishlistStatus]);

  // Add or remove product from the saved wishlist
  const handleWishlistToggle = async () => {
    if (wishlistLoading) return;

    setWishlistLoading(true);
    setWishlistMessage('');

    try {
      const response = await fetch(
        isWishlisted
          ? `${API_URL}/wishlist/remove/${encodeURIComponent(product.id)}`
          : `${API_URL}/wishlist/add`,
        {
          method: isWishlisted ? 'DELETE' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          ...(isWishlisted
            ? {}
            : {
                body: JSON.stringify({
                  product_id: product.id,
                }),
              }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Could not update wishlist. Please sign in and try again.'
        );
      }

      setIsWishlisted(!isWishlisted);
      setWishlistMessage(
        isWishlisted
          ? 'Removed from wishlist'
          : 'Added to wishlist'
      );

      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      setWishlistMessage(error.message);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Update cart
  const updateCart = (newQuantity) => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem('foodCart')) || [];

      const updatedCart = [...savedCart];

      const existingItemIndex = updatedCart.findIndex(
        (item) => String(item.id) === String(product.id)
      );

      if (newQuantity <= 0) {
        if (existingItemIndex !== -1) {
          updatedCart.splice(existingItemIndex, 1);
        }
      } else {
        const cartItem = {
          id: product.id,
          title: product.title,
          category: product.category,
          price: Number(product.price),
          quantity: newQuantity,
          image: product.image,
        };

        if (existingItemIndex !== -1) {
          updatedCart[existingItemIndex] = cartItem;
        } else {
          updatedCart.push(cartItem);
        }
      }

      localStorage.setItem(
        'foodCart',
        JSON.stringify(updatedCart)
      );

      setQuantity(newQuantity > 0 ? newQuantity : 0);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleAddToCart = () => updateCart(1);
  const handleIncrease = () => updateCart(quantity + 1);
  const handleDecrease = () => updateCart(quantity - 1);

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#fff',
        height: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          height: '220px',
          overflow: 'hidden',
        }}
      >
        <img
          src={product.image}
          alt={product.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          aria-label={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          title={
            isWishlisted
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: '#fff',
            cursor: wishlistLoading ? 'wait' : 'pointer',
            fontSize: '22px',
            opacity: wishlistLoading ? 0.6 : 1,
          }}
        >
          {isWishlisted ? (
            <MdFavorite style={{ color: 'red' }} />
          ) : (
            <MdFavoriteBorder />
          )}
        </button>

        <span
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: '#ff5722',
            color: '#fff',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '12px',
          }}
        >
          {product.category}
        </span>
      </div>

      {wishlistMessage && (
        <p
          role="status"
          style={{
            margin: 0,
            padding: '7px 12px',
            background: '#fff3e0',
            color: '#8a3b00',
            fontSize: '13px',
            overflowWrap: 'anywhere',
          }}
        >
          {wishlistMessage}
        </p>
      )}

      <div style={{ padding: '15px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            marginBottom: '8px',
          }}
        >
          <MdStar style={{ color: '#ffc107' }} />
          <span>{product.rating}</span>
          <span style={{ color: '#777' }}>
            ({product.reviewsCount} reviews)
          </span>
        </div>

        <Link
          href={`/product/${product.id}`}
          style={{
            textDecoration: 'none',
            color: '#222',
          }}
        >
          <h3>{product.title}</h3>
        </Link>

        <p style={{ color: '#666' }}>
          {product.description}
        </p>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            marginTop: '15px',
          }}
        >
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '12px',
                color: '#777',
              }}
            >
              Price
            </span>

            <strong>
              ₹{Number(product.price).toFixed(2)}
            </strong>
          </div>

          {quantity === 0 ? (
            <button
              type="button"
              onClick={handleAddToCart}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                border: 'none',
                background: '#ff5722',
                color: '#fff',
                padding: '10px 15px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '15px',
              }}
            >
              <MdShoppingBag />
              Add to Cart
            </button>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ff5722',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={handleDecrease}
                aria-label="Decrease quantity"
                style={{
                  width: '40px',
                  height: '42px',
                  border: 'none',
                  background: '#ff5722',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MdRemove />
              </button>

              <span
                style={{
                  minWidth: '35px',
                  textAlign: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrease}
                aria-label="Increase quantity"
                style={{
                  width: '40px',
                  height: '42px',
                  border: 'none',
                  background: '#ff5722',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MdAdd />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
