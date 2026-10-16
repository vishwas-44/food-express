'use client';

import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#fff',
        color: '#222',
      }}
    >
      {/* Hero */}
      <section
        style={{
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '80px 20px',
          background:
            'linear-gradient(135deg, #e84918 0%, #ff8a00 100%)',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: '850px' }}>
          <p
            style={{
              margin: '0 0 15px',
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '4px',
              textTransform: 'uppercase',
            }}
          >
            Welcome to Food Express
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(48px, 7vw, 85px)',
              fontWeight: '900',
              lineHeight: '1',
              textTransform: 'uppercase',
            }}
          >
            About Us
          </h1>

          <p
            style={{
              margin: '25px auto 0',
              maxWidth: '700px',
              fontSize: '19px',
              lineHeight: '1.7',
            }}
          >
            Great food, fresh ingredients and a simple
            way to enjoy your favourite meals.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '80px 25px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '60px',
            alignItems: 'center',
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 10px',
                color: '#e84918',
                fontWeight: '800',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}
            >
              Our Story
            </p>

            <h2
              style={{
                margin: '0 0 20px',
                fontSize: '42px',
                fontWeight: '900',
                lineHeight: '1.1',
              }}
            >
              Delicious food made simple
            </h2>

            <p
              style={{
                color: '#666',
                fontSize: '17px',
                lineHeight: '1.8',
              }}
            >
              Food Express is a food ordering platform
              created to make ordering your favourite
              meals simple and convenient.
            </p>

            <p
              style={{
                color: '#666',
                fontSize: '17px',
                lineHeight: '1.8',
              }}
            >
              Browse our menu, explore different
              categories, add your favourite food to the
              cart and place your order from the comfort
              of your home.
            </p>
          </div>

          <div
            style={{
              minHeight: '350px',
              borderRadius: '25px',
              background:
                'linear-gradient(135deg, #fff0e8, #ffe0cc)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '130px',
            }}
          >
            🍔
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        style={{
          backgroundColor: '#fafafa',
          padding: '70px 25px',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '25px',
          }}
        >
          <div
            style={{
              padding: '30px',
              backgroundColor: '#fff',
              borderRadius: '18px',
              textAlign: 'center',
              border: '1px solid #eee',
            }}
          >
            <div style={{ fontSize: '45px' }}>🍕</div>

            <h3
              style={{
                fontSize: '22px',
                margin: '15px 0 10px',
              }}
            >
              Fresh Food
            </h3>

            <p
              style={{
                margin: 0,
                color: '#777',
                lineHeight: '1.6',
              }}
            >
              Enjoy delicious food and a variety of
              choices.
            </p>
          </div>

          <div
            style={{
              padding: '30px',
              backgroundColor: '#fff',
              borderRadius: '18px',
              textAlign: 'center',
              border: '1px solid #eee',
            }}
          >
            <div style={{ fontSize: '45px' }}>🛒</div>

            <h3
              style={{
                fontSize: '22px',
                margin: '15px 0 10px',
              }}
            >
              Easy Ordering
            </h3>

            <p
              style={{
                margin: 0,
                color: '#777',
                lineHeight: '1.6',
              }}
            >
              Choose your food, add it to your cart and
              place your order easily.
            </p>
          </div>

          <div
            style={{
              padding: '30px',
              backgroundColor: '#fff',
              borderRadius: '18px',
              textAlign: 'center',
              border: '1px solid #eee',
            }}
          >
            <div style={{ fontSize: '45px' }}>❤️</div>

            <h3
              style={{
                fontSize: '22px',
                margin: '15px 0 10px',
              }}
            >
              Customer Focused
            </h3>

            <p
              style={{
                margin: 0,
                color: '#777',
                lineHeight: '1.6',
              }}
            >
              Built with a simple and convenient
              experience in mind.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: '70px 20px',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: '0 0 15px',
            fontSize: '40px',
            fontWeight: '900',
          }}
        >
          Ready to order?
        </h2>

        <p
          style={{
            margin: '0 0 25px',
            color: '#777',
            fontSize: '18px',
          }}
        >
          Explore our menu and find something delicious.
        </p>

        <button
          type="button"
          onClick={() => router.push('/menu')}
          style={{
            border: 'none',
            backgroundColor: '#e84918',
            color: '#fff',
            padding: '15px 35px',
            borderRadius: '5px',
            fontSize: '16px',
            fontWeight: '800',
            cursor: 'pointer',
          }}
        >
          EXPLORE MENU
        </button>
      </section>
    </main>
  );
}