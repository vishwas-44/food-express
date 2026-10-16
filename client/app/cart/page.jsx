
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Tooltip from '@mui/material/Tooltip';

import {
  MdDeleteOutline,
  MdArrowForward,
  MdOutlineShoppingBag,
  MdAdd,
  MdRemove,
} from 'react-icons/md';

const API_URL = 'http://localhost:8000/api';

export default function CartPage() {
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponMessageType, setCouponMessageType] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem('foodCart')) || [];

      setCartItems(savedCart);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem('foodCart', JSON.stringify(cartItems));
  }, [cartItems, isLoaded]);

  const clearAppliedCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponMessage('');
    setCouponMessageType('');
  };

  const handleIncrease = (id) => {
    clearAppliedCoupon();

    setCartItems((prev) =>
      prev.map((item) =>
        String(item.id) === String(id)
          ? {
              ...item,
              quantity: Number(item.quantity) + 1,
            }
          : item
      )
    );
  };

  const handleDecrease = (id) => {
    clearAppliedCoupon();

    setCartItems((prev) =>
      prev
        .map((item) =>
          String(item.id) === String(id)
            ? {
                ...item,
                quantity: Number(item.quantity) - 1,
              }
            : item
        )
        .filter((item) => Number(item.quantity) > 0)
    );
  };

  const handleRemove = (id) => {
    clearAppliedCoupon();

    setCartItems((prev) =>
      prev.filter(
        (item) => String(item.id) !== String(id)
      )
    );
  };

  const subtotal = cartItems.reduce(
    (acc, item) =>
      acc + Number(item.price) * Number(item.quantity),
    0
  );

  const FREE_DELIVERY_THRESHOLD = 499;

  const shippingFee =
  subtotal <= 0
    ? 0
    : subtotal >= FREE_DELIVERY_THRESHOLD
      ? 0
      : 40;

  const tax = subtotal * 0.08;
  const grandTotal = Math.max(
    0,
    subtotal + shippingFee + tax - discount
  );

  const handleApplyCoupon = async (e) => {
    e.preventDefault();

    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponMessage('Please enter a coupon code.');
      setCouponMessageType('error');
      return;
    }

    if (cartItems.length === 0 || subtotal <= 0) {
      setCouponMessage('Your cart is empty.');
      setCouponMessageType('error');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponMessage('');
    setCouponMessageType('');

    try {
      const response = await fetch(
        `${API_URL}/coupon/validate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code,
            orderAmount: Number(subtotal.toFixed(2)),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        clearAppliedCoupon();
        setCouponMessage(
          data.message || 'Unable to apply this coupon.'
        );
        setCouponMessageType('error');
        return;
      }

      setDiscount(Number(data.discount) || 0);
      setAppliedCoupon(data.coupon);
      setCouponCode(data.coupon.code);
      setCouponMessage(
        `Coupon ${data.coupon.code} applied successfully!`
      );
      setCouponMessageType('success');
    } catch (error) {
      console.error('Coupon validation error:', error);
      clearAppliedCoupon();
      setCouponMessage(
        'Unable to connect to the server. Please try again.'
      );
      setCouponMessageType('error');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    clearAppliedCoupon();
    setCouponCode('');
  };

  
const handleCheckout = () => {
  if (cartItems.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  if (appliedCoupon) {
    sessionStorage.setItem(
      'appliedCoupon',
      JSON.stringify({
        code: appliedCoupon.code,
      })
    );
  } else {
    sessionStorage.removeItem('appliedCoupon');
  }

  router.push('/checkout');
};


  if (!isLoaded) {
    return (
      <main style={{ paddingTop: '120px', paddingBottom: '60px' }}>
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '30px 20px',
          }}
        >
          <h1>Shopping Cart</h1>
          <p>Loading cart...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        paddingTop: '100px',
        paddingBottom: '60px',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px 20px',
        }}
      >
        <h1 style={{ marginBottom: '30px' }}>
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              border: '1px solid #ddd',
              borderRadius: '12px',
              background: '#fff',
            }}
          >
            <div
              style={{
                fontSize: '60px',
                marginBottom: '20px',
              }}
            >
              🛒
            </div>

            <h2>Your cart is empty</h2>

            <p
              style={{
                color: '#666',
                marginBottom: '25px',
              }}
            >
              Looks like you haven&apos;t added any food
              items to your cart yet.
            </p>

            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ff5722',
                color: '#fff',
                padding: '12px 20px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              <MdOutlineShoppingBag />
              Explore Menu
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 350px',
              gap: '30px',
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '15px',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                }}
              >
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Subtotal</span>
              </div>

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '20px 15px',
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{
                        width: '90px',
                        height: '90px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />

                    <div>
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#ff5722',
                        }}
                      >
                        {item.category}
                      </span>

                      <h3
                        style={{
                          margin: '5px 0 10px',
                          fontSize: '17px',
                        }}
                      >
                        {item.title}
                      </h3>

                      <Tooltip title="Remove item">
                        <button
                          type="button"
                          onClick={() => handleRemove(item.id)}
                          aria-label={`Remove ${item.title}`}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#d32f2f',
                            cursor: 'pointer',
                            fontSize: '22px',
                            padding: 0,
                          }}
                        >
                          <MdDeleteOutline />
                        </button>
                      </Tooltip>
                    </div>
                  </div>

                  <div>
                    ₹{Number(item.price).toFixed(2)}
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleDecrease(item.id)}
                        aria-label="Decrease quantity"
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '1px solid #ddd',
                          background: '#fff',
                          cursor: 'pointer',
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MdRemove />
                      </button>

                      <span
                        style={{
                          minWidth: '20px',
                          textAlign: 'center',
                        }}
                      >
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleIncrease(item.id)}
                        aria-label="Increase quantity"
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '1px solid #ddd',
                          background: '#fff',
                          cursor: 'pointer',
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MdAdd />
                      </button>
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#777',
                      }}
                    >
                      Total:
                    </span>

                    <strong>
                      ₹
                      {(
                        Number(item.price) *
                        Number(item.quantity)
                      ).toFixed(2)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                position: 'sticky',
                top: '110px',
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '25px',
                background: '#fff',
              }}
            >
              <h2 style={{ marginBottom: '25px' }}>
                Order Summary
              </h2>

              <form
                onSubmit={handleApplyCoupon}
                style={{ marginBottom: '25px' }}
              >
                <label
                  htmlFor="couponCode"
                  style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: 'bold',
                  }}
                >
                  Promo Code
                </label>

                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                  }}
                >
                  <input
                    id="couponCode"
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);

                      if (appliedCoupon) {
                        clearAppliedCoupon();
                      }
                    }}
                    disabled={isApplyingCoupon}
                    style={{
                      flex: 1,
                      minWidth: 0,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                    }}
                  />

                  <button
                    type="submit"
                    disabled={isApplyingCoupon}
                    style={{
                      padding: '10px 15px',
                      border: 'none',
                      background: '#ff5722',
                      color: '#fff',
                      borderRadius: '5px',
                      cursor: isApplyingCoupon
                        ? 'not-allowed'
                        : 'pointer',
                      opacity: isApplyingCoupon ? 0.7 : 1,
                    }}
                  >
                    {isApplyingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>

                {couponMessage && (
                  <p
                    role="status"
                    style={{
                      marginTop: '10px',
                      marginBottom: 0,
                      fontSize: '14px',
                      color:
                        couponMessageType === 'success'
                          ? '#2e7d32'
                          : '#d32f2f',
                    }}
                  >
                    {couponMessage}
                  </p>
                )}

                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      marginTop: '8px',
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      color: '#d32f2f',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Remove coupon
                  </button>
                )}
              </form>

              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                  }}
                >
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                  }}
                >
                  <span>Delivery Fee</span>
                  <span
                    style={{
                      color: shippingFee === 0 && subtotal > 0 ? '#2e7d32' : 'inherit',
                      fontWeight: shippingFee === 0 && subtotal > 0 ? 'bold' : 'normal',
                    }}
                  >
                    {shippingFee === 0 && subtotal > 0
                      ? 'FREE'
                      : `₹${shippingFee.toFixed(2)}`}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '15px',
                  }}
                >
                  <span>Estimated Tax (8%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '15px',
                      color: '#2e7d32',
                    }}
                  >
                    <span>
                      Discount
                      {appliedCoupon
                        ? ` (${appliedCoupon.code})`
                        : ''}
                    </span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <hr />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '20px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                  }}
                >
                  <span>Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                style={{
                  width: '100%',
                  marginTop: '25px',
                  padding: '14px',
                  border: 'none',
                  background: '#ff5722',
                  color: '#fff',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                Proceed to Checkout
                <MdArrowForward />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
