'use client';

const blogPosts = [
  {
    image: '/gallery1.jpg',
    category: 'FOOD',
    date: 'September 20, 2026',
    title: 'How to enjoy the perfect burger at home',
    description:
      'Discover simple tips to make your burger experience even more delicious.',
  },
  {
    image: '/gallery2.jpg',
    category: 'PIZZA',
    date: 'September 18, 2026',
    title: 'What makes a great pizza?',
    description:
      'From crispy crusts to delicious toppings, explore what makes pizza special.',
  },
  {
    image: '/gallery6.jpg',
    category: 'TIPS',
    date: 'September 15, 2026',
    title: 'The perfect sides for your meal',
    description:
      'Complete your favourite meal with delicious sides and refreshing combinations.',
  },
];

export default function BlogSection() {
  return (
    <section
      className="py-5"
      style={{
        backgroundColor: '#fff8f2',
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
            Our Blog
          </p>

          <h2 className="display-5 fw-bold">
            Latest food stories
          </h2>

          <p
            className="text-secondary mx-auto"
            style={{
              maxWidth: '650px',
              lineHeight: '1.8',
            }}
          >
            Explore food tips, ideas and stories from the Food Express
            kitchen.
          </p>
        </div>

        {/* BLOG CARDS */}
        <div className="row g-4">

          {blogPosts.map((post, index) => (
            <div className="col-lg-4" key={index}>

              <article
                className="bg-white rounded-4 overflow-hidden h-100 shadow-sm"
              >

                {/* IMAGE */}
                <div
                  style={{
                    height: '240px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-100 h-100"
                    style={{
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4">

                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span
                      className="fw-bold"
                      style={{
                        color: '#f04a23',
                        fontSize: '13px',
                        letterSpacing: '1px',
                      }}
                    >
                      {post.category}
                    </span>

                    <span className="text-secondary">
                      •
                    </span>

                    <small className="text-secondary">
                      {post.date}
                    </small>
                  </div>

                  <h4 className="fw-bold mb-3">
                    {post.title}
                  </h4>

                  <p
                    className="text-secondary mb-4"
                    style={{
                      lineHeight: '1.7',
                    }}
                  >
                    {post.description}
                  </p>

                  <button
                    className="btn p-0 fw-bold"
                    style={{
                      color: '#f04a23',
                    }}
                  >
                    READ MORE →
                  </button>

                </div>

              </article>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}