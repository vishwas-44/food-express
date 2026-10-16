'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MdAdd,
  MdCheckCircle,
  MdLocalShipping,
  MdLocationOn,
} from 'react-icons/md';

const API_URL = 'http://localhost:8000';

const EMPTY_ADDRESS = {
  address_line1: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
  mobile: '',
  landmark: '',
  address_type: 'Home',
};

const money = (amount) => Number(amount || 0).toFixed(2);

export default function CheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [address, setAddress] = useState(EMPTY_ADDRESS);

  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [deliveryQuote, setDeliveryQuote] = useState(null);
  const [deliveryQuoteLoading, setDeliveryQuoteLoading] = useState(false);
  const [deliveryQuoteMessage, setDeliveryQuoteMessage] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const tax = subtotal * 0.08;
  const shippingFee = deliveryQuote?.deliveryFee ?? 0;

  const grandTotal = Math.max(
    0,
    subtotal + shippingFee + tax - couponDiscount
  );

  const fieldStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    boxSizing: 'border-box',
    background: '#fff',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '7px',
    fontWeight: 'bold',
  };

  const priceRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '12px',
    color: '#555',
  };

  // Load cart and coupon.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('foodCart');

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
      }

      const savedCoupon = sessionStorage.getItem('appliedCoupon');

      if (savedCoupon) {
        const parsedCoupon = JSON.parse(savedCoupon);
        setAppliedCoupon(
          parsedCoupon?.code ? parsedCoupon : null
        );
      }
    } catch (error) {
      console.error('Cart or coupon loading error:', error);
      setCartItems([]);
      setAppliedCoupon(null);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  // Fetch saved addresses.
  useEffect(() => {
    let cancelled = false;

    async function fetchAddresses() {
      setAddressesLoading(true);

      try {
        const response = await fetch(
          `${API_URL}/api/address/my-addresses`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Unable to load saved addresses.'
          );
        }

        const addresses = Array.isArray(data.data)
          ? data.data
          : [];

        if (cancelled) return;

        setSavedAddresses(addresses);

        const defaultAddress =
          addresses.find((item) => item.is_default === true) ||
          addresses[0];

        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);

          setAddress({
            address_line1: defaultAddress.address_line1 || '',
            city: defaultAddress.city || '',
            state: defaultAddress.state || '',
            pincode: defaultAddress.pincode || '',
            country: defaultAddress.country || 'India',
            mobile: defaultAddress.mobile || '',
            landmark: defaultAddress.landmark || '',
            address_type: defaultAddress.address_type || 'Home',
          });
        }
      } catch (error) {
        if (!cancelled) {
          setSavedAddresses([]);
          console.error('Address loading error:', error);
        }
      } finally {
        if (!cancelled) {
          setAddressesLoading(false);
        }
      }
    }

    fetchAddresses();

    return () => {
      cancelled = true;
    };
  }, []);

  // Calculate delivery fee and ETA whenever the address or subtotal changes.
  useEffect(() => {
    if (!cartLoaded) return;

    const {
      address_line1,
      city,
      state,
      pincode,
      country,
    } = address;

    if (
      !address_line1.trim() ||
      !city.trim() ||
      !state.trim() ||
      !pincode.trim() ||
      !country.trim()
    ) {
      setDeliveryQuote(null);
      setDeliveryQuoteMessage('');
      setDeliveryQuoteLoading(false);
      return;
    }


    let cancelled = false;

    const timer = setTimeout(async () => {
      setDeliveryQuote(null);
      setDeliveryQuoteLoading(true);
      setDeliveryQuoteMessage('Calculating delivery fee...');

      try {
        const geocodeResponse = await fetch(
          `${API_URL}/api/delivery/geocode`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address_line1,
              city,
              state,
              pincode,
              country,
            }),
          }
        );

        const geocodeData = await geocodeResponse.json();

        if (!geocodeResponse.ok) {
          throw new Error(
            geocodeData.message ||
              'Could not locate your delivery address.'
          );
        }

        const { latitude, longitude } = geocodeData.data;

        const quoteResponse = await fetch(
          `${API_URL}/api/delivery/quote`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subtotal,
              latitude,
              longitude,
            }),
          }
        );

        const quoteData = await quoteResponse.json();

        if (!quoteResponse.ok) {
          throw new Error(
            quoteData.message ||
              'Unable to calculate delivery fee.'
          );
        }

        if (!cancelled) {
          setDeliveryQuote({
            ...quoteData.data,
            latitude,
            longitude,
          });

          setDeliveryQuoteMessage(
            `Delivery distance: ${quoteData.data.distanceKm} km`
          );
        }
      } catch (error) {
        if (!cancelled) {
          setDeliveryQuote(null);
          setDeliveryQuoteMessage(error.message);
        }
      } finally {
        if (!cancelled) {
          setDeliveryQuoteLoading(false);
        }
      }
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    cartLoaded,
    subtotal,
    address.address_line1,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]);

  // Revalidate coupon.
  useEffect(() => {
    if (!cartLoaded) return;

    if (!appliedCoupon?.code || subtotal <= 0) {
      setCouponDiscount(0);
      setCouponMessage('');
      setCouponLoading(false);
      return;
    }

    let cancelled = false;

    async function validateCoupon() {
      setCouponLoading(true);
      setCouponMessage('');

      try {
        const response = await fetch(
          `${API_URL}/api/coupon/validate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: appliedCoupon.code,
              orderAmount: subtotal,
            }),
          }
        );

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setCouponDiscount(0);
          setCouponMessage(
            data.message || 'This coupon is no longer valid.'
          );
          return;
        }

        const discount = Math.min(
          subtotal,
          Math.max(0, Number(data.discount || 0))
        );

        setCouponDiscount(discount);
        setCouponMessage(
          `Coupon ${data.coupon?.code || appliedCoupon.code} applied successfully.`
        );
      } catch (error) {
        if (!cancelled) {
          setCouponDiscount(0);
          setCouponMessage(
            'Could not validate the coupon. Please try again.'
          );
          console.error('Coupon validation error:', error);
        }
      } finally {
        if (!cancelled) {
          setCouponLoading(false);
        }
      }
    }

    validateCoupon();

    return () => {
      cancelled = true;
    };
  }, [cartLoaded, appliedCoupon?.code, subtotal]);

  const handleSelectAddress = (savedAddress) => {
    setSelectedAddressId(savedAddress.id);

    setAddress({
      address_line1: savedAddress.address_line1 || '',
      city: savedAddress.city || '',
      state: savedAddress.state || '',
      pincode: savedAddress.pincode || '',
      country: savedAddress.country || 'India',
      mobile: savedAddress.mobile || '',
      landmark: savedAddress.landmark || '',
      address_type: savedAddress.address_type || 'Home',
    });
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setAddress({ ...EMPTY_ADDRESS });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSelectedAddressId(null);

    setAddress((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponMessage('');

    try {
      sessionStorage.removeItem('appliedCoupon');
    } catch (error) {
      console.error('Unable to remove saved coupon:', error);
    }
  };

  // Place order.
  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      router.push('/cart');
      return;
    }

    if (
      !address.address_line1.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim() ||
      !address.country.trim() ||
      !address.mobile.trim()
    ) {
      alert('Please select or enter a complete delivery address.');
      return;
    }


    if (deliveryQuoteLoading || !deliveryQuote) {
      alert(
        deliveryQuoteMessage ||
          'Please wait for your delivery fee to be calculated.'
      );
      return;
    }

    if (couponLoading) {
      alert('Please wait while your coupon is being validated.');
      return;
    }

    if (
      appliedCoupon?.code &&
      couponMessage.startsWith('Could not')
    ) {
      alert(
        'Please try validating your coupon again before ordering.'
      );
      return;
    }

    setLoading(true);

    try {
      const products = cartItems.map((item) => ({
        product_id: item.id,
        product_title: item.title,
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

      const response = await fetch(
        `${API_URL}/api/order/create-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            products,
            delivery_address: {
              ...address,
              latitude: deliveryQuote.latitude,
              longitude: deliveryQuote.longitude,
            },
            coupon_code: appliedCoupon?.code || null,
            payment_status: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to place order.');
        return;
      }

      localStorage.removeItem('foodCart');
      sessionStorage.removeItem('appliedCoupon');

      alert('Order placed successfully!');
      router.push('/orders');
    } catch (error) {
      console.error('Order error:', error);
      alert('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        paddingTop: '100px',
        paddingBottom: '60px',
        background: '#f7f7f7',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px 20px',
        }}
      >
        <h1 style={{ marginBottom: '10px' }}>Checkout</h1>

        <p style={{ color: '#666', marginBottom: '30px' }}>
          Select your delivery address and place your order.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'minmax(0, 1fr) minmax(300px, 350px)',
            gap: '30px',
            alignItems: 'start',
          }}
        >
          {/* Delivery address */}
          <section
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '30px',
              minWidth: 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '25px',
              }}
            >
              <MdLocalShipping
                style={{ fontSize: '28px', color: '#ff5722' }}
              />
              <h2 style={{ margin: 0 }}>Delivery Address</h2>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '15px',
                  flexWrap: 'wrap',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  Saved Addresses
                </h3>

                <button
                  type="button"
                  onClick={() => router.push('/profile/address/add')}
                  style={{
                    border: 'none',
                    background: '#fff3ed',
                    color: '#ff5722',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <MdAdd />
                  Add New
                </button>
              </div>

              {addressesLoading ? (
                <p style={{ color: '#666' }}>
                  Loading saved addresses...
                </p>
              ) : savedAddresses.length === 0 ? (
                <div
                  style={{
                    padding: '20px',
                    border: '1px dashed #ccc',
                    borderRadius: '8px',
                    color: '#666',
                    textAlign: 'center',
                  }}
                >
                  <p>
                    No saved addresses found. Enter your address below.
                  </p>

                  <button
                    type="button"
                    onClick={() => router.push('/profile/address/add')}
                    style={{
                      border: 'none',
                      background: '#ff5722',
                      color: '#fff',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    Add Delivery Address
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {savedAddresses.map((savedAddress) => {
                    const isSelected =
                      selectedAddressId === savedAddress.id;

                    return (
                      <button
                        key={savedAddress.id}
                        type="button"
                        onClick={() =>
                          handleSelectAddress(savedAddress)
                        }
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          border: isSelected
                            ? '2px solid #ff5722'
                            : '1px solid #ddd',
                          background: isSelected
                            ? '#fff8f4'
                            : '#fff',
                          borderRadius: '10px',
                          padding: '16px',
                          cursor: 'pointer',
                          color: '#222',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <strong
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '7px',
                            }}
                          >
                            <MdLocationOn
                              style={{
                                color: '#ff5722',
                                fontSize: '20px',
                              }}
                            />
                            {savedAddress.address_type || 'Home'}
                          </strong>

                          {savedAddress.is_default && (
                            <span
                              style={{
                                background: '#e8f5e9',
                                color: '#2e7d32',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                              }}
                            >
                              Default
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            marginTop: '10px',
                            color: '#555',
                            lineHeight: '1.6',
                            fontSize: '14px',
                          }}
                        >
                          <div>{savedAddress.address_line1}</div>
                          <div>
                            {savedAddress.city}, {savedAddress.state}{' '}
                            {savedAddress.pincode}
                          </div>
                          <div>{savedAddress.country}</div>
                          <div>Mobile: {savedAddress.mobile}</div>

                          {savedAddress.landmark && (
                            <div>
                              Landmark: {savedAddress.landmark}
                            </div>
                          )}

                          {isSelected && (
                            <div
                              style={{
                                marginTop: '10px',
                                color: '#ff5722',
                                fontWeight: 'bold',
                                fontSize: '13px',
                              }}
                            >
                              ✓ Selected for this order
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <form onSubmit={handlePlaceOrder}>
              <div
                style={{
                  borderTop: '1px solid #eee',
                  paddingTop: '25px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '18px' }}>
                    Delivery Address for This Order
                  </h3>

                  {selectedAddressId && (
                    <button
                      type="button"
                      onClick={handleUseNewAddress}
                      style={{
                        border: '1px solid #ff5722',
                        background: '#fff',
                        color: '#ff5722',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      Enter New Address
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Address</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={address.address_line1}
                    onChange={handleChange}
                    placeholder="House No, Street, Area"
                    required
                    style={fieldStyle}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '15px',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <label style={labelStyle}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={address.city}
                      onChange={handleChange}
                      placeholder="City"
                      required
                      style={fieldStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>State</label>
                    <input
                      type="text"
                      name="state"
                      value={address.state}
                      onChange={handleChange}
                      placeholder="State"
                      required
                      style={fieldStyle}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '15px',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <label style={labelStyle}>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleChange}
                      placeholder="Pincode"
                      required
                      style={fieldStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Mobile</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={address.mobile}
                      onChange={handleChange}
                      placeholder="Mobile number"
                      required
                      style={fieldStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={address.country}
                    onChange={handleChange}
                    required
                    style={fieldStyle}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={address.landmark}
                    onChange={handleChange}
                    placeholder="Nearby landmark"
                    style={fieldStyle}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={labelStyle}>Address Type</label>
                  <select
                    name="address_type"
                    value={address.address_type}
                    onChange={handleChange}
                    style={fieldStyle}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    cartItems.length === 0 ||
                    couponLoading ||
                    deliveryQuoteLoading ||
                    !deliveryQuote
                  }
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: 'none',
                    borderRadius: '7px',
                    background:
                      loading ||
                      cartItems.length === 0 ||
                      couponLoading ||
                      deliveryQuoteLoading ||
                      !deliveryQuote
                        ? '#aaa'
                        : '#ff5722',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor:
                      loading ||
                      cartItems.length === 0 ||
                      couponLoading ||
                      deliveryQuoteLoading ||
                      !deliveryQuote
                        ? 'not-allowed'
                        : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <MdCheckCircle />
                  {loading
                    ? 'Placing Order...'
                    : couponLoading
                      ? 'Validating Coupon...'
                      : deliveryQuoteLoading
                        ? 'Calculating Delivery...'
                        : 'Place Order'}
                </button>
              </div>
            </form>
          </section>

          {/* Order summary */}
          <aside
            style={{
              position: 'sticky',
              top: '110px',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '25px',
              minWidth: 0,
            }}
          >
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
              Order Summary
            </h2>

            <div style={{ marginBottom: '20px' }}>
              {cartItems.length === 0 ? (
                <p style={{ color: '#777' }}>Your cart is empty.</p>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={item.id || index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '10px 0',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>
                        {item.title}
                      </div>
                      <div
                        style={{
                          fontSize: '13px',
                          color: '#777',
                          marginTop: '4px',
                        }}
                      >
                        Qty: {item.quantity}
                      </div>
                    </div>

                    <div
                      style={{
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ₹
                      {money(
                        Number(item.price || 0) *
                          Number(item.quantity || 0)
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Applied coupon */}
            {appliedCoupon?.code && (
              <div
                style={{
                  border: '1px solid #c8e6c9',
                  background: '#f1f8e9',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <strong style={{ color: '#2e7d32' }}>
                    Coupon: {appliedCoupon.code}
                  </strong>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#c62828',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    Remove
                  </button>
                </div>

                <p
                  style={{
                    fontSize: '13px',
                    margin: '6px 0 0',
                    color: couponMessage.includes('successfully')
                      ? '#2e7d32'
                      : '#666',
                  }}
                >
                  {couponLoading
                    ? 'Validating coupon...'
                    : couponMessage}
                </p>
              </div>
            )}

            {/* Payment method */}
            <div
              style={{
                borderTop: '1px solid #eee',
                paddingTop: '20px',
                marginBottom: '20px',
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: '10px',
                  fontSize: '17px',
                }}
              >
                Payment Method
              </h3>

              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
                style={fieldStyle}
              >
                <option value="Cash on Delivery">
                  Cash on Delivery
                </option>
                <option value="UPI">UPI</option>
                <option value="Credit / Debit Card">
                  Credit / Debit Card
                </option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>

            {/* Price details */}
            <div
              style={{
                borderTop: '1px solid #eee',
                paddingTop: '20px',
              }}
            >
              <div style={priceRowStyle}>
                <span>Subtotal</span>
                <span>₹{money(subtotal)}</span>
              </div>

              <div style={priceRowStyle}>
                <span>Delivery Fee</span>
                <span>
                  {deliveryQuote?.isFreeDelivery && subtotal > 0
                    ? 'FREE'
                    : `₹${money(shippingFee)}`}
                </span>
              </div>

              <div style={priceRowStyle}>
                <span>Tax (8%)</span>
                <span>₹{money(tax)}</span>
              </div>

              {couponDiscount > 0 && (
                <div
                  style={{
                    ...priceRowStyle,
                    color: '#2e7d32',
                  }}
                >
                  <span>Coupon Discount</span>
                  <span>- ₹{money(couponDiscount)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  paddingTop: '15px',
                  borderTop: '1px solid #ddd',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }}
              >
                <span>Total</span>
                <span style={{ color: '#ff5722' }}>
                  ₹{money(grandTotal)}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                padding: '12px',
                background: '#fff8f4',
                borderRadius: '8px',
                color: '#555',
                fontSize: '14px',
              }}
            >
              <strong>Estimated Delivery:</strong>
              <br />
              {deliveryQuoteLoading
                ? 'Calculating delivery time...'
                : deliveryQuote
                  ? `${deliveryQuote.estimatedDeliveryMinutes} minutes`
                  : 'Enter a complete address to calculate delivery'}

              <p style={{ marginBottom: 0, fontSize: '13px' }}>
                {deliveryQuoteMessage}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}