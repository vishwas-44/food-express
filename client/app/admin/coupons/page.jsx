
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

const API = 'http://localhost:8000/api/admin/coupons';

const EMPTY_FORM = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '10',
  minimum_order_amount: '0',
  maximum_discount: '100',
  usage_limit: '100',
  expires_at: '',
  is_active: true,
};

function toLocalDateTime(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

function formatDate(value) {
  if (!value) return 'No expiry';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function money(value) {
  return Number(value || 0).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function isExpired(coupon) {
  return Boolean(
    coupon.expires_at &&
    new Date(coupon.expires_at).getTime() <= Date.now()
  );
}

function isUsageExhausted(coupon) {
  return (
    coupon.usage_limit !== null &&
    coupon.usage_limit !== undefined &&
    Number(coupon.used_count) >= Number(coupon.usage_limit)
  );
}

function effectiveStatus(coupon) {
  if (!coupon.is_active) return 'Inactive';
  if (isExpired(coupon)) return 'Expired';
  if (isUsageExhausted(coupon)) return 'Limit reached';
  return 'Active';
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const fetchCoupons = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);

    try {
      const response = await fetch(API, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load coupons.');
      }

      setCoupons(Array.isArray(data.data) ? data.data : []);
      setError('');
    } catch (err) {
      console.error('Fetch coupons error:', err);
      setError(err.message || 'Unable to connect to the server.');
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const stats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter(
      (coupon) => effectiveStatus(coupon) === 'Active'
    ).length,
    inactive: coupons.filter((coupon) => !coupon.is_active).length,
    usage: coupons.reduce(
      (total, coupon) => total + Number(coupon.used_count || 0),
      0
    ),
  }), [coupons]);

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        !query ||
        String(coupon.code || '').toLowerCase().includes(query) ||
        String(coupon.description || '').toLowerCase().includes(query);

      const status = effectiveStatus(coupon);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && status === 'Active') ||
        (filter === 'inactive' && status === 'Inactive') ||
        (filter === 'expired' && status === 'Expired') ||
        (filter === 'exhausted' && status === 'Limit reached');

      return matchesSearch && matchesFilter;
    });
  }, [coupons, search, filter]);

  const setField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const startCreate = () => {
    setError('');
    setMessage('');
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const startEdit = (coupon) => {
    setError('');
    setMessage('');
    setEditingId(coupon.id);
    setForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discount_type: coupon.discount_type || 'percentage',
      discount_value: String(coupon.discount_value ?? ''),
      minimum_order_amount: String(
        coupon.minimum_order_amount ?? 0
      ),
      maximum_discount:
        coupon.maximum_discount === null ||
        coupon.maximum_discount === undefined
          ? ''
          : String(coupon.maximum_discount),
      usage_limit:
        coupon.usage_limit === null ||
        coupon.usage_limit === undefined
          ? ''
          : String(coupon.usage_limit),
      expires_at: toLocalDateTime(coupon.expires_at),
      is_active: Boolean(coupon.is_active),
    });
    setShowForm(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discount_value: Number(form.discount_value),
        minimum_order_amount: Number(form.minimum_order_amount),
        maximum_discount:
          form.discount_type === 'percentage' &&
          form.maximum_discount !== ''
            ? Number(form.maximum_discount)
            : null,
        usage_limit:
          form.usage_limit === '' ? null : Number(form.usage_limit),
        expires_at: form.expires_at
          ? new Date(form.expires_at).toISOString()
          : null,
      };

      const isEditing = Boolean(editingId);

      const response = await fetch(
        isEditing ? `${API}/${editingId}` : API,
        {
          method: isEditing ? 'PUT' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not save coupon.');
      }

      setMessage(data.message || 'Coupon saved successfully.');
      resetForm();
      await fetchCoupons(false);
    } catch (err) {
      console.error('Save coupon error:', err);
      setError(err.message || 'Unable to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (coupon) => {
    const nextActive = !coupon.is_active;

    if (
      nextActive &&
      (isExpired(coupon) || isUsageExhausted(coupon))
    ) {
      setError(
        isExpired(coupon)
          ? 'This coupon has expired. Edit its expiry date before activating it.'
          : 'This coupon has reached its usage limit and cannot be activated for use.'
      );
      setMessage('');
      return;
    }

    setBusyId(coupon.id);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API}/${coupon.id}/active`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextActive }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not update coupon status.');
      }

      setMessage(data.message || 'Coupon status updated.');
      await fetchCoupons(false);
    } catch (err) {
      console.error('Toggle coupon error:', err);
      setError(err.message || 'Unable to update coupon status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Delete coupon "${coupon.code}"?\n\nCoupons already used in an order cannot be deleted.`
    );

    if (!confirmed) return;

    setBusyId(coupon.id);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API}/${coupon.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete coupon.');
      }

      setMessage(data.message || 'Coupon deleted successfully.');
      await fetchCoupons(false);
    } catch (err) {
      console.error('Delete coupon error:', err);
      setError(err.message || 'Unable to delete coupon.');
    } finally {
      setBusyId(null);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '11px 12px',
    border: '1px solid #d6d6d6',
    borderRadius: '8px',
    fontSize: '14px',
    background: '#fff',
    color: '#222',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '7px',
    fontWeight: 600,
    fontSize: '13px',
    color: '#444',
  };

  const buttonStyle = {
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '13px',
  };

  const statusColors = {
    Active: { background: '#e8f5e9', color: '#24723b' },
    Inactive: { background: '#eeeeee', color: '#555' },
    Expired: { background: '#fff3e0', color: '#a34d00' },
    'Limit reached': { background: '#ffebee', color: '#b71c1c' },
  };

  return (
    <main style={{
      maxWidth: '1400px',
      margin: '0 auto',
      paddingBottom: '40px',
      color: '#222',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '24px',
      }}>
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: '30px' }}>
            Coupon Management
          </h1>
          <p style={{ margin: 0, color: '#666' }}>
            Create discounts and manage promotional coupon codes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/admin" style={{
            ...buttonStyle,
            background: '#f2f2f2',
            color: '#222',
            textDecoration: 'none',
          }}>
            ← Admin Dashboard
          </Link>

          <button
            type="button"
            onClick={() => fetchCoupons()}
            style={{ ...buttonStyle, background: '#f2f2f2', color: '#222' }}
          >
            Refresh
          </button>

          <button
            type="button"
            onClick={startCreate}
            style={{ ...buttonStyle, background: '#ff5722', color: '#fff' }}
          >
            + Create Coupon
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" style={{
          background: '#ffebee',
          border: '1px solid #ef9a9a',
          color: '#b71c1c',
          borderRadius: '8px',
          padding: '13px 15px',
          marginBottom: '16px',
          whiteSpace: 'pre-wrap',
        }}>
          {error}
        </div>
      )}

      {message && (
        <div role="status" style={{
          background: '#e8f5e9',
          border: '1px solid #a5d6a7',
          color: '#256c35',
          borderRadius: '8px',
          padding: '13px 15px',
          marginBottom: '16px',
        }}>
          {message}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px',
        marginBottom: '25px',
      }}>
        {[
          ['Total Coupons', stats.total],
          ['Available Now', stats.active],
          ['Inactive', stats.inactive],
          ['Total Redemptions', stats.usage],
        ].map(([title, value]) => (
          <div key={title} style={{
            background: '#fff',
            border: '1px solid #e2e2e2',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{ margin: '0 0 10px', color: '#666', fontSize: '13px' }}>
              {title}
            </p>
            <strong style={{ fontSize: '28px' }}>{value}</strong>
          </div>
        ))}
      </div>

      {showForm && (
        <section style={{
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '25px',
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px' }}>
            {editingId ? 'Edit Coupon' : 'Create Coupon'}
          </h2>

          <form onSubmit={handleSave}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '17px',
            }}>
              <label>
                <span style={labelStyle}>Coupon Code *</span>
                <input
                  required
                  maxLength={40}
                  value={form.code}
                  onChange={(e) => setField('code', e.target.value.toUpperCase())}
                  placeholder="e.g. SAVE10"
                  style={inputStyle}
                />
                <small style={{ color: '#777' }}>
                  Letters, numbers, hyphens, and underscores only.
                </small>
              </label>

              <label>
                <span style={labelStyle}>Discount Type *</span>
                <select
                  required
                  value={form.discount_type}
                  onChange={(e) => {
                    const type = e.target.value;
                    setForm((previous) => ({
                      ...previous,
                      discount_type: type,
                      maximum_discount: type === 'percentage'
                        ? (previous.maximum_discount || '100')
                        : '',
                    }));
                  }}
                  style={inputStyle}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed amount (₹)</option>
                </select>
              </label>

              <label>
                <span style={labelStyle}>
                  Discount Value * {form.discount_type === 'percentage' ? '(%)' : '(₹)'}
                </span>
                <input
                  required
                  type="number"
                  min="0.01"
                  max={form.discount_type === 'percentage' ? '100' : undefined}
                  step="0.01"
                  value={form.discount_value}
                  onChange={(e) => setField('discount_value', e.target.value)}
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>Minimum Order Amount (₹) *</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minimum_order_amount}
                  onChange={(e) => setField('minimum_order_amount', e.target.value)}
                  style={inputStyle}
                />
              </label>

              {form.discount_type === 'percentage' && (
                <label>
                  <span style={labelStyle}>Maximum Discount (₹)</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.maximum_discount}
                    onChange={(e) => setField('maximum_discount', e.target.value)}
                    placeholder="Leave blank for no cap"
                    style={inputStyle}
                  />
                </label>
              )}

              <label>
                <span style={labelStyle}>Usage Limit</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.usage_limit}
                  onChange={(e) => setField('usage_limit', e.target.value)}
                  placeholder="Leave blank for unlimited"
                  style={inputStyle}
                />
              </label>

              <label>
                <span style={labelStyle}>Expiry Date and Time</span>
                <input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setField('expires_at', e.target.value)}
                  style={inputStyle}
                />
                <small style={{ color: '#777' }}>
                  Leave blank if the coupon should not expire.
                </small>
              </label>

              <label>
                <span style={labelStyle}>Description</span>
                <input
                  maxLength={250}
                  value={form.description}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="e.g. Save on your next order"
                  style={inputStyle}
                />
              </label>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                alignSelf: 'center',
                paddingTop: '12px',
              }}>
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setField('is_active', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 600 }}>Active immediately</span>
              </label>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '22px',
              flexWrap: 'wrap',
            }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  ...buttonStyle,
                  background: '#ff5722',
                  color: '#fff',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Coupon'}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={resetForm}
                style={{ ...buttonStyle, background: '#eeeeee', color: '#222' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section style={{
        background: '#fff',
        border: '1px solid #e2e2e2',
        borderRadius: '12px',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '18px',
        }}>
          <h2 style={{ margin: 0, fontSize: '21px' }}>All Coupons</h2>

          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code or description..."
              aria-label="Search coupons"
              style={{ ...inputStyle, width: 'min(280px, 100%)' }}
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter coupons"
              style={{ ...inputStyle, width: 'auto', minWidth: '150px' }}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
              <option value="exhausted">Limit reached</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#666', padding: '30px 0', textAlign: 'center' }}>
            Loading coupons...
          </p>
        ) : filteredCoupons.length === 0 ? (
          <div style={{ padding: '35px 10px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px' }}>No coupons found</h3>
            <p style={{ color: '#666', margin: 0 }}>
              Create a coupon or adjust your search and filter.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '1050px',
              fontSize: '13px',
            }}>
              <thead>
                <tr style={{ background: '#f7f7f7', textAlign: 'left' }}>
                  {[
                    'Coupon',
                    'Discount',
                    'Minimum Order',
                    'Usage',
                    'Expiry',
                    'Status',
                    'Actions',
                  ].map((heading) => (
                    <th key={heading} style={{
                      padding: '13px 12px',
                      borderBottom: '1px solid #e5e5e5',
                      whiteSpace: 'nowrap',
                    }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredCoupons.map((coupon) => {
                  const status = effectiveStatus(coupon);
                  const colors = statusColors[status];

                  return (
                    <tr key={coupon.id}>
                      <td style={{
                        padding: '15px 12px',
                        borderBottom: '1px solid #eee',
                      }}>
                        <strong style={{ fontSize: '14px' }}>{coupon.code}</strong>
                        <div style={{
                          color: '#777',
                          marginTop: '5px',
                          maxWidth: '230px',
                          overflowWrap: 'anywhere',
                        }}>
                          {coupon.description || 'No description'}
                        </div>
                      </td>

                      <td style={{
                        padding: '15px 12px',
                        borderBottom: '1px solid #eee',
                        whiteSpace: 'nowrap',
                      }}>
                        <strong>
                          {coupon.discount_type === 'percentage'
                            ? `${Number(coupon.discount_value)}%`
                            : money(coupon.discount_value)}
                        </strong>
                        {coupon.discount_type === 'percentage' &&
                          coupon.maximum_discount != null && (
                            <div style={{ color: '#777', marginTop: '4px' }}>
                              Up to {money(coupon.maximum_discount)}
                            </div>
                          )}
                      </td>

                      <td style={{
                        padding: '15px 12px',
                        borderBottom: '1px solid #eee',
                        whiteSpace: 'nowrap',
                      }}>
                        {money(coupon.minimum_order_amount)}
                      </td>

                      <td style={{
                        padding: '15px 12px',
                        borderBottom: '1px solid #eee',
                        whiteSpace: 'nowrap',
                      }}>
                        {Number(coupon.used_count || 0)} /{' '}
                        {coupon.usage_limit == null ? '∞' : coupon.usage_limit}
                      </td>

                      <td style={{
                        padding: '15px 12px',
                        borderBottom: '1px solid #eee',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatDate(coupon.expires_at)}
                      </td>

                      <td style={{
                        padding: '15px 12px',
                        borderBottom: '1px solid #eee',
                      }}>
                        <span style={{
                          ...colors,
                          display: 'inline-block',
                          borderRadius: '20px',
                          padding: '6px 10px',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}>
                          {status}
                        </span>
                      </td>

                      <td style={{
                        padding: '15px 12px',
                        borderBottom: '1px solid #eee',
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '7px',
                          flexWrap: 'wrap',
                        }}>
                          <button
                            type="button"
                            disabled={busyId === coupon.id}
                            onClick={() => startEdit(coupon)}
                            style={{
                              ...buttonStyle,
                              background: '#e3f2fd',
                              color: '#1257a6',
                            }}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={busyId === coupon.id}
                            onClick={() => handleToggle(coupon)}
                            style={{
                              ...buttonStyle,
                              background: coupon.is_active ? '#fff3e0' : '#e8f5e9',
                              color: coupon.is_active ? '#a34d00' : '#24723b',
                            }}
                          >
                            {busyId === coupon.id
                              ? 'Working...'
                              : coupon.is_active
                                ? 'Deactivate'
                                : 'Activate'}
                          </button>

                          <button
                            type="button"
                            disabled={busyId === coupon.id}
                            onClick={() => handleDelete(coupon)}
                            style={{
                              ...buttonStyle,
                              background: '#ffebee',
                              color: '#b71c1c',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p style={{
          color: '#777',
          fontSize: '12px',
          margin: '15px 0 0',
        }}>
          Showing {filteredCoupons.length} of {coupons.length} coupons.
          Coupons already used by orders cannot be deleted; deactivate them instead.
        </p>
      </section>
    </main>
  );
}
