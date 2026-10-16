'use client';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#1f1f1f',
        color: '#ffffff',
      }}
    >
      {/* MAIN FOOTER */}
      <div className="container py-5">
        <div className="row g-5">

          {/* BRAND */}
          <div className="col-lg-4">
            <h2
              className="fw-bold mb-3"
              style={{
                color: '#f04a23',
                fontSize: '32px',
              }}
            >
              Food Express
            </h2>

            <p
              className="text-light"
              style={{
                lineHeight: '1.8',
                maxWidth: '400px',
              }}
            >
              Delicious food, fresh ingredients and fast delivery.
              We bring your favourite meals straight to your doorstep.
            </p>

            {/* SOCIAL ICONS */}
            <div className="d-flex gap-2 mt-4">
              <a
                href="#"
                className="rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: '#f04a23',
                  color: '#ffffff',
                }}
              >
                f
              </a>

              <a
                href="#"
                className="rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: '#f04a23',
                  color: '#ffffff',
                }}
              >
                ◎
              </a>

              <a
                href="#"
                className="rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: '#f04a23',
                  color: '#ffffff',
                }}
              >
                ▶
              </a>

              <a
                href="#"
                className="rounded-circle d-flex align-items-center justify-content-center text-decoration-none"
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: '#f04a23',
                  color: '#ffffff',
                }}
              >
                X
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="col-6 col-lg-2">
            <h5 className="fw-bold mb-4">
              Quick Links
            </h5>

            <ul className="list-unstyled">
              <li className="mb-3">
                <a
                  href="/"
                  className="text-light text-decoration-none"
                >
                  Home
                </a>
              </li>

              <li className="mb-3">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                >
                  About
                </a>
              </li>

              <li className="mb-3">
                <a
                  href="#"
                  className="text-light text-decoration-none"
                >
                  Our Menu
                </a>
              </li>

              <li className="mb-3">
                <a
                  href="/cart"
                  className="text-light text-decoration-none"
                >
                  Cart
                </a>
              </li>

              <li>
                <a
                  href="/orders"
                  className="text-light text-decoration-none"
                >
                  My Orders
                </a>
              </li>
            </ul>
          </div>

          {/* SERVICES */}
          <div className="col-6 col-lg-2">
            <h5 className="fw-bold mb-4">
              Services
            </h5>

            <ul className="list-unstyled">
              <li className="mb-3">
                <span className="text-light">
                  Food Delivery
                </span>
              </li>

              <li className="mb-3">
                <span className="text-light">
                  Catering
                </span>
              </li>

              <li className="mb-3">
                <span className="text-light">
                  Events
                </span>
              </li>

              <li className="mb-3">
                <span className="text-light">
                  Online Ordering
                </span>
              </li>

              <li>
                <span className="text-light">
                  Takeaway
                </span>
              </li>
            </ul>
          </div>

          {/* CONTACT */}
          <div className="col-lg-4">
            <h5 className="fw-bold mb-4">
              Contact Us
            </h5>

            <div className="mb-3">
              <span className="me-2">📍</span>
              <span className="text-light">
                Bengaluru, Karnataka, India
              </span>
            </div>

            <div className="mb-3">
              <span className="me-2">📞</span>
              <span className="text-light">
                +91 98765 43210
              </span>
            </div>

            <div className="mb-3">
              <span className="me-2">✉️</span>
              <span className="text-light">
                hello@foodexpress.com
              </span>
            </div>

            <div>
              <span className="me-2">🕐</span>
              <span className="text-light">
                10:00 AM - 11:00 PM
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* COPYRIGHT */}
      <div
        style={{
          borderTop: '1px solid #444444',
        }}
      >
        <div className="container py-4">
          <div className="row align-items-center">

            <div className="col-md-6">
              <p className="text-secondary mb-0">
                © 2026 Food Express. All rights reserved.
              </p>
            </div>

            <div className="col-md-6 text-md-end mt-2 mt-md-0">
              <span className="text-secondary me-3">
                Privacy Policy
              </span>

              <span className="text-secondary">
                Terms & Conditions
              </span>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}