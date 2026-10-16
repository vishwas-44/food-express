'use client';

import {
  useContext,
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';

import { MyContext } from '../../context/ThemeContext';

export default function ProfilePage() {
  const context = useContext(MyContext);

  const user = context?.userDetails;

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] =
    useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [defaultId, setDefaultId] =
    useState(null);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);

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
            'Failed to load addresses.'
        );

        return;
      }

      setAddresses(data.data || []);
    } catch (error) {
      console.error(
        'Fetch addresses error:',
        error
      );

      setError(true);
      setMessage(
        'Unable to connect to the server.'
      );
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (context?.isLoggedIn) {
      fetchAddresses();
    }
  }, [context?.isLoggedIn]);

  // Delete address
  const handleDeleteAddress = async (
    addressId
  ) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this address?'
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setDeletingId(addressId);
      setMessage('');
      setError(false);

      const response = await fetch(
        `http://localhost:8000/api/address/delete-address/${addressId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(
          data.message ||
            'Failed to delete address.'
        );

        return;
      }

      setError(false);
      setMessage(
        data.message ||
          'Address deleted successfully.'
      );

      await fetchAddresses();
    } catch (error) {
      console.error(
        'Delete address error:',
        error
      );

      setError(true);
      setMessage(
        'Unable to connect to the server.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Set default address
  const handleSetDefault = async (
    addressId
  ) => {
    try {
      setDefaultId(addressId);
      setMessage('');
      setError(false);

      const response = await fetch(
        `http://localhost:8000/api/address/set-default/${addressId}`,
        {
          method: 'PUT',
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(true);
        setMessage(
          data.message ||
            'Failed to set default address.'
        );

        return;
      }

      setError(false);
      setMessage(
        data.message ||
          'Default address updated successfully.'
      );

      await fetchAddresses();
    } catch (error) {
      console.error(
        'Set default address error:',
        error
      );

      setError(true);
      setMessage(
        'Unable to connect to the server.'
      );
    } finally {
      setDefaultId(null);
    }
  };

  if (context?.authLoading) {
    return (
      <main
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          textAlign: 'center',
        }}
      >
        <h2>Loading...</h2>
      </main>
    );
  }

  if (!context?.isLoggedIn) {
    return (
      <main
        style={{
          minHeight: '100vh',
          paddingTop: '120px',
          paddingBottom: '60px',
          background: '#f7f7f7',
        }}
      >
        <div
          style={{
            maxWidth: '500px',
            margin: '0 auto',
            padding: '30px 20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '12px',
              padding: '35px',
              textAlign: 'center',
            }}
          >
            <h1>My Profile</h1>

            <p
              style={{
                color: '#666',
                margin: '20px 0',
              }}
            >
              Please login to view your profile.
            </p>

            <Link
              href="/login"
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
              Login
            </Link>
          </div>
        </div>
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
          maxWidth: '900px',
          margin: '0 auto',
          padding: '30px 20px',
        }}
      >
        <h1
          style={{
            marginBottom: '30px',
          }}
        >
          My Profile
        </h1>

        {/* Personal Information */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '25px',
          }}
        >
          <h2
            style={{
              marginBottom: '25px',
            }}
          >
            Personal Information
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '25px',
            }}
          >
            <div>
              <span
                style={{
                  display: 'block',
                  color: '#777',
                  fontSize: '14px',
                  marginBottom: '6px',
                }}
              >
                Name
              </span>

              <strong>
                {user?.name || 'Not available'}
              </strong>
            </div>

            <div>
              <span
                style={{
                  display: 'block',
                  color: '#777',
                  fontSize: '14px',
                  marginBottom: '6px',
                }}
              >
                Email
              </span>

              <strong>
                {user?.email || 'Not available'}
              </strong>
            </div>

            <div>
              <span
                style={{
                  display: 'block',
                  color: '#777',
                  fontSize: '14px',
                  marginBottom: '6px',
                }}
              >
                Mobile
              </span>

              <strong>
                {user?.mobile || 'Not available'}
              </strong>
            </div>

            <div>
              <span
                style={{
                  display: 'block',
                  color: '#777',
                  fontSize: '14px',
                  marginBottom: '6px',
                }}
              >
                Account Role
              </span>

              <strong>
                {user?.role || 'User'}
              </strong>
            </div>
          </div>
        </div>

        {/* Saved Addresses */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '25px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '15px',
              marginBottom: '25px',
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                margin: 0,
              }}
            >
              Saved Addresses
            </h2>

            <Link
              href="/profile/address/add"
              style={{
                padding: '10px 18px',
                background: '#ff5722',
                color: '#fff',
                borderRadius: '7px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              + Add Address
            </Link>
          </div>

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

          {loadingAddresses ? (
            <p
              style={{
                color: '#777',
              }}
            >
              Loading addresses...
            </p>
          ) : addresses.length === 0 ? (
            <div
              style={{
                padding: '25px',
                border: '1px dashed #ccc',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#777',
              }}
            >
              No saved addresses yet.
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
              }}
            >
              {addresses.map((address) => (
                <div
                  key={address.id}
                  style={{
                    border: address.is_default
                      ? '2px solid #ff5722'
                      : '1px solid #ddd',
                    borderRadius: '10px',
                    padding: '20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '12px',
                    }}
                  >
                    <strong>
                      {address.address_type ||
                        'Home'}
                    </strong>

                    {address.is_default && (
                      <span
                        style={{
                          background: '#ff5722',
                          color: '#fff',
                          padding: '5px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        Default
                      </span>
                    )}
                  </div>

                  <p
                    style={{
                      margin: '5px 0',
                    }}
                  >
                    {address.address_line1}
                  </p>

                  <p
                    style={{
                      margin: '5px 0',
                      color: '#555',
                    }}
                  >
                    {address.city},{' '}
                    {address.state} -{' '}
                    {address.pincode}
                  </p>

                  <p
                    style={{
                      margin: '5px 0',
                      color: '#555',
                    }}
                  >
                    {address.country}
                  </p>

                  <p
                    style={{
                      margin: '5px 0',
                      color: '#555',
                    }}
                  >
                    Mobile: {address.mobile}
                  </p>

                  {address.landmark && (
                    <p
                      style={{
                        margin: '5px 0',
                        color: '#555',
                      }}
                    >
                      Landmark:{' '}
                      {address.landmark}
                    </p>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      marginTop: '18px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Edit */}
                    <Link
                      href={`/profile/address/edit/${address.id}`}
                      style={{
                        padding: '8px 14px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        color: '#333',
                        fontSize: '14px',
                      }}
                    >
                      Edit
                    </Link>

                    {/* Set Default */}
                    {!address.is_default && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSetDefault(
                            address.id
                          )
                        }
                        disabled={
                          defaultId ===
                          address.id
                        }
                        style={{
                          padding: '8px 14px',
                          border:
                            '1px solid #ff5722',
                          background: '#fff',
                          color: '#ff5722',
                          borderRadius: '6px',
                          cursor:
                            defaultId ===
                            address.id
                              ? 'not-allowed'
                              : 'pointer',
                          fontSize: '14px',
                          opacity:
                            defaultId ===
                            address.id
                              ? 0.6
                              : 1,
                        }}
                      >
                        {defaultId ===
                        address.id
                          ? 'Updating...'
                          : 'Set Default'}
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAddress(
                          address.id
                        )
                      }
                      disabled={
                        deletingId === address.id
                      }
                      style={{
                        padding: '8px 14px',
                        border:
                          '1px solid #d32f2f',
                        background: '#fff',
                        color: '#d32f2f',
                        borderRadius: '6px',
                        cursor:
                          deletingId ===
                          address.id
                            ? 'not-allowed'
                            : 'pointer',
                        fontSize: '14px',
                        opacity:
                          deletingId ===
                          address.id
                            ? 0.6
                            : 1,
                      }}
                    >
                      {deletingId === address.id
                        ? 'Deleting...'
                        : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Security */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '30px',
            marginBottom: '25px',
          }}
        >
          <h2
            style={{
              marginBottom: '20px',
            }}
          >
            Account Security
          </h2>

          <Link
            href="/change-password"
            style={{
              display: 'inline-block',
              padding: '12px 20px',
              border: '1px solid #ff5722',
              color: '#ff5722',
              borderRadius: '7px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Change Password
          </Link>
        </div>

        {/* Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '15px',
            flexWrap: 'wrap',
          }}
        >
          <Link
            href="/orders"
            style={{
              padding: '12px 20px',
              background: '#ff5722',
              color: '#fff',
              borderRadius: '7px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            My Orders
          </Link>

          <Link
            href="/"
            style={{
              padding: '12px 20px',
              border: '1px solid #ddd',
              background: '#fff',
              color: '#333',
              borderRadius: '7px',
              textDecoration: 'none',
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}