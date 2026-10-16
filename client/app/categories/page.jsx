'use client';

import { useRouter } from 'next/navigation';

const categories = [
  {
    id: 'burgers',
    name: 'Burgers',
    icon: '🍔',
    description: 'Juicy burgers made fresh for every craving.',
  },
  {
    id: 'pizza',
    name: 'Pizza',
    icon: '🍕',
    description: 'Hot, cheesy pizzas with delicious toppings.',
  },
  {
    id: 'pasta',
    name: 'Pasta',
    icon: '🍝',
    description: 'Rich and creamy pasta dishes.',
  },
  {
    id: 'desserts',
    name: 'Desserts',
    icon: '🍰',
    description: 'Sweet treats to finish your meal.',
  },
  {
    id: 'drinks',
    name: 'Beverages',
    icon: '🥤',
    description: 'Refreshing drinks for every meal.',
  },
  {
    id: 'asian',
    name: 'Asian Food',
    icon: '🍜',
    description: 'Flavourful Asian-inspired favourites.',
  },
];

export default function CategoriesPage() {
  const router = useRouter();

  const openCategory = (categoryId) => {
    router.push(`/menu?category=${categoryId}`);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#fff',
        paddingBottom: '80px',
      }}
    >
      {/* Header */}
      <section
        style={{
          textAlign: 'center',
          padding: '80px 20px 55px',
          background:
            'linear-gradient(135deg, #fff7f2 0%, #ffffff 100%)',
        }}
      >
        <p
          style={{
            margin: '0 0 10px',
            color: '#e84918',
            fontSize: '15px',
            fontWeight: '800',
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          Explore Food
        </p>

        <h1
          style={{
            margin: 0,
            color: '#222',
            fontSize: 'clamp(45px, 6vw, 72px)',
            fontWeight: '900',
            textTransform: 'uppercase',
          }}
        >
          Food Categories
        </h1>

        <p
          style={{
            maxWidth: '650px',
            margin: '20px auto 0',
            color: '#777',
            fontSize: '18px',
            lineHeight: '1.7',
          }}
        >
          Choose your favourite category and discover
          delicious food made for you.
        </p>
      </section>

      {/* Category Cards */}
      <section
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '60px 25px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '25px',
          }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => openCategory(category.id)}
              style={{
                border: '1px solid #eeeeee',
                borderRadius: '18px',
                backgroundColor: '#fff',
                padding: '40px 25px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow:
                  '0 8px 25px rgba(0,0,0,0.07)',
                transition:
                  'transform 0.25s ease, box-shadow 0.25s ease',
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform =
                  'translateY(-8px)';
                event.currentTarget.style.boxShadow =
                  '0 15px 35px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                  'translateY(0)';
                event.currentTarget.style.boxShadow =
                  '0 8px 25px rgba(0,0,0,0.07)';
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 25px',
                  borderRadius: '50%',
                  backgroundColor: '#fff3ec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '52px',
                }}
              >
                {category.icon}
              </div>

              <h2
                style={{
                  margin: '0 0 12px',
                  color: '#222',
                  fontSize: '25px',
                  fontWeight: '800',
                }}
              >
                {category.name}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: '#777',
                  fontSize: '15px',
                  lineHeight: '1.6',
                }}
              >
                {category.description}
              </p>

              <div
                style={{
                  marginTop: '22px',
                  color: '#e84918',
                  fontSize: '14px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Explore →
              </div>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}