'use client';

import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { MyContext } from '../../context/ThemeContext';

import {
  MdOutlineShoppingBag,
  MdMenu,
  MdClose,
  MdPersonOutline,
  MdLogout,
  MdListAlt,
  MdKeyboardArrowDown,
  MdAdminPanelSettings,
  MdFavoriteBorder,
  MdNotificationsNone,
  MdDone,
  MdRefresh,
} from 'react-icons/md';

const API_URL = 'http://localhost:8000/api';

export default function Header() {
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [isRefreshingNotifications, setIsRefreshingNotifications] =
    useState(false);

  const notificationRef = useRef(null);

  const context = useContext(MyContext);
  const router = useRouter();

  const isLoggedIn = context?.isLoggedIn || false;
  const userDetails = context?.userDetails || null;
  const isAdmin = userDetails?.role === 'Admin';

  // Update cart count
  const updateCartCount = useCallback(() => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem('foodCart') || '[]'
      );

      setCartCount(
        savedCart.reduce(
          (total, item) => total + Number(item.quantity || 0),
          0
        )
      );
    } catch (error) {
      console.error('Error reading cart:', error);
      setCartCount(0);
    }
  }, []);

  // Update wishlist count
  const updateWishlistCount = useCallback(async () => {
    if (!isLoggedIn) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/wishlist`, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(
          'Failed to load wishlist count:',
          response.status
        );
        return;
      }

      const result = await response.json();

      if (Array.isArray(result.data)) {
        setWishlistCount(result.data.length);
      }
    } catch (error) {
      console.error('Error reading wishlist:', error);
    }
  }, [isLoggedIn]);

  // Fetch notifications
  const updateNotifications = useCallback(async () => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationError('');
      return;
    }

    setIsRefreshingNotifications(true);

    try {
      const endpoint = isAdmin
        ? `${API_URL}/admin/notifications`
        : `${API_URL}/order/notifications`;

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Failed to load notifications.'
        );
      }

      const items = Array.isArray(result.data) ? result.data : [];

      setNotifications(items);
      setUnreadCount(
        items.filter((item) => !item.is_read).length
      );
      setNotificationError('');
    } catch (error) {
      console.error('Notification loading error:', error);
      setNotificationError(
        error.message || 'Unable to load notifications.'
      );
    } finally {
      setIsRefreshingNotifications(false);
    }
  }, [isLoggedIn, isAdmin]);

  // Mark a notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const endpoint = isAdmin
        ? `${API_URL}/admin/notifications/${notificationId}/read`
        : `${API_URL}/order/notifications/${notificationId}/read`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || 'Failed to mark notification as read.'
        );
      }

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true }
            : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
      setNotificationError('');
    } catch (error) {
      console.error('Mark notification as read error:', error);
      setNotificationError(
        error.message || 'Unable to update notification.'
      );
    }
  };

  // Load notifications initially and refresh every 10 seconds
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setUnreadCount(0);
      setIsNotificationsOpen(false);
      return;
    }

    updateNotifications();

    const interval = setInterval(() => {
      updateNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [isLoggedIn, updateNotifications]);

  // Close notification dropdown when clicking outside it
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Load cart and wishlist counts and listen for changes
  useEffect(() => {
    updateCartCount();
    updateWishlistCount();

    const handleStorageChange = (event) => {
      if (event.key === 'foodCart') {
        updateCartCount();
      }
    };

    const handleCartUpdated = () => {
      updateCartCount();
    };

    const handleWishlistUpdated = () => {
      updateWishlistCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdated);
    window.addEventListener('wishlistUpdated', handleWishlistUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdated);
      window.removeEventListener(
        'wishlistUpdated',
        handleWishlistUpdated
      );
    };
  }, [updateCartCount, updateWishlistCount]);

  // Refresh wishlist when login state changes
  useEffect(() => {
    updateWishlistCount();
  }, [updateWishlistCount]);

  // Sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/user/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Logout failed.');
      }
    } catch (error) {
      console.error('Logout request error:', error);
    } finally {
      context?.setIsLoggedIn(false);
      context?.setUserDetails(null);

      setWishlistCount(0);
      setNotifications([]);
      setUnreadCount(0);
      setIsNotificationsOpen(false);
      setIsProfileOpen(false);
      setIsMobileMenuOpen(false);

      router.push('/');
    }
  };

  const linkStyle = {
    color: isSticky ? '#222' : '#fff',
    textDecoration: 'none',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  };

  const mobileLinkStyle = {
    color: '#222',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        background: isSticky ? '#fff' : 'rgba(0, 0, 0, 0.25)',
        boxShadow: isSticky
          ? '0 2px 10px rgba(0,0,0,0.15)'
          : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        className="container"
        style={{
          minHeight: '75px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
        }}
      >
        <Link
          href="/"
          style={{
            ...linkStyle,
            fontSize: '26px',
            fontWeight: '700',
          }}
        >
          Food Express
        </Link>

        <nav
          className="d-none d-md-flex"
          style={{ alignItems: 'center', gap: '25px' }}
        >
          <Link href="/" style={linkStyle}>
            Home
          </Link>
          <Link href="/menu" style={linkStyle}>
            Menu
          </Link>
          <Link href="/categories" style={linkStyle}>
            Categories
          </Link>
          <Link href="/about" style={linkStyle}>
            About Us
          </Link>
        </nav>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          {/* Notifications */}
          {isLoggedIn && (
            <div
              ref={notificationRef}
              style={{ position: 'relative' }}
            >
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
                title="Notifications"
                onClick={() => {
                  const nextState = !isNotificationsOpen;

                  setIsNotificationsOpen(nextState);
                  setIsProfileOpen(false);

                  if (nextState) {
                    updateNotifications();
                  }
                }}
                style={{
                  position: 'relative',
                  border: 'none',
                  background: 'transparent',
                  color: isSticky ? '#222' : '#fff',
                  fontSize: '27px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <MdNotificationsNone />

                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-7px',
                      right: '-9px',
                      minWidth: '19px',
                      height: '19px',
                      padding: '0 4px',
                      borderRadius: '12px',
                      background: '#ff5722',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: '-60px',
                    top: '42px',
                    width: '340px',
                    maxWidth: '85vw',
                    maxHeight: '420px',
                    overflowY: 'auto',
                    background: '#fff',
                    color: '#222',
                    borderRadius: '10px',
                    boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
                    border: '1px solid #e5e5e5',
                    zIndex: 2000,
                  }}
                >
                  <div
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      padding: '14px 16px',
                      borderBottom: '1px solid #eee',
                      background: '#fff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <strong>Notifications</strong>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        updateNotifications();
                      }}
                      disabled={isRefreshingNotifications}
                      title="Refresh notifications"
                      aria-label="Refresh notifications"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: isRefreshingNotifications
                          ? 'wait'
                          : 'pointer',
                        fontSize: '20px',
                        color: '#555',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '3px',
                      }}
                    >
                      <MdRefresh
                        style={{
                          animation: isRefreshingNotifications
                            ? 'foodExpressSpin 1s linear infinite'
                            : 'none',
                        }}
                      />
                    </button>
                  </div>

                  {notificationError && (
                    <div
                      style={{
                        padding: '12px 16px',
                        color: '#c62828',
                        fontSize: '13px',
                      }}
                    >
                      <p style={{ margin: '0 0 8px' }}>
                        {notificationError}
                      </p>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          updateNotifications();
                        }}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#e64a19',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {!notificationError &&
                    notifications.length === 0 && (
                      <p
                        style={{
                          padding: '25px 15px',
                          textAlign: 'center',
                          color: '#777',
                          margin: 0,
                        }}
                      >
                        No notifications yet.
                      </p>
                    )}

                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      style={{
                        padding: '14px 16px',
                        borderBottom: '1px solid #eee',
                        background: notification.is_read
                          ? '#fff'
                          : '#fff7f2',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '8px',
                          alignItems: 'flex-start',
                        }}
                      >
                        <strong style={{ fontSize: '14px' }}>
                          {notification.title}
                        </strong>

                        {!notification.is_read && (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              minWidth: '8px',
                              marginTop: '5px',
                              borderRadius: '50%',
                              background: '#ff5722',
                            }}
                          />
                        )}
                      </div>

                      <p
                        style={{
                          margin: '7px 0',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          color: '#555',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {notification.message}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <small style={{ color: '#888' }}>
                          {notification.created_at
                            ? new Date(
                                notification.created_at
                              ).toLocaleString()
                            : ''}
                        </small>

                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() =>
                              markNotificationAsRead(notification.id)
                            }
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#e64a19',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <MdDone
                              style={{
                                verticalAlign: 'middle',
                                marginRight: '3px',
                              }}
                            />
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wishlist */}
          <Link
            href="/wishlist"
            aria-label="My Wishlist"
            title="My Wishlist"
            style={{
              ...linkStyle,
              position: 'relative',
              fontSize: '26px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <MdFavoriteBorder />

            {isLoggedIn && wishlistCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-7px',
                  right: '-9px',
                  minWidth: '19px',
                  height: '19px',
                  padding: '0 4px',
                  borderRadius: '50%',
                  background: '#ff5722',
                  color: '#fff',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                }}
              >
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Shopping cart"
            style={{
              ...linkStyle,
              position: 'relative',
              fontSize: '26px',
              display: 'flex',
            }}
          >
            <MdOutlineShoppingBag />

            <span
              style={{
                position: 'absolute',
                top: '-7px',
                right: '-9px',
                minWidth: '19px',
                height: '19px',
                padding: '0 4px',
                borderRadius: '50%',
                background: '#ff5722',
                color: '#fff',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              {cartCount}
            </span>
          </Link>

          {/* Profile / Authentication */}
          {!isLoggedIn ? (
            <div
              className="d-none d-md-flex"
              style={{ alignItems: 'center', gap: '15px' }}
            >
              <Link href="/login" style={linkStyle}>
                <MdPersonOutline size={21} /> Sign In
              </Link>

              <Link href="/signup" style={linkStyle}>
                <MdPersonOutline size={21} /> Sign Up
              </Link>
            </div>
          ) : (
            <div
              className="d-none d-md-block"
              style={{ position: 'relative' }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: isSticky ? '#222' : '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                <MdPersonOutline size={22} />
                <span>{userDetails?.name || 'My Account'}</span>
                <MdKeyboardArrowDown />
              </button>

              {isProfileOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '42px',
                    width: '200px',
                    background: '#fff',
                    color: '#222',
                    borderRadius: '8px',
                    boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                    overflow: 'hidden',
                    border: '1px solid #ddd',
                  }}
                >
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsProfileOpen(false)}
                      style={dropdownLinkStyle}
                    >
                      <MdAdminPanelSettings /> Admin Panel
                    </Link>
                  )}

                  <Link
                    href="/profile"
                    onClick={() => setIsProfileOpen(false)}
                    style={dropdownLinkStyle}
                  >
                    <MdPersonOutline /> Profile
                  </Link>

                  <Link
                    href="/orders"
                    onClick={() => setIsProfileOpen(false)}
                    style={dropdownLinkStyle}
                  >
                    <MdListAlt /> My Orders
                  </Link>

                  <Link
                    href="/wishlist"
                    onClick={() => setIsProfileOpen(false)}
                    style={dropdownLinkStyle}
                  >
                    <MdFavoriteBorder /> My Wishlist ({wishlistCount})
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      ...dropdownLinkStyle,
                      width: '100%',
                      border: 'none',
                      background: '#fff',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <MdLogout /> Logout
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            type="button"
            className="d-md-none"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsNotificationsOpen(false);
            }}
            aria-label="Toggle navigation menu"
            style={{
              border: 'none',
              background: 'transparent',
              color: isSticky ? '#222' : '#fff',
              fontSize: '28px',
              padding: 0,
              cursor: 'pointer',
            }}
          >
            {isMobileMenuOpen ? <MdClose /> : <MdMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="d-md-none"
          style={{
            background: '#fff',
            color: '#222',
            padding: '20px',
            boxShadow: '0 5px 15px rgba(0,0,0,0.15)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px',
            }}
          >
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              style={mobileLinkStyle}
            >
              Home
            </Link>

            <Link
              href="/menu"
              onClick={() => setIsMobileMenuOpen(false)}
              style={mobileLinkStyle}
            >
              Menu
            </Link>

            <Link
              href="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              style={mobileLinkStyle}
            >
              Categories
            </Link>

            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              style={mobileLinkStyle}
            >
              About Us
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              style={mobileLinkStyle}
            >
              <MdFavoriteBorder size={20} />
              My Wishlist ({wishlistCount})
            </Link>

            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={mobileLinkStyle}
                >
                  Sign In
                </Link>

                <Link
                  href="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={mobileLinkStyle}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={mobileLinkStyle}
                  >
                    Admin Panel
                  </Link>
                )}

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={mobileLinkStyle}
                >
                  Profile
                </Link>

                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={mobileLinkStyle}
                >
                  My Orders
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#222',
                    textAlign: 'left',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <MdLogout /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes foodExpressSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </header>
  );
}

const dropdownLinkStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '13px 15px',
  color: '#222',
  textDecoration: 'none',
};