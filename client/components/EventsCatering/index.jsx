'use client';

export default function EventsCatering() {
  return (
    <section
      className="py-5"
      style={{
        backgroundColor: '#fff8f2',
      }}
    >
      <div className="container py-5">
        <div className="row align-items-center g-5">

          {/* IMAGE */}
          <div className="col-lg-6">
            <div
              className="overflow-hidden rounded-4 shadow"
              style={{
                height: '450px',
              }}
            >
              <img
                src="/gallery8.jpg"
                alt="Food catering and events"
                className="w-100 h-100"
                style={{
                  objectFit: 'cover',
                }}
              />
            </div>
          </div>

          {/* CONTENT */}
          <div className="col-lg-6">
            <p
              className="fw-bold text-uppercase mb-2"
              style={{
                color: '#f04a23',
                letterSpacing: '2px',
              }}
            >
              Events & Catering
            </p>

            <h2
              className="display-5 fw-bold mb-4"
              style={{
                color: '#242424',
              }}
            >
              Make your special moments delicious
            </h2>

            <p
              className="text-secondary fs-5 mb-4"
              style={{
                lineHeight: '1.8',
              }}
            >
              Planning a birthday party, family gathering, office event
              or special celebration? Let Food Express take care of the
              food while you enjoy the moment.
            </p>

            {/* EVENT TYPES */}
            <div className="row g-3 mb-4">

              <div className="col-sm-6">
                <div
                  className="p-3 bg-white rounded-3 shadow-sm h-100"
                >
                  <div
                    style={{
                      fontSize: '32px',
                    }}
                  >
                    🎂
                  </div>

                  <h5 className="fw-bold mt-2 mb-1">
                    Birthday Parties
                  </h5>

                  <p className="text-secondary mb-0">
                    Delicious food for memorable celebrations.
                  </p>
                </div>
              </div>

              <div className="col-sm-6">
                <div
                  className="p-3 bg-white rounded-3 shadow-sm h-100"
                >
                  <div
                    style={{
                      fontSize: '32px',
                    }}
                  >
                    🏢
                  </div>

                  <h5 className="fw-bold mt-2 mb-1">
                    Corporate Events
                  </h5>

                  <p className="text-secondary mb-0">
                    Food solutions for meetings and office events.
                  </p>
                </div>
              </div>

              <div className="col-sm-6">
                <div
                  className="p-3 bg-white rounded-3 shadow-sm h-100"
                >
                  <div
                    style={{
                      fontSize: '32px',
                    }}
                  >
                    🎉
                  </div>

                  <h5 className="fw-bold mt-2 mb-1">
                    Private Events
                  </h5>

                  <p className="text-secondary mb-0">
                    Catering for your special gatherings.
                  </p>
                </div>
              </div>

              <div className="col-sm-6">
                <div
                  className="p-3 bg-white rounded-3 shadow-sm h-100"
                >
                  <div
                    style={{
                      fontSize: '32px',
                    }}
                  >
                    🍔
                  </div>

                  <h5 className="fw-bold mt-2 mb-1">
                    Food Catering
                  </h5>

                  <p className="text-secondary mb-0">
                    Fresh and tasty food for every occasion.
                  </p>
                </div>
              </div>

            </div>

            <button
              className="btn text-white fw-bold px-5 py-3"
              style={{
                backgroundColor: '#f04a23',
                borderRadius: '4px',
              }}
            >
              CONTACT US
            </button>
          </div>

        </div>
      </div>
    </section>
  );
}