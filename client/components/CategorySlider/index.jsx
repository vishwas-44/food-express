'use client';

import { useEffect, useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

const categoryIcons = {
  pizza: '🍕',
  burger: '🍔',
  burgers: '🍔',
  pasta: '🍝',
  dessert: '🍰',
  desserts: '🍰',
  beverage: '🥤',
  beverages: '🥤',
  drinks: '🥤',
  asian: '🍜',
  sides: '🍟',
};

const getCategoryIcon = (name) => {
  const key = String(name || '')
    .trim()
    .toLowerCase();

  return categoryIcons[key] || '🍽️';
};

export default function CategorySlider({
  activeCategory,
  onSelectCategory,
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/admin/categories'
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              'Failed to fetch categories'
          );
        }

        const fetchedCategories =
          data.data || [];

        setCategories(fetchedCategories);
      } catch (error) {
        console.error(
          'Fetch categories error:',
          error
        );

        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const allCategories = [
    {
      id: 'all',
      name: 'All Items',
      icon: '🍽️',
    },
    ...categories.map((category) => ({
      id:
        category.id ||
        category._id ||
        category.name,
      name:
        category.name ||
        category.category_name ||
        category.title ||
        'Category',
      icon: getCategoryIcon(
        category.name ||
          category.category_name ||
          category.title
      ),
    })),
  ];

  return (
    <section style={{ padding: '40px 20px' }}>
      <div>
        <h2>Explore Categories</h2>

        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={15}
          slidesPerView={2}
          breakpoints={{
            576: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
            992: {
              slidesPerView: 5,
            },
            1200: {
              slidesPerView: 6,
            },
          }}
        >
          {loading ? (
            <SwiperSlide>
              <div
                style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#666',
                }}
              >
                Loading categories...
              </div>
            </SwiperSlide>
          ) : (
            allCategories.map((category) => (
              <SwiperSlide key={category.id}>
                <button
                  onClick={() =>
                    onSelectCategory(
                      category.id
                    )
                  }
                  style={{
                    width: '100%',
                    padding: '20px 10px',
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    background:
                      activeCategory ===
                      category.id
                        ? '#ff5722'
                        : '#fff',
                    color:
                      activeCategory ===
                      category.id
                        ? '#fff'
                        : '#222',
                    cursor: 'pointer',
                    fontSize: '16px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '35px',
                    }}
                  >
                    {category.icon}
                  </div>

                  <div>
                    {category.name}
                  </div>
                </button>
              </SwiperSlide>
            ))
          )}
        </Swiper>
      </div>
    </section>
  );
}