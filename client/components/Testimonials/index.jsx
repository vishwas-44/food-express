'use client';

const testimonials = [
  {
    name: 'Rahul Kumar',
    role: 'Happy Customer',
    review:
      'The food was absolutely delicious and arrived fresh and hot. The burger was amazing!',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Regular Customer',
    review:
      'Great taste, quick delivery and very good portion sizes. Food Express has become my favourite.',
    rating: 5,
  },
  {
    name: 'Arjun Reddy',
    role: 'Happy Customer',
    review:
      'I ordered pizza and fries for my friends. Everything was tasty and perfectly packed.',
    rating: 5,
  },
];

export default function Testimonials() {
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
            Testimonials
          </p>

          <h2 className="display-5 fw-bold">
            What our customers say
          </h2>

          <p
            className="text-secondary mx-auto"
            style={{
              maxWidth: '650px',
              lineHeight: '1.8',
            }}
          >
            We love hearing from our customers. Here are some of
            their favourite Food Express experiences.
          </p>
        </div>

        {/* TESTIMONIAL CARDS */}
        <div className="row g-4">

          {testimonials.map((testimonial, index) => (
            <div className="col-lg-4" key={index}>
              <div
                className="h-100 p-4 rounded-4 shadow-sm"
                style={{
                  backgroundColor: '#fff8f2',
                  border: '1px solid #f5e5d8',
                }}
              >

                {/* STARS */}
                <div
                  className="mb-3"
                  style={{
                    color: '#ffb000',
                    fontSize: '22px',
                    letterSpacing: '3px',
                  }}
                >
                  {'★'.repeat(testimonial.rating)}
                </div>

                {/* REVIEW */}
                <p
                  className="text-secondary mb-4"
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                  }}
                >
                  “{testimonial.review}”
                </p>

                {/* CUSTOMER */}
                <div className="d-flex align-items-center">

                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: '55px',
                      height: '55px',
                      backgroundColor: '#f04a23',
                      color: '#ffffff',
                      fontSize: '22px',
                      fontWeight: '700',
                    }}
                  >
                    {testimonial.name.charAt(0)}
                  </div>

                  <div>
                    <h6 className="fw-bold mb-1">
                      {testimonial.name}
                    </h6>

                    <small className="text-secondary">
                      {testimonial.role}
                    </small>
                  </div>

                </div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}