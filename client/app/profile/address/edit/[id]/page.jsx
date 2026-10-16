'use client';

import {
  useEffect,
  useState,
} from 'react';

import { useParams, useRouter } from 'next/navigation';

import Link from 'next/link';

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams();

  const addressId = params?.id;

  const [formData, setFormData] = useState({
    address_line1: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    mobile: '',
    landmark: '',
    address_type: 'Home',
    is_default: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  // Fetch existing address
  useEffect(() => {
    if (!addressId) {
      return;
    }

    const fetchAddress = async () => {
      try {
        setLoading(true);
        setMessage('');
        setError(false);

        const response = await fetch(
          'http://localhost:8000/api/address/my-addresses',
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(true);
          setMessage(
            data.message ||
              'Failed to load address.'
          );
          return;
        }

        const address = (
          data.data || []
        ).find(
          (item) => item.id === addressId
        );

        if (!address) {
          setError(true);
          setMessage(
            'Address not found.'
          );
          return;
        }

        setFormData({
          address_line1:
            address.address_line1 || '',
          city: address.city || '',
          state: address.state || '',
          pincode: address.pincode || '',
          country:
            address.country || 'India',
          mobile: address.mobile || '',
          landmark:
            address.landmark || '',
          address_type:
            address.address_type || 'Home',
          is_default:
            address.is_default === true,
        });
      } catch (error) {
        console.error(
          'Fetch address error:',
          error
        );

        setError(true);
        setMessage(
          'Unable to connect to the server.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAddress();
  }, [addressId]);

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage('');
    setError(false);
    setSaving(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/address/update-address/${addressId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(
          data.message ||
            'Failed to update address.'
        );
        return;
      }

      setError(false);
      setMessage(
        data.message ||
          'Address updated successfully.'
      );

      setTimeout(() => {
        router.push('/profile');
      }, 800);
    } catch (error) {
      console.error(
        'Update address error:',
        error
      );

      setError(true);
      setMessage(
        'Unable to connect to the server.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          textAlign: 'center',
          background: '#f7f7f7',
        }}
      >
        <h2>
          Loading address...
        </h2>
      </main>
    );
  }

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
          maxWidth: '700px',
          margin: '0 auto',
          padding: '30px 20px',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '30px',
          }}
        >
          <h1
            style={{
              marginBottom: '10px',
            }}
          >
            Edit Address
          </h1>

          <p
            style={{
              color: '#666',
              marginBottom: '30px',
            }}
          >
            Update your delivery address.
          </p>

          {message && (
            <div
              style={{
                padding: '12px',
                marginBottom: '20px',
                borderRadius: '7px',
                background: error
                  ? '#ffebee'
                  : '#e8f5e9',
                color: error
                  ? '#d32f2f'
                  : '#2e7d32',
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Address Type */}
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                Address Type
              </label>

              <select
                name="address_type"
                value={
                  formData.address_type
                }
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '15px',
                  background: '#fff',
                }}
              >
                <option value="Home">
                  Home
                </option>

                <option value="Work">
                  Work
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* Address */}
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                Address
              </label>

              <textarea
                name="address_line1"
                value={
                  formData.address_line1
                }
                onChange={handleChange}
                placeholder="House/Flat No, Street, Area"
                rows="3"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '15px',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* City + State */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '15px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontWeight: 'bold',
                  }}
                >
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontWeight: 'bold',
                  }}
                >
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '15px',
                  }}
                />
              </div>
            </div>

            {/* Pincode + Country */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  '1fr 1fr',
                gap: '15px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontWeight: 'bold',
                  }}
                >
                  Pincode
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Pincode"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontWeight: 'bold',
                  }}
                >
                  Country
                </label>

                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Country"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    fontSize: '15px',
                  }}
                />
              </div>
            </div>

            {/* Mobile */}
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                Mobile Number
              </label>

              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '15px',
                }}
              />
            </div>

            {/* Landmark */}
            <div
              style={{
                marginBottom: '20px',
              }}
            >
              <label
                style={{
                  display: 'block',
                  marginBottom: '7px',
                  fontWeight: 'bold',
                }}
              >
                Landmark
              </label>

              <input
                type="text"
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                placeholder="Nearby landmark (optional)"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  fontSize: '15px',
                }}
              />
            </div>

            {/* Default Address */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '25px',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                name="is_default"
                checked={
                  formData.is_default
                }
                onChange={handleChange}
                style={{
                  width: '18px',
                  height: '18px',
                }}
              />

              <span>
                Set as default address
              </span>
            </label>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 22px',
                  border: 'none',
                  borderRadius: '7px',
                  background: '#ff5722',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: saving
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving
                  ? 'Updating...'
                  : 'Update Address'}
              </button>

              <Link
                href="/profile"
                style={{
                  padding: '12px 22px',
                  border: '1px solid #ddd',
                  borderRadius: '7px',
                  color: '#333',
                  textDecoration: 'none',
                  background: '#fff',
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}