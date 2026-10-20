
'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MyContext } from '../../context/ThemeContext';

import {
  MdCategory,
  MdFastfood,
  MdListAlt,
  MdHistory,
  MdShoppingBag,
  MdPending,
  MdRestaurant,
  MdDeliveryDining,
  MdCheckCircle,
  MdCancel,
  MdCurrencyRupee,
  MdLocalOffer,
  MdPayments,
  MdRefresh,
} from 'react-icons/md';

const API_BASE = 'http://localhost:8000/api/admin';

export default function AdminDashboard() {
  const context = useContext(MyContext);
  const user = context?.userDetails;

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!context?.isLoggedIn || user?.role !== 'Admin') {
      setAccessDenied(true);
    } else {
      setAccessDenied(false);
    }

    setCheckingAccess(false);
  }, [context?.isLoggedIn, user]);

  const fetchDashboard = async (manual = false) => {
    if (manual) setRefreshing(true);

    try {
      const [ordersResponse, analyticsResponse] = await Promise.all([
        fetch(`${API_BASE}/all-orders`, {
          credentials: 'include',
        }),
        fetch(`${API_BASE}/analytics`, {
          credentials: 'include',
        }),
      ]);

      const [ordersResult, analyticsResult] = await Promise.all([
        ordersResponse.json(),
        analyticsResponse.json(),
      ]);

      if (!ordersResponse.ok) {
        throw new Error(
          ordersResult.message || 'Failed to fetch orders.'
        );
      }

      if (!analyticsResponse.ok) {
        throw new Error(
          analyticsResult.message || 'Failed to fetch analytics.'
        );
      }

      setOrders(ordersResult.data || []);
      setAnalytics(analyticsResult.data || null);
      setError('');
    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (checkingAccess || accessDenied) return;

    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard();
    }, 10000);

    return () => clearInterval(interval);
  }, [checkingAccess, accessDenied]);

  const getStatus = (order) =>
    String(order.order_status || '')
      .trim()
      .toLowerCase()
      .replace(/[_-]/g, ' ');

  const isCancelled = (order) => getStatus(order) === 'cancelled';

  const getLocalDateKey = (date) => {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
  };

  const todayKey = getLocalDateKey(new Date());

  const todayOrders = useMemo(
    () =>
      orders.filter((order) => {
        if (!order.created_at) return false;
        return getLocalDateKey(new Date(order.created_at)) === todayKey;
      }),
    [orders, todayKey]
  );

  const processingToday = todayOrders.filter((order) =>
    ['processing', 'confirmed'].includes(getStatus(order))
  );

  const preparingToday = todayOrders.filter((order) =>
    ['preparing', 'prepared'].includes(getStatus(order))
  );

  const deliveryToday = todayOrders.filter((order) =>
    ['out for delivery', 'shipped'].includes(getStatus(order))
  );

  const deliveredToday = todayOrders.filter((order) =>
    ['delivered', 'completed'].includes(getStatus(order))
  );

  const cancelledToday = todayOrders.filter(isCancelled);

  const formatMoney = (amount) =>
    `₹${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const payment = analytics?.paymentAnalytics || {};
  const cod = payment.cod || {};
  const online = payment.online || {};
  const other = payment.other || {};

  const paymentGroups = [
    {
      key: 'cod',
      label: 'Cash on Delivery',
      data: cod,
      color: '#e87520',
      background: '#fff3e8',
    },
    {
      key: 'online',
      label: 'Online Payments',
      data: online,
      color: '#1976d2',
      background: '#eaf3ff',
    },
    {
      key: 'other',
      label: 'Other / Unknown',
      data: other,
      color: '#757575',
      background: '#f1f1f1',
    },
  ];

  const maxPaymentOrders = Math.max(
    Number(cod.orders || 0),
    Number(online.orders || 0),
    Number(other.orders || 0),
    1
  );

  if (checkingAccess) {
    return <p style={{ padding: 30 }}>Checking admin access...</p>;
  }

  if (accessDenied) {
    return (
      <div style={styles.messageCard}>
        <h1>Access Denied</h1>
        <p>Admin privileges are required to access this page.</p>
        <Link href="/" style={styles.primaryLink}>
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Admin Dashboard</h1>
          <p style={styles.muted}>
            Monitor orders, sales and payment methods.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchDashboard(true)}
          disabled={refreshing}
          style={styles.refreshButton}
        >
          <MdRefresh size={20} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      {error && (
        <div style={styles.error}>
          {error}
          <button
            onClick={() => fetchDashboard(true)}
            style={styles.retryButton}
          >
            Try again
          </button>
        </div>
      )}

      {loading && !analytics ? (
        <div style={styles.panel}>
          Loading dashboard analytics...
        </div>
      ) : (
        <>
          {/* Business overview */}
          <SectionTitle>Business Overview</SectionTitle>

          <div style={styles.grid}>
            <StatCard
              title="Total Orders"
              value={analytics?.overview?.totalOrders ?? orders.length}
              description="All recorded orders"
              icon={MdShoppingBag}
              color="#ef6c00"
              background="#fff3e0"
            />
            <StatCard
              title="Today's Orders"
              value={analytics?.overview?.todayOrders ?? todayOrders.length}
              description="Orders created today"
              icon={MdPending}
              color="#1565c0"
              background="#e3f2fd"
            />
            <StatCard
              title="Pending Orders"
              value={analytics?.overview?.pendingOrders ?? 0}
              description="Awaiting completion"
              icon={MdRestaurant}
              color="#8e5b00"
              background="#fff8e1"
            />
            <StatCard
              title="Delivered Orders"
              value={analytics?.overview?.deliveredOrders ?? 0}
              description="Successfully delivered"
              icon={MdCheckCircle}
              color="#2e7d32"
              background="#e8f5e9"
            />
            <StatCard
              title="Cancelled Orders"
              value={analytics?.overview?.cancelledOrders ?? 0}
              description="Cancelled orders"
              icon={MdCancel}
              color="#c62828"
              background="#ffebee"
            />
          </div>

          {/* Today's operations */}
          <SectionTitle>Today's Operations</SectionTitle>

          <div style={styles.grid}>
            <StatCard
              title="Processing"
              value={processingToday.length}
              description="Processing or confirmed"
              icon={MdPending}
              color="#1565c0"
              background="#e3f2fd"
            />
            <StatCard
              title="Preparing"
              value={preparingToday.length}
              description="Being prepared"
              icon={MdRestaurant}
              color="#ef6c00"
              background="#fff3e0"
            />
            <StatCard
              title="Out for Delivery"
              value={deliveryToday.length}
              description="Orders on the way"
              icon={MdDeliveryDining}
              color="#6a1b9a"
              background="#f3e5f5"
            />
            <StatCard
              title="Delivered Today"
              value={deliveredToday.length}
              description="Completed today"
              icon={MdCheckCircle}
              color="#2e7d32"
              background="#e8f5e9"
            />
            <StatCard
              title="Cancelled Today"
              value={cancelledToday.length}
              description="Cancelled today"
              icon={MdCancel}
              color="#c62828"
              background="#ffebee"
            />
          </div>

          {/* Revenue */}
          <SectionTitle>Sales Overview</SectionTitle>

          <div style={styles.grid}>
            <MoneyCard
              title="Today's Sales"
              amount={analytics?.revenue?.today}
              description="Non-cancelled orders created today"
            />
            <MoneyCard
              title="Last 7 Days"
              amount={analytics?.revenue?.week}
              description="Non-cancelled orders over seven days"
            />
            <MoneyCard
              title="This Month"
              amount={analytics?.revenue?.month}
              description="Non-cancelled orders this month"
            />
            <MoneyCard
              title="Total Sales"
              amount={analytics?.revenue?.total}
              description="All non-cancelled orders"
            />
          </div>

          {/* Payment analytics */}
          <SectionTitle>Payment Analytics</SectionTitle>

          <div style={styles.paymentGrid}>
            {paymentGroups.map((group) => (
              <div key={group.key} style={styles.paymentCard}>
                <div style={styles.paymentCardTop}>
                  <div
                    style={{
                      ...styles.paymentIcon,
                      color: group.color,
                      background: group.background,
                    }}
                  >
                    <MdPayments size={27} />
                  </div>

                  <span
                    style={{
                      ...styles.percentageBadge,
                      background: group.background,
                      color: group.color,
                    }}
                  >
                    {Number(group.data.percentage || 0).toFixed(1)}%
                  </span>
                </div>

                <p style={styles.paymentLabel}>{group.label}</p>
                <h3 style={styles.paymentCount}>
                  {Number(group.data.orders || 0)}
                  <span style={styles.smallText}> orders</span>
                </h3>

                <p style={styles.paymentValue}>
                  {formatMoney(group.data.orderValue)}
                </p>

                <p style={styles.mutedSmall}>
                  Non-cancelled order value
                </p>

                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressBar,
                      background: group.color,
                      width: `${
                        (Number(group.data.orders || 0) /
                          maxPaymentOrders) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <div style={styles.cancelledRow}>
                  <span>Cancelled orders</span>
                  <strong>
                    {Number(group.data.cancelledOrders || 0)}
                  </strong>
                </div>

                <div style={styles.cancelledRow}>
                  <span>Cancelled value</span>
                  <strong>
                    {formatMoney(group.data.cancelledValue)}
                  </strong>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.panel}>
            <h3 style={styles.panelTitle}>
              COD vs Online — Order Count
            </h3>
            <p style={styles.mutedSmall}>
              The bars compare the number of orders by the payment
              method stored at checkout.
            </p>

            {paymentGroups.map((group) => (
              <div key={group.key} style={styles.chartRow}>
                <div style={styles.chartLabel}>
                  <span>{group.label}</span>
                  <strong>{Number(group.data.orders || 0)}</strong>
                </div>

                <div style={styles.progressTrack}>
                  <div
                    style={{
                      ...styles.progressBar,
                      background: group.color,
                      width: `${
                        (Number(group.data.orders || 0) /
                          maxPaymentOrders) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}

            <div style={styles.paymentSummary}>
              <div>
                <span style={styles.mutedSmall}>Total orders</span>
                <h3>{Number(payment.totalOrders ?? orders.length)}</h3>
              </div>
              <div>
                <span style={styles.mutedSmall}>
                  Non-cancelled order value
                </span>
                <h3>{formatMoney(payment.totalOrderValue)}</h3>
              </div>
            </div>

            <p style={styles.note}>
              Note: your current checkout saves the selected payment
              method in the <code>payment_status</code> field.
              These figures classify that stored value. They do not
              verify whether money was actually collected or whether
              an online transaction succeeded.
            </p>
          </div>

          {/* Seven-day sales chart */}
          <SectionTitle>Seven-Day Sales Trend</SectionTitle>

          <div style={styles.panel}>
            {analytics?.salesTrend?.length ? (
              <div style={styles.salesChart}>
                {analytics.salesTrend.map((day) => {
                  const maxRevenue = Math.max(
                    ...analytics.salesTrend.map(
                      (item) => Number(item.revenue || 0)
                    ),
                    1
                  );

                  const height =
                    (Number(day.revenue || 0) / maxRevenue) * 150;

                  return (
                    <div key={day.date} style={styles.salesBarColumn}>
                      <span style={styles.barValue}>
                        {formatMoney(day.revenue)}
                      </span>

                      <div style={styles.salesBarArea}>
                        <div
                          title={`${day.label}: ${formatMoney(day.revenue)}`}
                          style={{
                            ...styles.salesBar,
                            height: `${Math.max(height, 3)}px`,
                          }}
                        />
                      </div>

                      <span style={styles.barLabel}>{day.label}</span>
                      <span style={styles.mutedTiny}>
                        {day.orders} orders
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={styles.muted}>No sales trend data available.</p>
            )}
          </div>

          {/* Recent orders */}
          <SectionTitle>Recent Orders</SectionTitle>

          <div style={styles.panel}>
            {analytics?.recentOrders?.length ? (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Order ID</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Payment Method</th>
                      <th style={styles.th}>Order Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td style={styles.td}>
                          {String(order.id).slice(0, 8)}...
                        </td>
                        <td style={styles.td}>
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString(
                                'en-IN'
                              )
                            : '—'}
                        </td>
                        <td style={styles.td}>
                          {formatMoney(order.total_amount)}
                        </td>
                        <td style={styles.td}>
                          {order.payment_status || 'Unknown'}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.statusPill}>
                            {order.order_status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={styles.muted}>No recent orders found.</p>
            )}
          </div>

          {/* Quick Actions */}
          <SectionTitle>Quick Actions</SectionTitle>

          <div style={styles.grid}>
            <QuickAction
              href="/admin/orders"
              icon={MdListAlt}
              title="All Orders"
              description="Manage current customer orders"
            />
            <QuickAction
              href="/admin/order-history"
              icon={MdHistory}
              title="Order History"
              description="Review completed and cancelled orders"
            />
            <QuickAction
              href="/admin/add-product"
              icon={MdFastfood}
              title="Add Product"
              description="Add a new food item"
            />
            <QuickAction
              href="/admin/add-category"
              icon={MdCategory}
              title="Add Category"
              description="Create a food category"
            />
            <QuickAction
              href="/admin/coupons"
              icon={MdLocalOffer}
              title="Manage Coupons"
              description="Create and manage promotional codes"
            />
          </div>

          <div style={styles.footerNote}>
            Dashboard data refreshes automatically every 10 seconds.
            Use Refresh to load the latest information immediately.
          </div>
        </>
      )}
    </main>
  );
}

function SectionTitle({ children }) {
  return <h2 style={styles.sectionTitle}>{children}</h2>;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  background,
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div>
          <p style={styles.cardLabel}>{title}</p>
          <h3 style={styles.statValue}>{value}</h3>
        </div>
        <div style={{ ...styles.statIcon, color, background }}>
          <Icon size={28} />
        </div>
      </div>
      <p style={styles.mutedSmall}>{description}</p>
    </div>
  );
}

function MoneyCard({ title, amount, description }) {
  return (
    <div style={styles.moneyCard}>
      <div style={styles.moneyTitle}>
        <MdCurrencyRupee size={22} color="#ff5722" />
        <span>{title}</span>
      </div>
      <h3 style={styles.moneyValue}>{formatCurrency(amount)}</h3>
      <p style={styles.mutedSmall}>{description}</p>
    </div>
  );
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function QuickAction({ href, icon: Icon, title, description }) {
  return (
    <Link href={href} style={styles.quickAction}>
      <Icon size={34} color="#ff5722" />
      <h3 style={styles.quickTitle}>{title}</h3>
      <p style={styles.mutedSmall}>{description}</p>
    </Link>
  );
}

const styles = {
  page: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '10px 0 35px',
    color: '#242424',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 28,
  },
  pageTitle: { margin: '0 0 8px', fontSize: 30 },
  sectionTitle: {
    fontSize: 22,
    margin: '32px 0 15px',
  },
  muted: { color: '#666', lineHeight: 1.6 },
  mutedSmall: {
    color: '#777',
    fontSize: 12,
    lineHeight: 1.6,
    margin: '7px 0 0',
  },
  mutedTiny: { color: '#777', fontSize: 11, marginTop: 5 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: 15,
  },
  paymentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))',
    gap: 16,
  },
  statCard: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 13,
    padding: 19,
    minWidth: 0,
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardLabel: { color: '#666', margin: 0, fontSize: 13 },
  statValue: { fontSize: 31, margin: '9px 0 4px' },
  statIcon: {
    width: 49,
    height: 49,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moneyCard: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 13,
    padding: 22,
    minWidth: 0,
  },
  moneyTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    color: '#555',
    fontWeight: 600,
  },
  moneyValue: { fontSize: 26, margin: '12px 0 6px' },
  paymentCard: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 14,
    padding: 20,
    minWidth: 0,
  },
  paymentCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageBadge: {
    borderRadius: 20,
    padding: '6px 10px',
    fontSize: 12,
    fontWeight: 700,
  },
  paymentLabel: { margin: '17px 0 5px', color: '#555', fontSize: 14 },
  paymentCount: { fontSize: 28, margin: '6px 0' },
  smallText: { fontSize: 13, color: '#777', fontWeight: 400 },
  paymentValue: { fontSize: 21, fontWeight: 700, margin: '8px 0 0' },
  progressTrack: {
    width: '100%',
    height: 9,
    borderRadius: 20,
    overflow: 'hidden',
    background: '#eeeeee',
    marginTop: 9,
  },
  progressBar: {
    height: '100%',
    borderRadius: 20,
    minWidth: 0,
    transition: 'width 0.3s ease',
  },
  cancelledRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    fontSize: 12,
    color: '#666',
    marginTop: 13,
  },
  panel: {
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 13,
    padding: 22,
    marginTop: 15,
    minWidth: 0,
  },
  panelTitle: { margin: '0 0 6px', fontSize: 18 },
  chartRow: { marginTop: 20 },
  chartLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    fontSize: 13,
    marginBottom: 7,
  },
  paymentSummary: {
    display: 'flex',
    gap: 35,
    flexWrap: 'wrap',
    borderTop: '1px solid #eee',
    marginTop: 25,
    paddingTop: 18,
  },
  note: {
    margin: '20px 0 0',
    padding: 12,
    background: '#fff8e1',
    color: '#705200',
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 1.7,
  },
  salesChart: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
    gap: 10,
    alignItems: 'end',
    overflowX: 'auto',
  },
  salesBarColumn: {
    minWidth: 65,
    textAlign: 'center',
  },
  barValue: {
    display: 'block',
    fontSize: 10,
    color: '#555',
    overflowWrap: 'anywhere',
  },
  salesBarArea: {
    height: 155,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginTop: 8,
  },
  salesBar: {
    width: '65%',
    minWidth: 9,
    background: '#ff5722',
    borderRadius: '6px 6px 0 0',
  },
  barLabel: { display: 'block', fontSize: 12, marginTop: 9 },
  tableWrap: { overflowX: 'auto' },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
    textAlign: 'left',
  },
  th: {
    padding: '13px 12px',
    background: '#f7f7f7',
    borderBottom: '1px solid #ddd',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '13px 12px',
    borderBottom: '1px solid #eee',
    whiteSpace: 'nowrap',
  },
  statusPill: {
    display: 'inline-block',
    background: '#f3f3f3',
    padding: '5px 9px',
    borderRadius: 15,
    fontSize: 11,
  },
  quickAction: {
    display: 'block',
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 12,
    padding: 20,
    color: '#222',
    textDecoration: 'none',
  },
  quickTitle: { margin: '10px 0 6px', fontSize: 16 },
  footerNote: {
    color: '#777',
    fontSize: 12,
    marginTop: 25,
    lineHeight: 1.6,
  },
  refreshButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 7,
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '10px 15px',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  },
  error: {
    background: '#ffebee',
    border: '1px solid #ef9a9a',
    color: '#b71c1c',
    padding: 13,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryButton: {
    marginLeft: 12,
    padding: '5px 9px',
    cursor: 'pointer',
  },
  messageCard: {
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: 12,
    padding: 35,
    textAlign: 'center',
  },
  primaryLink: {
    display: 'inline-block',
    background: '#ff5722',
    color: '#fff',
    textDecoration: 'none',
    padding: '11px 20px',
    borderRadius: 7,
    marginTop: 12,
  },
};
