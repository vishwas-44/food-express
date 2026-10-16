'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AddAddressPage() {
  const router = useRouter();

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

  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

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
    setLoading(true);

    try {
      const response = await fetch(
        'http://localhost:8000/api/address/add-address',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
            'Failed to add address.'
        );
        return;
      }

      setError(false);
      setMessage(
        data.message ||
          'Address added successfully.'
      );

      setTimeout(() => {
        router.push('/profile');
      }, 800);
    } catch (error) {
      console.error(
        'Add address error:',
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
            Add Address
          </h1>

          <p
            style={{
              color: '#666',
              marginBottom: '30px',
            }}
          >
            Add a delivery address to your
            account.
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
                value={formData.address_type}
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
                value={formData.address_line1}
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
                checked={formData.is_default}
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
                disabled={loading}
                style={{
                  padding: '12px 22px',
                  border: 'none',
                  borderRadius: '7px',
                  background: '#ff5722',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: loading
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading
                  ? 'Saving...'
                  : 'Save Address'}
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