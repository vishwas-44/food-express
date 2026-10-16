'use client';

import { useEffect, useState } from 'react';

import BannerSlider from '../components/BannerSlider';
import CategorySlider from '../components/CategorySlider';
import ProductGrid from '../components/ProductGrid';
import ImageGallery from '../components/ImageGallery';
import EventsCatering from '../components/EventsCatering';
import Testimonials from '../components/Testimonials';
import LocationSection from '../components/LocationSection';
import Footer from '../components/Footer';

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/admin/categories'
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || 'Failed to fetch categories'
          );
        }

        setCategories(data.data || []);
      } catch (error) {
        console.error(
          'Fetch homepage categories error:',
          error
        );
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryIcon = (name) => {
    const categoryName = String(name || '').toLowerCase();

    if (categoryName.includes('burger')) return '🍔';
    if (categoryName.includes('pizza')) return '🍕';
    if (categoryName.includes('side')) return '🍟';
    if (categoryName.includes('dessert')) return '🍰';
    if (categoryName.includes('beverage')) return '🥤';
    if (categoryName.includes('drink')) return '🥤';
    if (categoryName.includes('pasta')) return '🍝';
    if (categoryName.includes('asian')) return '🍜';
    if (categoryName.includes('starter')) return '🍽️';
    if (categoryName.includes('shawarma')) return '🌯';

    return '🍽️';
  };

  return (
    <main className="bg-white">

      {/* =========================
          HERO SECTION
      ========================== */}
      <section className="position-relative overflow-hidden">
        <BannerSlider />
      </section>

      {/* =========================
          ABOUT SECTION
      ========================== */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row align-items-center g-5">

            {/* Image Collage */}
            <div className="col-lg-6">
              <div className="row g-3">

                <div className="col-7">
                  <div
                    className="rounded-4 overflow-hidden shadow-sm"
                    style={{ height: '360px' }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80"
                      alt="Delicious burger"
                      className="w-100 h-100"
                      style={{
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                </div>

                <div className="col-5">
                  <div
                    className="rounded-4 overflow-hidden shadow-sm mb-3"
                    style={{ height: '170px' }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=700&q=80"
                      alt="Fresh pizza"
                      className="w-100 h-100"
                      style={{
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  <div
                    className="rounded-4 overflow-hidden shadow-sm"
                    style={{ height: '170px' }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80"
                      alt="French fries"
                      className="w-100 h-100"
                      style={{
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Content */}
            <div className="col-lg-6">
              <div className="ps-lg-4">

                <p
                  className="fw-bold text-uppercase mb-2"
                  style={{
                    color: '#f04a23',
                    letterSpacing: '2px',
                  }}
                >
                  Welcome to Food Express
                </p>

                <h2
                  className="fw-bold display-5 mb-4"
                  style={{
                    color: '#242424',
                  }}
                >
                  Nothing brings people together like good food
                </h2>

                <p
                  className="text-secondary fs-5"
                  style={{ lineHeight: '1.8' }}
                >
                  Enjoy delicious food prepared with fresh ingredients
                  and delivered straight to your door. From juicy burgers
                  and crispy sides to delicious pizzas and desserts,
                  Food Express has something for everyone.
                </p>

                <div className="row mt-4 g-3">
                  {categoriesLoading ? (
                    <div className="col-12 text-center text-secondary">
                      Loading categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="col-12 text-center text-secondary">
                      No categories available.
                    </div>
                  ) : (
                    categories.slice(0, 4).map((category) => (
                      <div
                        className="col-6 col-md-3"
                        key={category.id}
                      >
                        <div className="text-center">
                          <div
                            className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                            style={{
                              width: '65px',
                              height: '65px',
                              backgroundColor: '#fff3e0',
                              fontSize: '28px',
                            }}
                          >
                            {getCategoryIcon(category.name)}
                          </div>

                          <strong>{category.name}</strong>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================
          PROMOTIONAL BANNERS
      ========================== */}
      <section className="py-4 bg-light">
        <div className="container">
          <div className="row g-4">

            <div className="col-lg-6">
              <div
                className="position-relative overflow-hidden rounded-4"
                style={{
                  minHeight: '260px',
                  background:
                    'linear-gradient(135deg, #fff4d6, #ffe8b0)',
                }}
              >
                <div className="p-5 position-relative z-1">
                  <p
                    className="text-uppercase fw-bold mb-2"
                    style={{ color: '#e64a19' }}
                  >
                    Special Offer
                  </p>

                  <h3 className="fw-bold display-6">
                    Get your free
                    <br />
                    cheese fries
                  </h3>

                  <button
                    className="btn text-white fw-bold px-4 py-3 mt-3"
                    style={{
                      backgroundColor: '#f04a23',
                      borderRadius: '4px',
                    }}
                  >
                    LEARN MORE
                  </button>
                </div>

                <div
                  className="position-absolute"
                  style={{
                    right: '-30px',
                    bottom: '-30px',
                    fontSize: '150px',
                  }}
                >
                  🍟
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div
                className="position-relative overflow-hidden rounded-4"
                style={{
                  minHeight: '260px',
                  background:
                    'linear-gradient(135deg, #ffe9d6, #ffd0a8)',
                }}
              >
                <div className="p-5 position-relative z-1">
                  <p
                    className="text-uppercase fw-bold mb-2"
                    style={{ color: '#e64a19' }}
                  >
                    Today's Special
                  </p>

                  <h3 className="fw-bold display-6">
                    Crispy chicken
                    <br />
                    burger is back!
                  </h3>

                  <button
                    className="btn text-white fw-bold px-4 py-3 mt-3"
                    style={{
                      backgroundColor: '#f04a23',
                      borderRadius: '4px',
                    }}
                  >
                    ORDER NOW
                  </button>
                </div>

                <div
                  className="position-absolute"
                  style={{
                    right: '-20px',
                    bottom: '-25px',
                    fontSize: '145px',
                  }}
                >
                  🍔
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================
          MENU SECTION
      ========================== */}
      <section className="py-5">
        <div className="container py-4">

          <div className="text-center mb-5">
            <p
              className="fw-bold text-uppercase mb-2"
              style={{
                color: '#f04a23',
                letterSpacing: '2px',
              }}
            >
              Explore
            </p>

            <h2 className="display-5 fw-bold">
              Our Menu
            </h2>

            <p
              className="text-secondary mx-auto"
              style={{ maxWidth: '650px' }}
            >
              Discover our delicious selection of freshly prepared food,
              made for every craving.
            </p>
          </div>

          <div className="mb-5">
            <CategorySlider
              activeCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          <ProductGrid
            selectedCategory={selectedCategory}
          />

        </div>
      </section>

      {/* =========================
          IMAGE GALLERY
      ========================== */}
      <ImageGallery />

      {/* =========================
    EVENTS & CATERING
========================== */}
      <EventsCatering />  

      {/* =========================
    TESTIMONIALS
========================== */}
      <Testimonials />    

      {/* =========================
    LOCATION / MAP
========================== */}
      <LocationSection />

      {/* =========================
          FEATURE BANNER
      ========================== */}
      <section
        className="py-5"
        style={{
          background:
            'linear-gradient(135deg, #ff7a18, #ffb000)',
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center">

            <div className="col-lg-6 text-white">
              <p
                className="fw-bold text-uppercase mb-2"
                style={{ letterSpacing: '2px' }}
              >
                Big. Fresh. Delicious.
              </p>

              <h2 className="display-3 fw-bold mb-3">
                The Big Food
                <br />
                Experience
              </h2>

              <p
                className="fs-5"
                style={{
                  maxWidth: '550px',
                  lineHeight: '1.7',
                }}
              >
                Fresh ingredients, generous portions and flavours
                you'll want to come back for.
              </p>

              <button
                className="btn btn-dark px-5 py-3 fw-bold mt-3"
              >
                ORDER NOW
              </button>
            </div>

            <div className="col-lg-6 text-center mt-4 mt-lg-0">
              <div
                style={{
                  fontSize: '220px',
                  lineHeight: '1',
                }}
              >
                🍔
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================
          WHY FOOD EXPRESS
      ========================== */}
      <section className="py-5 bg-white">
        <div className="container py-5">

          <div className="text-center mb-5">
            <p
              className="fw-bold text-uppercase mb-2"
              style={{
                color: '#f04a23',
                letterSpacing: '2px',
              }}
            >
              Why choose us
            </p>

            <h2 className="display-5 fw-bold">
              Made for food lovers
            </h2>
          </div>

          <div className="row g-4">

            <div className="col-md-4">
              <div className="text-center p-4">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '90px',
                    height: '90px',
                    backgroundColor: '#fff3e0',
                    fontSize: '42px',
                  }}
                >
                  🥗
                </div>

                <h4 className="fw-bold">
                  Fresh Ingredients
                </h4>

                <p className="text-secondary">
                  Carefully selected ingredients prepared fresh for
                  every order.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="text-center p-4">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '90px',
                    height: '90px',
                    backgroundColor: '#fff3e0',
                    fontSize: '42px',
                  }}
                >
                  🚴
                </div>

                <h4 className="fw-bold">
                  Fast Delivery
                </h4>

                <p className="text-secondary">
                  Your favourite meals delivered quickly and safely
                  to your doorstep.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="text-center p-4">
                <div
                  className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: '90px',
                    height: '90px',
                    backgroundColor: '#fff3e0',
                    fontSize: '42px',
                  }}
                >
                  ❤️
                </div>

                <h4 className="fw-bold">
                  Made With Love
                </h4>

                <p className="text-secondary">
                  Great food, simple ordering and an experience made
                  for food lovers.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================
          CALL TO ACTION
      ========================== */}
      <section
        className="py-5 text-white text-center"
        style={{
          backgroundColor: '#242424',
        }}
      >
        <div className="container py-5">

          <p
            className="fw-bold text-uppercase mb-2"
            style={{
              color: '#ffb000',
              letterSpacing: '2px',
            }}
          >
            Hungry?
          </p>

          <h2 className="display-4 fw-bold mb-3">
            Your next favourite meal is waiting.
          </h2>

          <p
            className="text-light mx-auto mb-4"
            style={{ maxWidth: '650px' }}
          >
            Browse our menu and order your favourite food from
            Food Express.
          </p>

          <button
            className="btn px-5 py-3 fw-bold text-white"
            style={{
              backgroundColor: '#f04a23',
              borderRadius: '4px',
            }}
          >
            EXPLORE MENU
          </button>

        </div>
      </section>

      <Footer />

    </main>
  );
}