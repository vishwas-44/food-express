'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      if (!isMounted) return;
      await fetchOrders();
    };

    loadOrders();

    const interval = setInterval(() => {
      loadOrders();
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const fetchOrders = async () => {
    try {
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
          data.message || 'Failed to fetch orders.'
        );
        return;
      }

      setOrders(data.data || []);
      setError('');
    } catch (error) {
      console.error('Orders error:', error);
      setError('Unable to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCancelOrder = async (orderId) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingOrderId(orderId);

      const response = await fetch(
        `http://localhost:8000/api/order/cancel-order/${orderId}`,
        {
          method: 'PUT',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            'Unable to cancel the order.'
        );
        return;
      }

      alert('Order cancelled successfully.');

      await fetchOrders();
    } catch (error) {
      console.error(
        'Cancel order error:',
        error
      );

      alert(
        'Unable to connect to the server.'
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const statusSteps = [
    'Order Placed',
    'Processing',
    'Preparing',
    'Out for Delivery',
    'Delivered',
  ];

  const getTrackerStatus = (status) => {
    const normalizedStatus = String(
      status || ''
    )
      .trim()
      .toLowerCase();

    if (
      normalizedStatus === 'pending' ||
      normalizedStatus === 'order placed' ||
      normalizedStatus === 'placed'
    ) {
      return 'Order Placed';
    }

    if (
      normalizedStatus === 'processing' ||
      normalizedStatus === 'confirmed'
    ) {
      return 'Processing';
    }

    if (
      normalizedStatus === 'preparing' ||
      normalizedStatus === 'prepared'
    ) {
      return 'Preparing';
    }

    if (
      normalizedStatus === 'out for delivery' ||
      normalizedStatus === 'out_for_delivery' ||
      normalizedStatus === 'shipped'
    ) {
      return 'Out for Delivery';
    }

    if (
      normalizedStatus === 'delivered' ||
      normalizedStatus === 'completed'
    ) {
      return 'Delivered';
    }

    return 'Processing';
  };

  const getCurrentStep = (status) => {
    const trackerStatus =
      getTrackerStatus(status);

    return statusSteps.indexOf(trackerStatus);
  };

  const canCancelOrder = (status) => {
    return [
      'Processing',
      'Confirmed',
      'Preparing',
    ].includes(status);
  };

  // --------------------------------------------------
  // USER-FRIENDLY FILTERING
  // --------------------------------------------------

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      let matchesStatus = true;

      if (statusFilter === 'Active') {
        matchesStatus = [
          'Processing',
          'Confirmed',
          'Preparing',
          'Out for Delivery',
        ].includes(order.order_status);
      }

      if (statusFilter === 'Delivered') {
        matchesStatus =
          order.order_status === 'Delivered';
      }

      if (statusFilter === 'Cancelled') {
        matchesStatus =
          order.order_status === 'Cancelled';
      }

      let matchesDate = true;

      if (
        dateFilter !== 'All' &&
        order.created_at
      ) {
        const orderDate = new Date(
          order.created_at
        );

        const now = new Date();

        if (dateFilter === 'Today') {
          matchesDate =
            orderDate.toDateString() ===
            now.toDateString();
        }

        if (dateFilter === 'Last 7 Days') {
          const sevenDaysAgo = new Date();

          sevenDaysAgo.setDate(
            now.getDate() - 7
          );

          matchesDate =
            orderDate >= sevenDaysAgo;
        }

        if (dateFilter === 'Last 30 Days') {
          const thirtyDaysAgo = new Date();

          thirtyDaysAgo.setDate(
            now.getDate() - 30
          );

          matchesDate =
            orderDate >= thirtyDaysAgo;
        }
      }

      return (
        matchesStatus &&
        matchesDate
      );
    });
  }, [
    orders,
    statusFilter,
    dateFilter,
  ]);

  const clearFilters = () => {
    setStatusFilter('All');
    setDateFilter('All');
  };

  const hasActiveFilters =
    statusFilter !== 'All' ||
    dateFilter !== 'All';

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
        {/* PAGE HEADER */}
        <div
          style={{
            marginBottom: '25px',
          }}
        >
          <h1
            style={{
              marginBottom: '10px',
            }}
          >
            My Orders
          </h1>

          <p
            style={{
              color: '#666',
              margin: 0,
            }}
          >
            View and track your food orders.
          </p>
        </div>

        {/* FILTER SECTION */}
        {!loading &&
          !error &&
          orders.length > 0 && (
            <div
              style={{
                background: '#fff',
                border: '1px solid #e1e1e1',
                borderRadius: '14px',
                padding: '20px',
                marginBottom: '25px',
                boxShadow:
                  '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  gap: '15px',
                  flexWrap: 'wrap',
                  marginBottom: '15px',
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '18px',
                    }}
                  >
                    My Orders
                  </h3>

                  <p
                    style={{
                      margin:
                        '5px 0 0',
                      color: '#777',
                      fontSize: '14px',
                    }}
                  >
                    Find your order quickly
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    style={{
                      border: 'none',
                      background:
                        'transparent',
                      color: '#ff5722',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '14px',
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* STATUS BUTTONS */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginBottom: '15px',
                }}
              >
                {[
                  {
                    value: 'All',
                    label: 'All Orders',
                  },
                  {
                    value: 'Active',
                    label: 'Active Orders',
                  },
                  {
                    value: 'Delivered',
                    label: 'Delivered',
                  },
                  {
                    value: 'Cancelled',
                    label: 'Cancelled',
                  },
                ].map((filter) => {
                  const selected =
                    statusFilter ===
                    filter.value;

                  return (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() =>
                        setStatusFilter(
                          filter.value
                        )
                      }
                      style={{
                        padding:
                          '9px 16px',
                        borderRadius:
                          '20px',
                        border: selected
                          ? '1px solid #ff5722'
                          : '1px solid #ddd',
                        background: selected
                          ? '#ff5722'
                          : '#fff',
                        color: selected
                          ? '#fff'
                          : '#555',
                        fontWeight:
                          selected
                            ? '600'
                            : '500',
                        cursor:
                          'pointer',
                        fontSize:
                          '14px',
                      }}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              {/* DATE FILTER */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flexWrap: 'wrap',
                  paddingTop: '15px',
                  borderTop:
                    '1px solid #eee',
                }}
              >
                <span
                  style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#444',
                  }}
                >
                  📅 Date:
                </span>

                <select
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(
                      e.target.value
                    )
                  }
                  style={{
                    padding:
                      '9px 35px 9px 12px',
                    border:
                      '1px solid #ddd',
                    borderRadius: '8px',
                    background: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="All">
                    All Dates
                  </option>

                  <option value="Today">
                    Today
                  </option>

                  <option value="Last 7 Days">
                    Last 7 Days
                  </option>

                  <option value="Last 30 Days">
                    Last 30 Days
                  </option>
                </select>

                <span
                  style={{
                    marginLeft: 'auto',
                    color: '#777',
                    fontSize: '14px',
                  }}
                >
                  {filteredOrders.length}{' '}
                  {filteredOrders.length ===
                  1
                    ? 'order'
                    : 'orders'}
                </span>
              </div>
            </div>
          )}

        {/* LOADING */}
        {loading ? (
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
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
              Please wait while we load
              your orders.
            </p>
          </div>
        ) : error ? (
          /* ERROR */
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <h2>
              Unable to Load Orders
            </h2>

            <p
              style={{
                color: '#d32f2f',
              }}
            >
              {error}
            </p>
          </div>
        ) : orders.length === 0 ? (
          /* NO ORDERS */
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '60px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '60px',
                marginBottom: '20px',
              }}
            >
              📦
            </div>

            <h2>
              No Orders Yet
            </h2>

            <p
              style={{
                color: '#666',
                marginBottom: '25px',
              }}
            >
              You haven't placed any
              orders yet.
            </p>

            <Link
              href="/"
              style={{
                display:
                  'inline-block',
                padding: '12px 25px',
                background:
                  '#ff5722',
                color: '#fff',
                borderRadius: '7px',
                textDecoration:
                  'none',
                fontWeight: 'bold',
              }}
            >
              Start Ordering
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* NO MATCHING ORDERS */
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '55px 20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '50px',
                marginBottom: '15px',
              }}
            >
              🔍
            </div>

            <h2>
              No Orders Found
            </h2>

            <p
              style={{
                color: '#666',
                marginBottom: '22px',
              }}
            >
              There are no orders matching
              the selected filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              style={{
                padding: '11px 22px',
                border: 'none',
                borderRadius: '7px',
                background:
                  '#ff5722',
                color: '#fff',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Show All Orders
            </button>
          </div>
        ) : (
          /* ORDERS LIST */
          <div>
            {filteredOrders.map((order) => {
              const isCancelled =
                order.order_status ===
                'Cancelled';

              const trackerStatus =
                getTrackerStatus(
                  order.order_status
                );

              const currentStep =
                getCurrentStep(
                  order.order_status
                );

              const statusHistory =
                Array.isArray(
                  order.status_history
                )
                  ? order.status_history
                  : [];

              const canCancel =
                canCancelOrder(
                  order.order_status
                );

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#fff',
                    border:
                      '1px solid #ddd',
                    borderRadius:
                      '12px',
                    padding: '25px',
                    marginBottom:
                      '20px',
                  }}
                >
                  {/* ORDER HEADER */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'flex-start',
                      gap: '20px',
                      marginBottom:
                        '20px',
                      flexWrap:
                        'wrap',
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
                        Order #{order.id}
                      </h3>

                      <p
                        style={{
                          margin: 0,
                          color: '#666',
                          fontSize:
                            '14px',
                        }}
                      >
                        {formatDate(
                          order.created_at
                        )}
                      </p>
                    </div>

                    <span
                      style={{
                        display:
                          'inline-block',
                        padding:
                          '7px 14px',
                        borderRadius:
                          '20px',
                        background:
                          isCancelled
                            ? '#ffebee'
                            : order.order_status ===
                              'Delivered'
                            ? '#e8f5e9'
                            : '#fff3e0',
                        color:
                          isCancelled
                            ? '#c62828'
                            : order.order_status ===
                              'Delivered'
                            ? '#2e7d32'
                            : '#e65100',
                        fontWeight:
                          'bold',
                        fontSize:
                          '14px',
                      }}
                    >
                      {order.order_status ||
                        'Processing'}
                    </span>
                  </div>

                  {/* BUTTONS */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent:
                        'flex-end',
                      alignItems:
                        'center',
                      gap: '10px',
                      marginBottom:
                        '20px',
                      flexWrap:
                        'wrap',
                    }}
                  >
                    <Link
                      href={`/orders/${order.id}`}
                      style={{
                        display:
                          'inline-block',
                        padding:
                          '10px 18px',
                        background:
                          '#ff5722',
                        color: '#fff',
                        borderRadius:
                          '7px',
                        textDecoration:
                          'none',
                        fontWeight:
                          'bold',
                      }}
                    >
                      View Details
                    </Link>

                    {canCancel && (
                      <button
                        type="button"
                        onClick={() =>
                          handleCancelOrder(
                            order.id
                          )
                        }
                        disabled={
                          cancellingOrderId ===
                          order.id
                        }
                        style={{
                          padding:
                            '10px 18px',
                          border: 'none',
                          borderRadius:
                            '7px',
                          background:
                            cancellingOrderId ===
                            order.id
                              ? '#ccc'
                              : '#e53935',
                          color: '#fff',
                          fontWeight:
                            'bold',
                          cursor:
                            cancellingOrderId ===
                            order.id
                              ? 'not-allowed'
                              : 'pointer',
                        }}
                      >
                        {cancellingOrderId ===
                        order.id
                          ? 'Cancelling...'
                          : 'Cancel Order'}
                      </button>
                    )}
                  </div>

                  <hr />

                  {/* STATUS TRACKER */}
                  <div
                    style={{
                      marginTop:
                        '25px',
                      marginBottom:
                        '35px',
                      padding:
                        '30px 20px',
                      background:
                        '#fafafa',
                      border:
                        '1px solid #eee',
                      borderRadius:
                        '12px',
                      overflowX:
                        'auto',
                    }}
                  >
                    <h2
                      style={{
                        textAlign:
                          'center',
                        marginBottom:
                          '35px',
                        fontSize:
                          '28px',
                        fontWeight:
                          '500',
                      }}
                    >
                      Order Status
                    </h2>

                    {isCancelled ? (
                      <div
                        style={{
                          textAlign:
                            'center',
                          padding:
                            '25px',
                          background:
                            '#ffebee',
                          border:
                            '1px solid #ffcdd2',
                          borderRadius:
                            '12px',
                        }}
                      >
                        <div
                          style={{
                            width:
                              '55px',
                            height:
                              '55px',
                            borderRadius:
                              '50%',
                            background:
                              '#e53935',
                            color:
                              '#fff',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            margin:
                              '0 auto 15px',
                            fontSize:
                              '30px',
                            fontWeight:
                              'bold',
                          }}
                        >
                          ×
                        </div>

                        <h3
                          style={{
                            margin:
                              '0 0 8px',
                            color:
                              '#c62828',
                            fontSize:
                              '22px',
                          }}
                        >
                          Order Cancelled
                        </h3>

                        <p
                          style={{
                            margin: 0,
                            color:
                              '#666',
                          }}
                        >
                          Current
                          status:{' '}
                          <strong
                            style={{
                              color:
                                '#c62828',
                            }}
                          >
                            Cancelled
                          </strong>
                        </p>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'space-between',
                            width:
                              '100%',
                            minWidth:
                              '700px',
                          }}
                        >
                          {statusSteps.map(
                            (
                              step,
                              index
                            ) => {
                              const completed =
                                index <=
                                currentStep;

                              const isCurrent =
                                index ===
                                currentStep;

                              return (
                                <div
                                  key={
                                    step
                                  }
                                  style={{
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    flex: 1,
                                  }}
                                >
                                  <div
                                    style={{
                                      display:
                                        'flex',
                                      flexDirection:
                                        'column',
                                      alignItems:
                                        'center',
                                      minWidth:
                                        '80px',
                                      position:
                                        'relative',
                                      zIndex:
                                        2,
                                    }}
                                  >
                                    <div
                                      style={{
                                        width:
                                          '54px',
                                        height:
                                          '54px',
                                        borderRadius:
                                          '50%',
                                        background:
                                          completed
                                            ? '#ff5722'
                                            : '#ddd',
                                        color:
                                          completed
                                            ? '#fff'
                                            : '#666',
                                        display:
                                          'flex',
                                        alignItems:
                                          'center',
                                        justifyContent:
                                          'center',
                                        fontSize:
                                          '20px',
                                        fontWeight:
                                          'bold',
                                        border:
                                          isCurrent
                                            ? '5px solid #ffe0d6'
                                            : 'none',
                                        boxSizing:
                                          'border-box',
                                      }}
                                    >
                                      {completed
                                        ? '✓'
                                        : index +
                                          1}
                                    </div>

                                    <span
                                      style={{
                                        marginTop:
                                          '15px',
                                        fontSize:
                                          '14px',
                                        textAlign:
                                          'center',
                                        color:
                                          completed
                                            ? '#222'
                                            : '#999',
                                        fontWeight:
                                          isCurrent
                                            ? 'bold'
                                            : 'normal',
                                        whiteSpace:
                                          'nowrap',
                                      }}
                                    >
                                      {
                                        step
                                      }
                                    </span>
                                  </div>

                                  {index <
                                    statusSteps.length -
                                      1 && (
                                    <div
                                      style={{
                                        height:
                                          '5px',
                                        flex: 1,
                                        background:
                                          index <
                                          currentStep
                                            ? '#ff5722'
                                            : '#ddd',
                                        margin:
                                          '0 -2px',
                                        marginTop:
                                          '-35px',
                                      }}
                                    />
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>

                        <p
                          style={{
                            textAlign:
                              'center',
                            marginTop:
                              '45px',
                            marginBottom:
                              0,
                            fontSize:
                              '18px',
                            color:
                              '#555',
                          }}
                        >
                          Current
                          status:{' '}
                          <strong
                            style={{
                              color:
                                '#ff5722',
                            }}
                          >
                            {
                              trackerStatus
                            }
                          </strong>
                        </p>
                      </>
                    )}
                  </div>

                  {/* STATUS HISTORY */}
                  <div
                    style={{
                      marginTop:
                        '25px',
                      marginBottom:
                        '30px',
                      padding: '25px',
                      background:
                        '#fff',
                      border:
                        '1px solid #eee',
                      borderRadius:
                        '12px',
                    }}
                  >
                    <h3
                      style={{
                        marginTop: 0,
                        marginBottom:
                          '20px',
                      }}
                    >
                      Status History
                    </h3>

                    {statusHistory.length ===
                    0 ? (
                      <p
                        style={{
                          color:
                            '#777',
                          margin: 0,
                        }}
                      >
                        No status
                        history
                        available.
                      </p>
                    ) : (
                      <div>
                        {statusHistory.map(
                          (
                            history,
                            index
                          ) => {
                            const isLast =
                              index ===
                              statusHistory.length -
                                1;

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
                                  display:
                                    'flex',
                                  alignItems:
                                    'flex-start',
                                  gap: '15px',
                                  position:
                                    'relative',
                                  paddingBottom:
                                    isLast
                                      ? '0'
                                      : '25px',
                                }}
                              >
                                <div
                                  style={{
                                    width:
                                      '34px',
                                    minWidth:
                                      '34px',
                                    height:
                                      '34px',
                                    borderRadius:
                                      '50%',
                                    background:
                                      isCancelledStatus
                                        ? '#e53935'
                                        : '#ff5722',
                                    color:
                                      '#fff',
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    justifyContent:
                                      'center',
                                    fontWeight:
                                      'bold',
                                    zIndex:
                                      2,
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
                                      left:
                                        '16px',
                                      top:
                                        '34px',
                                      width:
                                        '2px',
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
                                      display:
                                        'flex',
                                      justifyContent:
                                        'space-between',
                                      alignItems:
                                        'center',
                                      gap:
                                        '15px',
                                      flexWrap:
                                        'wrap',
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
                                      {
                                        history.status
                                      }
                                    </strong>

                                    <span
                                      style={{
                                        color:
                                          '#777',
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
                                      color:
                                        '#999',
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

                  <hr />

                  {/* PRODUCTS */}
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
                    order.products.length >
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
                                '10px 0',
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
                              ).toFixed(2)}
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

                  {/* DELIVERY ADDRESS */}
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
                            '1.6',
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

                  {/* PAYMENT + TOTAL */}
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
                        ).toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}