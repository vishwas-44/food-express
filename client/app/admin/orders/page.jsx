'use client';

import { useEffect, useState } from 'react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);
  const [successMessage, setSuccessMessage] =
    useState('');

  /*
    Fetch all orders
  */
  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async (
      showLoading = false
    ) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        const response = await fetch(
          'http://localhost:8000/api/admin/all-orders',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          if (isMounted) {
            setError(
              data.message ||
                'Failed to fetch customer orders.'
            );
          }

          return;
        }

        if (isMounted) {
          setOrders(data.data || []);
          setError('');
        }
      } catch (error) {
        console.error(
          'Admin orders error:',
          error
        );

        if (isMounted) {
          setError(
            'Unable to connect to the server.'
          );
        }
      } finally {
        if (isMounted && showLoading) {
          setLoading(false);
        }
      }
    };

    // First load
    fetchOrders(true);

    // Live updates every 5 seconds
    const interval = setInterval(() => {
      fetchOrders(false);
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  /*
    Only show active orders in All Orders.

    Delivered and Cancelled orders are moved
    conceptually to Order History.
  */
  const activeOrders = orders
    .filter((order) => {
      const status = String(
        order.order_status || ''
      )
        .trim()
        .toLowerCase();

      return (
        status !== 'delivered' &&
        status !== 'completed' &&
        status !== 'cancelled'
      );
    })
    .sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    );

  /*
    Format date and time
  */
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

  /*
    Change order status
  */
  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    setUpdatingOrderId(orderId);
    setSuccessMessage('');
    setError('');

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/update-order-status/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            order_status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            'Failed to update order status.'
        );

        return;
      }

      /*
        Update local order immediately.
      */
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                order_status:
                  newStatus,
                updated_at:
                  data.data?.updated_at ||
                  order.updated_at,
              }
            : order
        )
      );

      /*
        If the order becomes Delivered or
        Cancelled, it will disappear from
        All Orders automatically.
      */
      setSuccessMessage(
        'Order status updated successfully.'
      );
    } catch (error) {
      console.error(
        'Update order status error:',
        error
      );

      setError(
        'Unable to connect to the server.'
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  /*
    Get status badge style
  */
  const getStatusStyle = (status) => {
    const normalized = String(
      status || ''
    )
      .trim()
      .toLowerCase();

    if (
      normalized === 'processing' ||
      normalized === 'confirmed'
    ) {
      return {
        background: '#e3f2fd',
        color: '#1565c0',
      };
    }

    if (
      normalized === 'preparing' ||
      normalized === 'prepared'
    ) {
      return {
        background: '#fff8e1',
        color: '#ef6c00',
      };
    }

    if (
      normalized ===
        'out for delivery' ||
      normalized ===
        'out_for_delivery' ||
      normalized === 'shipped'
    ) {
      return {
        background: '#f3e5f5',
        color: '#6a1b9a',
      };
    }

    return {
      background: '#f5f5f5',
      color: '#555',
    };
  };

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'flex-start',
          gap: '20px',
          flexWrap: 'wrap',
          marginBottom: '25px',
        }}
      >
        <div>
          <h1
            style={{
              marginBottom: '8px',
            }}
          >
            All Orders
          </h1>

          <p
            style={{
              color: '#666',
              margin: 0,
            }}
          >
            Manage current customer orders.
          </p>
        </div>

        <div
          style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            border:
              '1px solid #a5d6a7',
            borderRadius: '20px',
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
          }}
        >
          ● Live Updates
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: '#ffebee',
            color: '#c62828',
            border:
              '1px solid #ef9a9a',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
          }}
        >
          {error}
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div
          style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            border:
              '1px solid #a5d6a7',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div
          style={{
            background: '#fff',
            border:
              '1px solid #ddd',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
          }}
        >
          <h2>
            Loading Orders...
          </h2>

          <p
            style={{
              color: '#666',
            }}
          >
            Please wait while customer
            orders are loaded.
          </p>
        </div>
      ) : (
        <>
          {/* Current Orders Header */}
          <div
            style={{
              display: 'flex',
              justifyContent:
                'space-between',
              alignItems:
                'center',
              gap: '15px',
              flexWrap: 'wrap',
              marginBottom: '18px',
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: '22px',
                }}
              >
                Current Orders
              </h2>

              <p
                style={{
                  margin:
                    '5px 0 0',
                  color: '#777',
                  fontSize: '13px',
                }}
              >
                {activeOrders.length}{' '}
                active order
                {activeOrders.length !==
                1
                  ? 's'
                  : ''}
              </p>
            </div>

            <div
              style={{
                background:
                  '#fff3e0',
                color:
                  '#e65100',
                border:
                  '1px solid #ffcc80',
                borderRadius:
                  '20px',
                padding:
                  '8px 14px',
                fontSize:
                  '13px',
                fontWeight:
                  '600',
              }}
            >
              Orders requiring
              attention
            </div>
          </div>

          {/* No Active Orders */}
          {activeOrders.length ===
          0 ? (
            <div
              style={{
                background: '#fff',
                border:
                  '1px solid #ddd',
                borderRadius:
                  '12px',
                padding:
                  '70px 20px',
                textAlign:
                  'center',
              }}
            >
              <div
                style={{
                  fontSize:
                    '55px',
                  marginBottom:
                    '15px',
                }}
              >
                🍔
              </div>

              <h2>
                No Current Orders
              </h2>

              <p
                style={{
                  color: '#666',
                  marginBottom: 0,
                }}
              >
                New customer orders
                will appear here
                automatically.
              </p>
            </div>
          ) : (
            <div>
              {activeOrders.map(
                (order) => {
                  const statusStyle =
                    getStatusStyle(
                      order.order_status
                    );

                  return (
                    <div
                      key={order.id}
                      style={{
                        background:
                          '#fff',
                        border:
                          '1px solid #ddd',
                        borderRadius:
                          '12px',
                        padding:
                          '25px',
                        marginBottom:
                          '20px',
                      }}
                    >
                      {/* Order Header */}
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'flex-start',
                          gap: '20px',
                          flexWrap:
                            'wrap',
                          marginBottom:
                            '20px',
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin:
                                '0 0 8px',
                              wordBreak:
                                'break-all',
                            }}
                          >
                            Order #
                            {
                              order.id
                            }
                          </h3>

                          <p
                            style={{
                              margin: 0,
                              color:
                                '#666',
                              fontSize:
                                '14px',
                            }}
                          >
                            {formatDate(
                              order.created_at
                            )}
                          </p>
                        </div>

                        {/* Status */}
                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            gap: '10px',
                            flexWrap:
                              'wrap',
                          }}
                        >
                          <select
                            value={
                              order.order_status ||
                              'Processing'
                            }
                            disabled={
                              updatingOrderId ===
                                order.id ||
                              order.order_status ===
                                'Delivered' ||
                              order.order_status ===
                                'Cancelled'
                            }
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                order.id,
                                event
                                  .target
                                  .value
                              )
                            }
                            style={{
                              padding:
                                '10px 16px',
                              borderRadius:
                                '20px',
                              border:
                                '1px solid #ddd',
                              background:
                                statusStyle.background,
                              color:
                                statusStyle.color,
                              fontWeight:
                                'bold',
                              fontSize:
                                '14px',
                              cursor:
                                'pointer',
                              minWidth:
                                '170px',
                            }}
                          >
                            <option value="Processing">
                              Processing
                            </option>

                            <option value="Confirmed">
                              Confirmed
                            </option>

                            <option value="Preparing">
                              Preparing
                            </option>

                            <option value="Out for Delivery">
                              Out for Delivery
                            </option>

                            <option value="Delivered">
                              Delivered
                            </option>

                            <option value="Cancelled">
                              Cancelled
                            </option>
                          </select>

                          {updatingOrderId ===
                            order.id && (
                            <span
                              style={{
                                color:
                                  '#666',
                                fontSize:
                                  '13px',
                              }}
                            >
                              Updating...
                            </span>
                          )}
                        </div>
                      </div>

                      <hr />

                      {/* Customer Information */}
                      <div
                        style={{
                          marginTop:
                            '20px',
                          marginBottom:
                            '20px',
                        }}
                      >
                        <h4
                          style={{
                            marginBottom:
                              '10px',
                          }}
                        >
                          Customer
                        </h4>

                        {order.user ? (
                          <div
                            style={{
                              color:
                                '#555',
                              lineHeight:
                                '1.7',
                            }}
                          >
                            <div>
                              <strong>
                                Name:
                              </strong>{' '}
                              {order.user
                                .name ||
                                'N/A'}
                            </div>

                            <div>
                              <strong>
                                Email:
                              </strong>{' '}
                              {order.user
                                .email ||
                                'N/A'}
                            </div>

                            <div>
                              <strong>
                                Mobile:
                              </strong>{' '}
                              {order.user
                                .mobile ||
                                'N/A'}
                            </div>
                          </div>
                        ) : (
                          <p
                            style={{
                              color:
                                '#666',
                            }}
                          >
                            Customer
                            information
                            unavailable.
                          </p>
                        )}
                      </div>

                      <hr />

                      {/* Ordered Products */}
                      <div
                        style={{
                          marginTop:
                            '20px',
                          marginBottom:
                            '20px',
                        }}
                      >
                        <h4
                          style={{
                            marginBottom:
                              '15px',
                          }}
                        >
                          Ordered Items
                        </h4>

                        {Array.isArray(
                          order.products
                        ) &&
                        order.products
                          .length >
                          0 ? (
                          order.products.map(
                            (
                              product,
                              index
                            ) => (
                              <div
                                key={
                                  product.product_id ||
                                  index
                                }
                                style={{
                                  display:
                                    'flex',
                                  justifyContent:
                                    'space-between',
                                  alignItems:
                                    'center',
                                  gap: '20px',
                                  padding:
                                    '12px 0',
                                  borderBottom:
                                    index <
                                    order
                                      .products
                                      .length -
                                      1
                                      ? '1px solid #eee'
                                      : 'none',
                                }}
                              >
                                <div>
                                  <strong>
                                    {product.product_title ||
                                      product.title ||
                                      'Food Item'}
                                  </strong>

                                  <p
                                    style={{
                                      margin:
                                        '5px 0 0',
                                      color:
                                        '#666',
                                      fontSize:
                                        '14px',
                                    }}
                                  >
                                    Quantity:{' '}
                                    {product.quantity ||
                                      1}
                                  </p>
                                </div>

                                <strong>
                                  ₹
                                  {(
                                    Number(
                                      product.price
                                    ) *
                                    Number(
                                      product.quantity ||
                                        1
                                    )
                                  ).toFixed(
                                    2
                                  )}
                                </strong>
                              </div>
                            )
                          )
                        ) : (
                          <p
                            style={{
                              color:
                                '#666',
                            }}
                          >
                            Product details
                            unavailable.
                          </p>
                        )}
                      </div>

                      <hr />

                      {/* Delivery Address */}
                      {order.delivery_address && (
                        <div
                          style={{
                            marginTop:
                              '20px',
                            marginBottom:
                              '20px',
                          }}
                        >
                          <h4
                            style={{
                              marginBottom:
                                '10px',
                            }}
                          >
                            Delivery Address
                          </h4>

                          <p
                            style={{
                              margin: 0,
                              lineHeight:
                                '1.7',
                              color:
                                '#555',
                            }}
                          >
                            {
                              order
                                .delivery_address
                                .address_line1
                            }
                            <br />

                            {
                              order
                                .delivery_address
                                .city
                            }
                            ,{' '}
                            {
                              order
                                .delivery_address
                                .state
                            }{' '}
                            -{' '}
                            {
                              order
                                .delivery_address
                                .pincode
                            }
                            <br />

                            {
                              order
                                .delivery_address
                                .country
                            }
                            <br />

                            Mobile:{' '}
                            {
                              order
                                .delivery_address
                                .mobile
                            }

                            {order
                              .delivery_address
                              .landmark && (
                              <>
                                <br />
                                Landmark:{' '}
                                {
                                  order
                                    .delivery_address
                                    .landmark
                                }
                              </>
                            )}
                          </p>
                        </div>
                      )}

                      <hr />

                      {/* Payment + Total */}
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          alignItems:
                            'center',
                          gap: '20px',
                          marginTop:
                            '20px',
                          flexWrap:
                            'wrap',
                        }}
                      >
                        <div>
                          <p
                            style={{
                              margin:
                                '0 0 5px',
                              color:
                                '#555',
                            }}
                          >
                            Payment
                          </p>

                          <strong>
                            {order.payment_status ||
                              'Cash on Delivery'}
                          </strong>
                        </div>

                        <div
                          style={{
                            textAlign:
                              'right',
                          }}
                        >
                          <p
                            style={{
                              margin:
                                '0 0 5px',
                              color:
                                '#555',
                            }}
                          >
                            Total Amount
                          </p>

                          <strong
                            style={{
                              fontSize:
                                '22px',
                            }}
                          >
                            ₹
                            {Number(
                              order.total_amount
                            ).toFixed(
                              2
                            )}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}