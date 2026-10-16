'use client';

export default function LocationSection() {
  return (
    <section
      className="py-5"
      style={{
        backgroundColor: '#ffffff',
      }}
    >
      <div className="container py-5">

        {/* HEADING */}
        <div className="text-center mb-5">
          <p
            className="fw-bold text-uppercase mb-2"
            style={{
              color: '#f04a23',
              letterSpacing: '2px',
            }}
          >
            Find Us
          </p>

          <h2 className="display-5 fw-bold">
            Visit Food Express
          </h2>

          <p
            className="text-secondary mx-auto"
            style={{
              maxWidth: '650px',
              lineHeight: '1.8',
            }}
          >
            Come visit us and enjoy your favourite food with friends
            and family.
          </p>
        </div>

        <div className="row g-4 align-items-stretch">

          {/* MAP */}
          <div className="col-lg-7">
            <div
              className="rounded-4 overflow-hidden shadow-sm"
              style={{
                height: '430px',
                backgroundColor: '#f5f5f5',
              }}
            >
              <iframe
                title="Food Express Location"
                src="https://www.google.com/maps?q=Bengaluru%2C%20Karnataka&output=embed"
                width="100%"
                height="100%"
                style={{
                  border: 0,
                }}
                loading="lazy"
                allowFullScreen
              />
            </div>
          </div>

          {/* CONTACT DETAILS */}
          <div className="col-lg-5">
            <div
              className="h-100 p-4 p-lg-5 rounded-4"
              style={{
                backgroundColor: '#fff8f2',
              }}
            >

              <h3 className="fw-bold mb-4">
                Get in touch
              </h3>

              {/* ADDRESS */}
              <div className="d-flex mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#f04a23',
                    color: '#ffffff',
                    fontSize: '22px',
                  }}
                >
                  📍
                </div>

                <div>
                  <h6 className="fw-bold mb-1">
                    Our Location
                  </h6>

                  <p className="text-secondary mb-0">
                    Bengaluru, Karnataka, India
                  </p>
                </div>
              </div>

              {/* PHONE */}
              <div className="d-flex mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#f04a23',
                    color: '#ffffff',
                    fontSize: '22px',
                  }}
                >
                  📞
                </div>

                <div>
                  <h6 className="fw-bold mb-1">
                    Phone
                  </h6>

                  <p className="text-secondary mb-0">
                    +91 98765 43210
                  </p>
                </div>
              </div>

              {/* EMAIL */}
              <div className="d-flex mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#f04a23',
                    color: '#ffffff',
                    fontSize: '22px',
                  }}
                >
                  ✉️
                </div>

                <div>
                  <h6 className="fw-bold mb-1">
                    Email
                  </h6>

                  <p className="text-secondary mb-0">
                    hello@foodexpress.com
                  </p>
                </div>
              </div>

              {/* OPENING HOURS */}
              <div className="d-flex mb-4">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 me-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#f04a23',
                    color: '#ffffff',
                    fontSize: '22px',
                  }}
                >
                  🕐
                </div>

                <div>
                  <h6 className="fw-bold mb-1">
                    Opening Hours
                  </h6>

                  <p className="text-secondary mb-0">
                    Monday - Sunday
                    <br />
                    10:00 AM - 11:00 PM
                  </p>
                </div>
              </div>

              <button
                className="btn text-white fw-bold px-5 py-3 mt-2"
                style={{
                  backgroundColor: '#f04a23',
                  borderRadius: '4px',
                }}
              >
                GET DIRECTIONS
              </button>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}