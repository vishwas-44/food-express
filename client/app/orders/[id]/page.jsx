'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          'http://localhost:8000/api/order/my-orders',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || 'Failed to fetch order details.'
          );
          return;
        }

        const foundOrder = (data.data || []).find(
          (item) => String(item.id) === String(orderId)
        );

        if (!foundOrder) {
          setError('Order not found.');
          return;
        }

        setOrder(foundOrder);
      } catch (error) {
        console.error('Order details error:', error);

        setError(
          'Unable to connect to the server.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'Date unavailable';
    }

    return new Date(dateString).toLocaleString(
      'en-IN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) {
      return '--';
    }

    return new Date(dateString).toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    );
  };

  const getProductName = (product) => {
    return (
      product.product_title ||
      product.title ||
      product.name ||
      'Food Item'
    );
  };

  const getProductQuantity = (product) => {
    return Number(product.quantity || 1);
  };

  const getProductPrice = (product) => {
    return Number(product.price || 0);
  };

  const getProductTotal = (product) => {
    return (
      getProductPrice(product) *
      getProductQuantity(product)
    );
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          paddingTop: '110px',
          paddingBottom: '60px',
          background: '#f7f7f7',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '30px 20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <h2>Loading Order...</h2>

            <p
              style={{
                color: '#666',
              }}
            >
              Please wait while we load your order details.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main
        style={{
          minHeight: '100vh',
          paddingTop: '110px',
          paddingBottom: '60px',
          background: '#f7f7f7',
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '30px 20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <h2>Unable to Load Order</h2>

            <p
              style={{
                color: '#d32f2f',
                marginBottom: '25px',
              }}
            >
              {error || 'Order not found.'}
            </p>

            <Link
              href="/orders"
              style={{
                display: 'inline-block',
                padding: '12px 25px',
                background: '#ff5722',
                color: '#fff',
                borderRadius: '7px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusHistory = Array.isArray(
    order.status_history
  )
    ? order.status_history
    : [];

  const products = Array.isArray(order.products)
    ? order.products
    : [];

  const deliveryAddress =
    order.delivery_address || {};

  const isCancelled =
    order.order_status === 'Cancelled';

  return (
    <main
      style={{
        minHeight: '100vh',
        paddingTop: '110px',
        paddingBottom: '60px',
        background: '#f7f7f7',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '30px 20px',
        }}
      >
        {/* Back Button */}

        <Link
          href="/orders"
          style={{
            display: 'inline-block',
            marginBottom: '25px',
            color: '#ff5722',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          ← Back to My Orders
        </Link>

        {/* Page Header */}

        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h1
                style={{
                  margin: '0 0 10px',
                  fontSize: '30px',
                }}
              >
                Order Details
              </h1>

              <p
                style={{
                  margin: '0 0 6px',
                  color: '#555',
                  wordBreak: 'break-all',
                }}
              >
                Order ID: <strong>{order.id}</strong>
              </p>

              <p
                style={{
                  margin: 0,
                  color: '#777',
                  fontSize: '14px',
                }}
              >
                Placed on: {formatDate(order.created_at)}
              </p>
            </div>

            <span
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                borderRadius: '20px',
                background: isCancelled
                  ? '#ffebee'
                  : order.order_status === 'Delivered'
                  ? '#e8f5e9'
                  : '#fff3e0',
                color: isCancelled
                  ? '#c62828'
                  : order.order_status === 'Delivered'
                  ? '#2e7d32'
                  : '#e65100',
                fontWeight: 'bold',
              }}
            >
              {order.order_status || 'Processing'}
            </span>
          </div>
        </div>

        {/* Ordered Items */}

        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '20px',
            }}
          >
            Ordered Items
          </h2>

          {products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={
                  product.product_id ||
                  product.id ||
                  index
                }
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '15px 0',
                  borderBottom:
                    index < products.length - 1
                      ? '1px solid #eee'
                      : 'none',
                }}
              >
                <div>
                  <strong
                    style={{
                      fontSize: '16px',
                    }}
                  >
                    {getProductName(product)}
                  </strong>

                  <p
                    style={{
                      margin: '6px 0 0',
                      color: '#666',
                      fontSize: '14px',
                    }}
                  >
                    Quantity: {getProductQuantity(product)}
                  </p>

                  <p
                    style={{
                      margin: '4px 0 0',
                      color: '#777',
                      fontSize: '14px',
                    }}
                  >
                    Unit Price: ₹
                    {getProductPrice(product).toFixed(2)}
                  </p>
                </div>

                <strong
                  style={{
                    fontSize: '17px',
                  }}
                >
                  ₹{getProductTotal(product).toFixed(2)}
                </strong>
              </div>
            ))
          ) : (
            <p
              style={{
                color: '#666',
              }}
            >
              Product details unavailable.
            </p>
          )}
        </div>

        {/* Delivery Address */}

        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '20px',
            }}
          >
            Delivery Address
          </h2>

          <div
            style={{
              lineHeight: '1.7',
              color: '#555',
            }}
          >
            <strong
              style={{
                color: '#222',
              }}
            >
              {deliveryAddress.address_type ||
                'Delivery Address'}
            </strong>

            <br />

            {deliveryAddress.address_line1 ||
              'Address unavailable'}

            <br />

            {deliveryAddress.city || ''}

            {deliveryAddress.city &&
            deliveryAddress.state
              ? ', '
              : ''}

            {deliveryAddress.state || ''}

            {deliveryAddress.pincode
              ? ` - ${deliveryAddress.pincode}`
              : ''}

            <br />

            {deliveryAddress.country || ''}

            {deliveryAddress.mobile && (
              <>
                <br />
                Mobile: {deliveryAddress.mobile}
              </>
            )}

            {deliveryAddress.landmark && (
              <>
                <br />
                Landmark: {deliveryAddress.landmark}
              </>
            )}
          </div>
        </div>

        {/* Payment and Total */}

        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '20px',
            }}
          >
            Payment Details
          </h2>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <p
                style={{
                  margin: '0 0 6px',
                  color: '#777',
                }}
              >
                Payment Method
              </p>

              <strong>
                {order.payment_status ||
                  'Cash on Delivery'}
              </strong>
            </div>

            <div
              style={{
                textAlign: 'right',
              }}
            >
              <p
                style={{
                  margin: '0 0 6px',
                  color: '#777',
                }}
              >
                Total Amount
              </p>

              <strong
                style={{
                  fontSize: '25px',
                  color: '#ff5722',
                }}
              >
                ₹
                {Number(
                  order.total_amount || 0
                ).toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        {/* Status History */}

        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '25px',
            marginBottom: '20px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '25px',
            }}
          >
            Order Status History
          </h2>

          {statusHistory.length === 0 ? (
            <p
              style={{
                color: '#777',
              }}
            >
              No status history available.
            </p>
          ) : (
            <div>
              {statusHistory.map(
                (history, index) => {
                  const isLast =
                    index ===
                    statusHistory.length - 1;

                  const isCancelledStatus =
                    history.status ===
                    'Cancelled';

                  return (
                    <div
                      key={
                        history.id ||
                        `${history.status}-${index}`
                      }
                      style={{
                        display: 'flex',
                        gap: '15px',
                        position: 'relative',
                        paddingBottom: isLast
                          ? '0'
                          : '25px',
                      }}
                    >
                      <div
                        style={{
                          width: '34px',
                          minWidth: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background:
                            isCancelledStatus
                              ? '#e53935'
                              : '#ff5722',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          zIndex: 2,
                        }}
                      >
                        {isCancelledStatus
                          ? '×'
                          : '✓'}
                      </div>

                      {!isLast && (
                        <div
                          style={{
                            position:
                              'absolute',
                            left: '16px',
                            top: '34px',
                            width: '2px',
                            height:
                              'calc(100% - 25px)',
                            background:
                              '#ddd',
                          }}
                        />
                      )}

                      <div
                        style={{
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent:
                              'space-between',
                            alignItems:
                              'center',
                            gap: '15px',
                            flexWrap: 'wrap',
                          }}
                        >
                          <strong
                            style={{
                              color:
                                isCancelledStatus
                                  ? '#c62828'
                                  : '#222',
                              fontSize:
                                '16px',
                            }}
                          >
                            {history.status}
                          </strong>

                          <span
                            style={{
                              color: '#777',
                              fontSize:
                                '14px',
                            }}
                          >
                            {formatTime(
                              history.created_at
                            )}
                          </span>
                        </div>

                        <p
                          style={{
                            margin:
                              '5px 0 0',
                            color: '#999',
                            fontSize:
                              '13px',
                          }}
                        >
                          {formatDate(
                            history.created_at
                          )}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}

        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '25px',
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: '20px',
            }}
          >
            Order Summary
          </h2>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '10px',
              color: '#555',
            }}
          >
            <span>Items</span>

            <span>
              {products.reduce(
                (total, product) =>
                  total +
                  getProductQuantity(product),
                0
              )}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '15px',
              borderTop: '1px solid #eee',
              fontSize: '20px',
              fontWeight: 'bold',
            }}
          >
            <span>Total</span>

            <span>
              ₹
              {Number(
                order.total_amount || 0
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}