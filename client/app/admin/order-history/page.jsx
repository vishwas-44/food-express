'use client';

import { useEffect, useMemo, useState } from 'react';

/*
  Get local date in YYYY-MM-DD format
*/
const getLocalDateKey = (date) => {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] =
    useState(getLocalDateKey(new Date()));

  /*
    Convert date string to local YYYY-MM-DD
  */
  const getDateKey = (dateString) => {
    if (!dateString) {
      return '';
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return getLocalDateKey(date);
  };

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
    Format selected date
  */
  const formatSelectedDate = (dateString) => {
    if (!dateString) {
      return '';
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString(
      'en-IN',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }
    );
  };

  /*
    Fetch all orders
  */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          'http://localhost:8000/api/admin/all-orders',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              'Failed to fetch order history.'
          );

          return;
        }

        setOrders(data.data || []);
        setError('');
      } catch (error) {
        console.error(
          'Order history error:',
          error
        );

        setError(
          'Unable to connect to the server.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /*
    Orders for selected date
  */
  const selectedDateOrders = useMemo(() => {
    return orders
      .filter(
        (order) =>
          getDateKey(order.created_at) ===
          selectedDate
      )
      .sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );
  }, [orders, selectedDate]);

  /*
    Completed orders
  */
  const completedOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(
        order.order_status || ''
      )
        .trim()
        .toLowerCase();

      return (
        status === 'delivered' ||
        status === 'completed'
      );
    });
  }, [orders]);

  /*
    Cancelled orders
  */
  const cancelledOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = String(
        order.order_status || ''
      )
        .trim()
        .toLowerCase();

      return status === 'cancelled';
    });
  }, [orders]);

  /*
    Completed on selected day
  */
  const completedToday = useMemo(() => {
    return completedOrders.filter(
      (order) =>
        getDateKey(order.updated_at) ===
        selectedDate
    );
  }, [
    completedOrders,
    selectedDate,
  ]);

  /*
    Cancelled on selected day
  */
  const cancelledToday = useMemo(() => {
    return cancelledOrders.filter(
      (order) =>
        getDateKey(order.updated_at) ===
        selectedDate
    );
  }, [
    cancelledOrders,
    selectedDate,
  ]);

  /*
    Selected week
  */
  const weekRange = useMemo(() => {
    const date = new Date(
      `${selectedDate}T00:00:00`
    );

    const day = date.getDay();

    const mondayOffset =
      day === 0 ? -6 : 1 - day;

    const start = new Date(date);

    start.setDate(
      date.getDate() + mondayOffset
    );

    start.setHours(0, 0, 0, 0);

    const end = new Date(start);

    end.setDate(
      start.getDate() + 6
    );

    end.setHours(
      23,
      59,
      59,
      999
    );

    return {
      start,
      end,
    };
  }, [selectedDate]);

  /*
    Selected month
  */
  const monthRange = useMemo(() => {
    const date = new Date(
      `${selectedDate}T00:00:00`
    );

    const start = new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    );

    start.setHours(0, 0, 0, 0);

    const end = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    );

    end.setHours(
      23,
      59,
      59,
      999
    );

    return {
      start,
      end,
    };
  }, [selectedDate]);

  /*
    Check date range
  */
  const isInsideRange = (
    dateString,
    start,
    end
  ) => {
    if (!dateString) {
      return false;
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return (
      date >= start &&
      date <= end
    );
  };

  /*
    Completed this week
  */
  const completedThisWeek =
    completedOrders.filter(
      (order) =>
        isInsideRange(
          order.updated_at,
          weekRange.start,
          weekRange.end
        )
    );

  /*
    Completed this month
  */
  const completedThisMonth =
    completedOrders.filter(
      (order) =>
        isInsideRange(
          order.updated_at,
          monthRange.start,
          monthRange.end
        )
    );

  /*
    Cancelled this month
  */
  const cancelledThisMonth =
    cancelledOrders.filter(
      (order) =>
        isInsideRange(
          order.updated_at,
          monthRange.start,
          monthRange.end
        )
    );

  /*
    Statistics for selected date
  */
  const selectedDateStats =
    useMemo(() => {
      const stats = {
        total: selectedDateOrders.length,
        delivered: 0,
        cancelled: 0,
        processing: 0,
        preparing: 0,
        outForDelivery: 0,
      };

      selectedDateOrders.forEach(
        (order) => {
          const status = String(
            order.order_status || ''
          )
            .trim()
            .toLowerCase();

          if (
            status === 'processing' ||
            status === 'confirmed'
          ) {
            stats.processing += 1;
          }

          if (
            status === 'preparing' ||
            status === 'prepared'
          ) {
            stats.preparing += 1;
          }

          if (
            status ===
              'out for delivery' ||
            status ===
              'out_for_delivery' ||
            status === 'shipped'
          ) {
            stats.outForDelivery += 1;
          }

          if (
            status === 'delivered' ||
            status === 'completed'
          ) {
            stats.delivered += 1;
          }

          if (
            status === 'cancelled'
          ) {
            stats.cancelled += 1;
          }
        }
      );

      return stats;
    }, [selectedDateOrders]);

  /*
    Go to today
  */
  const handleToday = () => {
    setSelectedDate(
      getLocalDateKey(new Date())
    );
  };

  /*
    Status style
  */
  const getStatusStyle = (status) => {
    const normalized = String(
      status || ''
    )
      .trim()
      .toLowerCase();

    if (
      normalized === 'delivered' ||
      normalized === 'completed'
    ) {
      return {
        background: '#e8f5e9',
        color: '#2e7d32',
      };
    }

    if (
      normalized === 'cancelled'
    ) {
      return {
        background: '#ffebee',
        color: '#c62828',
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
        'out_for_delivery'
    ) {
      return {
        background: '#f3e5f5',
        color: '#6a1b9a',
      };
    }

    return {
      background: '#e3f2fd',
      color: '#1565c0',
    };
  };

  return (
    <div
      style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
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
            Order History & Statistics
          </h1>

          <p
            style={{
              margin: 0,
              color: '#666',
            }}
          >
            View completed, cancelled and
            previous customer orders.
          </p>
        </div>
      </div>

      {/* Date Selector */}
      <div
        style={{
          background: '#fff',
          border:
            '1px solid #ddd',
          borderRadius:
            '14px',
          padding: '20px',
          marginBottom:
            '25px',
          display: 'flex',
          justifyContent:
            'space-between',
          alignItems:
            'center',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h3
            style={{
              margin:
                '0 0 6px',
            }}
          >
            Select Date
          </h3>

          <p
            style={{
              margin: 0,
              color: '#777',
              fontSize:
                '14px',
            }}
          >
            Viewing history for{' '}
            <strong>
              {formatSelectedDate(
                selectedDate
              )}
            </strong>
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems:
              'center',
            flexWrap: 'wrap',
          }}
        >
          <input
            type="date"
            value={selectedDate}
            onChange={(event) =>
              setSelectedDate(
                event.target.value
              )
            }
            style={{
              padding:
                '11px 14px',
              border:
                '1px solid #ccc',
              borderRadius:
                '8px',
              fontSize:
                '14px',
            }}
          />

          <button
            onClick={handleToday}
            style={{
              border: 'none',
              background:
                '#ff5722',
              color: '#fff',
              padding:
                '11px 18px',
              borderRadius:
                '8px',
              fontWeight:
                '600',
              cursor:
                'pointer',
            }}
          >
            Today
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background:
              '#ffebee',
            color:
              '#c62828',
            border:
              '1px solid #ef9a9a',
            borderRadius:
              '8px',
            padding:
              '12px 16px',
            marginBottom:
              '20px',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          style={{
            background: '#fff',
            border:
              '1px solid #ddd',
            borderRadius:
              '12px',
            padding:
              '60px 20px',
            textAlign:
              'center',
          }}
        >
          <h2>
            Loading History...
          </h2>

          <p
            style={{
              color:
                '#666',
            }}
          >
            Please wait while
            order history is
            loaded.
          </p>
        </div>
      ) : (
        <>
          {/* Statistics */}
          <h2
            style={{
              marginBottom:
                '15px',
              fontSize:
                '22px',
            }}
          >
            Statistics
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              marginBottom:
                '30px',
            }}
          >
            <div
              style={{
                background:
                  '#f8fff9',
                border:
                  '1px solid #c8e6c9',
                borderRadius:
                  '14px',
                padding:
                  '20px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#666',
                  fontSize:
                    '14px',
                }}
              >
                Completed Day
              </p>

              <h2
                style={{
                  margin:
                    '10px 0 5px',
                  color:
                    '#2e7d32',
                  fontSize:
                    '34px',
                }}
              >
                {
                  completedToday.length
                }
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    '#777',
                  fontSize:
                    '12px',
                }}
              >
                Selected date
              </p>
            </div>

            <div
              style={{
                background:
                  '#f8fbff',
                border:
                  '1px solid #bbdefb',
                borderRadius:
                  '14px',
                padding:
                  '20px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#666',
                  fontSize:
                    '14px',
                }}
              >
                Completed Week
              </p>

              <h2
                style={{
                  margin:
                    '10px 0 5px',
                  color:
                    '#1565c0',
                  fontSize:
                    '34px',
                }}
              >
                {
                  completedThisWeek.length
                }
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    '#777',
                  fontSize:
                    '12px',
                }}
              >
                Monday to Sunday
              </p>
            </div>

            <div
              style={{
                background:
                  '#fffaf4',
                border:
                  '1px solid #ffe0b2',
                borderRadius:
                  '14px',
                padding:
                  '20px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#666',
                  fontSize:
                    '14px',
                }}
              >
                Completed Month
              </p>

              <h2
                style={{
                  margin:
                    '10px 0 5px',
                  color:
                    '#ef6c00',
                  fontSize:
                    '34px',
                }}
              >
                {
                  completedThisMonth.length
                }
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    '#777',
                  fontSize:
                    '12px',
                }}
              >
                Selected month
              </p>
            </div>

            <div
              style={{
                background:
                  '#fff8f8',
                border:
                  '1px solid #ffcdd2',
                borderRadius:
                  '14px',
                padding:
                  '20px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#666',
                  fontSize:
                    '14px',
                }}
              >
                Cancelled Day
              </p>

              <h2
                style={{
                  margin:
                    '10px 0 5px',
                  color:
                    '#c62828',
                  fontSize:
                    '34px',
                }}
              >
                {
                  cancelledToday.length
                }
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    '#777',
                  fontSize:
                    '12px',
                }}
              >
                Selected date
              </p>
            </div>

            <div
              style={{
                background:
                  '#fff8f8',
                border:
                  '1px solid #ffcdd2',
                borderRadius:
                  '14px',
                padding:
                  '20px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#666',
                  fontSize:
                    '14px',
                }}
              >
                Cancelled Month
              </p>

              <h2
                style={{
                  margin:
                    '10px 0 5px',
                  color:
                    '#c62828',
                  fontSize:
                    '34px',
                }}
              >
                {
                  cancelledThisMonth.length
                }
              </h2>

              <p
                style={{
                  margin: 0,
                  color:
                    '#777',
                  fontSize:
                    '12px',
                }}
              >
                Selected month
              </p>
            </div>
          </div>

          {/* Selected Date Summary */}
          <div
            style={{
              background: '#fff',
              border:
                '1px solid #ddd',
              borderRadius:
                '14px',
              padding:
                '22px',
              marginBottom:
                '30px',
            }}
          >
            <h2
              style={{
                margin:
                  '0 0 18px',
                fontSize:
                  '22px',
              }}
            >
              {formatSelectedDate(
                selectedDate
              )}{' '}
              Summary
            </h2>

            <div
              style={{
                display:
                  'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
              }}
            >
              <div>
                <strong>
                  Total Orders
                </strong>

                <p
                  style={{
                    margin:
                      '6px 0 0',
                    fontSize:
                      '24px',
                  }}
                >
                  {
                    selectedDateStats.total
                  }
                </p>
              </div>

              <div>
                <strong>
                  Delivered
                </strong>

                <p
                  style={{
                    margin:
                      '6px 0 0',
                    fontSize:
                      '24px',
                    color:
                      '#2e7d32',
                  }}
                >
                  {
                    selectedDateStats.delivered
                  }
                </p>
              </div>

              <div>
                <strong>
                  Cancelled
                </strong>

                <p
                  style={{
                    margin:
                      '6px 0 0',
                    fontSize:
                      '24px',
                    color:
                      '#c62828',
                  }}
                >
                  {
                    selectedDateStats.cancelled
                  }
                </p>
              </div>

              <div>
                <strong>
                  Processing
                </strong>

                <p
                  style={{
                    margin:
                      '6px 0 0',
                    fontSize:
                      '24px',
                    color:
                      '#1565c0',
                  }}
                >
                  {
                    selectedDateStats.processing
                  }
                </p>
              </div>

              <div>
                <strong>
                  Preparing
                </strong>

                <p
                  style={{
                    margin:
                      '6px 0 0',
                    fontSize:
                      '24px',
                    color:
                      '#ef6c00',
                  }}
                >
                  {
                    selectedDateStats.preparing
                  }
                </p>
              </div>

              <div>
                <strong>
                  Out for Delivery
                </strong>

                <p
                  style={{
                    margin:
                      '6px 0 0',
                    fontSize:
                      '24px',
                    color:
                      '#6a1b9a',
                  }}
                >
                  {
                    selectedDateStats.outForDelivery
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Order History */}
          <div>
            <div
              style={{
                marginBottom:
                  '18px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize:
                    '22px',
                }}
              >
                Order History
              </h2>

              <p
                style={{
                  margin:
                    '5px 0 0',
                  color:
                    '#777',
                  fontSize:
                    '13px',
                }}
              >
                Orders placed on{' '}
                {
                  formatSelectedDate(
                    selectedDate
                  )
                }
                .
              </p>
            </div>

            {selectedDateOrders.length ===
            0 ? (
              <div
                style={{
                  background:
                    '#fff',
                  border:
                    '1px solid #ddd',
                  borderRadius:
                    '12px',
                  padding:
                    '60px 20px',
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
                  📭
                </div>

                <h2>
                  No Orders Found
                </h2>

                <p
                  style={{
                    color:
                      '#666',
                  }}
                >
                  No orders were
                  placed on this
                  date.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: '15px',
                }}
              >
                {selectedDateOrders.map(
                  (order) => {
                    const statusStyle =
                      getStatusStyle(
                        order.order_status
                      );

                    return (
                      <div
                        key={
                          order.id
                        }
                        style={{
                          background:
                            '#fff',
                          border:
                            '1px solid #ddd',
                          borderRadius:
                            '12px',
                          padding:
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
                              'center',
                            gap:
                              '20px',
                            flexWrap:
                              'wrap',
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                margin:
                                  '0 0 6px',
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
                                margin:
                                  0,
                                color:
                                  '#666',
                                fontSize:
                                  '13px',
                              }}
                            >
                              Placed:{' '}
                              {formatDate(
                                order.created_at
                              )}
                            </p>
                          </div>

                          <span
                            style={{
                              ...statusStyle,
                              padding:
                                '8px 14px',
                              borderRadius:
                                '20px',
                              fontSize:
                                '13px',
                              fontWeight:
                                '700',
                              whiteSpace:
                                'nowrap',
                            }}
                          >
                            {
                              order.order_status
                            }
                          </span>
                        </div>

                        <hr
                          style={{
                            margin:
                              '18px 0',
                            border:
                              'none',
                            borderTop:
                              '1px solid #eee',
                          }}
                        />

                        {/* Customer */}
                        <div
                          style={{
                            display:
                              'grid',
                            gridTemplateColumns:
                              'repeat(auto-fit, minmax(200px, 1fr))',
                            gap:
                              '15px',
                          }}
                        >
                          <div>
                            <p
                              style={{
                                margin:
                                  '0 0 5px',
                                color:
                                  '#888',
                                fontSize:
                                  '12px',
                              }}
                            >
                              Customer
                            </p>

                            <strong>
                              {order
                                .user
                                ?.name ||
                                'N/A'}
                            </strong>
                          </div>

                          <div>
                            <p
                              style={{
                                margin:
                                  '0 0 5px',
                                color:
                                  '#888',
                                fontSize:
                                  '12px',
                              }}
                            >
                              Email
                            </p>

                            <strong
                              style={{
                                fontWeight:
                                  '500',
                              }}
                            >
                              {order
                                .user
                                ?.email ||
                                'N/A'}
                            </strong>
                          </div>

                          <div>
                            <p
                              style={{
                                margin:
                                  '0 0 5px',
                                color:
                                  '#888',
                                fontSize:
                                  '12px',
                              }}
                            >
                              Payment
                            </p>

                            <strong>
                              {order.payment_status ||
                                'Cash on Delivery'}
                            </strong>
                          </div>

                          <div>
                            <p
                              style={{
                                margin:
                                  '0 0 5px',
                                color:
                                  '#888',
                                fontSize:
                                  '12px',
                              }}
                            >
                              Total
                            </p>

                            <strong
                              style={{
                                fontSize:
                                  '18px',
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

                        {/* Products */}
                        {Array.isArray(
                          order.products
                        ) &&
                        order.products
                          .length >
                          0 && (
                          <>
                            <hr
                              style={{
                                margin:
                                  '18px 0',
                                border:
                                  'none',
                                borderTop:
                                  '1px solid #eee',
                              }}
                            />

                            <h4
                              style={{
                                margin:
                                  '0 0 12px',
                              }}
                            >
                              Ordered Items
                            </h4>

                            {order.products.map(
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
                                    padding:
                                      '8px 0',
                                    borderBottom:
                                      index <
                                      order
                                        .products
                                        .length -
                                        1
                                        ? '1px solid #f0f0f0'
                                        : 'none',
                                  }}
                                >
                                  <span>
                                    {product.product_title ||
                                      product.title ||
                                      'Food Item'}{' '}
                                    ×{' '}
                                    {product.quantity ||
                                      1}
                                  </span>

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
                            )}
                          </>
                        )}

                        {/* Delivery Address */}
                        {order.delivery_address && (
                          <>
                            <hr
                              style={{
                                margin:
                                  '18px 0',
                                border:
                                  'none',
                                borderTop:
                                  '1px solid #eee',
                              }}
                            />

                            <h4
                              style={{
                                margin:
                                  '0 0 8px',
                              }}
                            >
                              Delivery Address
                            </h4>

                            <p
                              style={{
                                margin:
                                  0,
                                color:
                                  '#555',
                                lineHeight:
                                  '1.6',
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
                            </p>
                          </>
                        )}

                        {/* Status History */}
                        {Array.isArray(
                          order.status_history
                        ) &&
                        order.status_history
                          .length >
                          0 && (
                          <>
                            <hr
                              style={{
                                margin:
                                  '18px 0',
                                border:
                                  'none',
                                borderTop:
                                  '1px solid #eee',
                              }}
                            />

                            <h4
                              style={{
                                margin:
                                  '0 0 12px',
                              }}
                            >
                              Status History
                            </h4>

                            <div>
                              {order.status_history.map(
                                (
                                  history,
                                  index
                                ) => (
                                  <div
                                    key={
                                      history.id ||
                                      index
                                    }
                                    style={{
                                      display:
                                        'flex',
                                      gap:
                                        '12px',
                                      alignItems:
                                        'flex-start',
                                      marginBottom:
                                        '10px',
                                    }}
                                  >
                                    <div
                                      style={{
                                        width:
                                          '9px',
                                        height:
                                          '9px',
                                        marginTop:
                                          '5px',
                                        borderRadius:
                                          '50%',
                                        background:
                                          '#ff5722',
                                        flexShrink:
                                          0,
                                      }}
                                    />

                                    <div>
                                      <strong>
                                        {
                                          history.status
                                        }
                                      </strong>

                                      <p
                                        style={{
                                          margin:
                                            '3px 0 0',
                                          color:
                                            '#777',
                                          fontSize:
                                            '12px',
                                        }}
                                      >
                                        {formatDate(
                                          history.created_at
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}