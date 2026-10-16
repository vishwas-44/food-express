'use client';

import { useState } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper/modules';

import {
  Tabs,
  Tab,
  Box,
  Rating,
} from '@mui/material';

import {
  MdShoppingBag,
  MdFavoriteBorder,
  MdStar,
  MdAdd,
  MdRemove,
} from 'react-icons/md';

import ProductCard from '../../../components/ProductCard';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const productImages = [
  '/slide1.jpg',
  '/slide2.jpg',
  '/slide1.jpg',
  '/slide2.jpg',
];

const dummyRelatedProducts = [
  {
    id: '2',
    title: 'Double Bacon Cheeseburger',
    category: 'burgers',
    price: 11.5,
    rating: 4.9,
    reviewsCount: 89,
    description:
      'Juicy beef patties layered with smoked bacon and melted cheddar cheese.',
    image: '/slide2.jpg',
  },
  {
    id: '3',
    title: 'Creamy Alfredo Pasta',
    category: 'pasta',
    price: 13.2,
    rating: 4.7,
    reviewsCount: 56,
    description:
      'Fettuccine pasta tossed in rich parmesan butter cream sauce with garlic.',
    image: '/slide1.jpg',
  },
];

export default function ProductDetailPage() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  const price = 14.99;

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const totalPrice = price * quantity;

  return (
    <main style={{ paddingTop: '100px' }}>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '30px 20px',
        }}
      >
        {/* Main Product Showcase */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '50px',
            alignItems: 'start',
          }}
        >
          {/* ==================== IMAGE GALLERY ==================== */}

          <div>
            {/* Main Image */}
            <Swiper
              modules={[Navigation, Thumbs]}
              navigation
              thumbs={{
                swiper:
                  thumbsSwiper && !thumbsSwiper.destroyed
                    ? thumbsSwiper
                    : null,
              }}
              spaceBetween={10}
              style={{
                width: '100%',
                borderRadius: '15px',
                overflow: 'hidden',
              }}
            >
              {productImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '450px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Thumbnail Slider */}
            <Swiper
              onSwiper={setThumbsSwiper}
              modules={[Thumbs]}
              spaceBetween={10}
              slidesPerView={4}
              watchSlidesProgress
              style={{
                marginTop: '15px',
              }}
            >
              {productImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '90px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* ==================== PRODUCT INFO ==================== */}

          <div>
            <span
              style={{
                display: 'inline-block',
                background: '#ff5722',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '5px',
                fontSize: '13px',
                marginBottom: '12px',
              }}
            >
              Pizza Category
            </span>

            <h1 style={{ marginBottom: '15px' }}>
              Pepperoni Supreme Pizza
            </h1>

            {/* Rating */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '20px',
              }}
            >
              <Rating
                value={4.8}
                precision={0.1}
                readOnly
              />

              <span>4.8 (124 Reviews)</span>
            </div>

            {/* Price */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                marginBottom: '20px',
              }}
            >
              <span
                style={{
                  fontSize: '30px',
                  fontWeight: 'bold',
                }}
              >
                ${totalPrice.toFixed(2)}
              </span>

              <span
                style={{
                  textDecoration: 'line-through',
                  color: '#888',
                }}
              >
                ${(18.99 * quantity).toFixed(2)}
              </span>

              <span
                style={{
                  background: '#e8f5e9',
                  color: '#2e7d32',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                }}
              >
                20% OFF
              </span>
            </div>

            <p
              style={{
                lineHeight: '1.7',
                color: '#555',
                marginBottom: '30px',
              }}
            >
              Freshly baked dough topped with rich house tomato
              sauce, double mozzarella cheese, spicy pepperoni
              slices, and fresh herbs. Delivered hot within 30
              minutes.
            </p>

            {/* Quantity */}
            <div style={{ marginBottom: '25px' }}>
              <span
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontWeight: 'bold',
                }}
              >
                Quantity:
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                }}
              >
                <button
                  onClick={handleDecrease}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    fontSize: '20px',
                  }}
                >
                  <MdRemove />
                </button>

                <span
                  style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    minWidth: '30px',
                    textAlign: 'center',
                  }}
                >
                  {quantity}
                </span>

                <button
                  onClick={handleIncrease}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid #ddd',
                    background: '#fff',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    fontSize: '20px',
                  }}
                >
                  <MdAdd />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                gap: '15px',
              }}
            >
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  flex: 1,
                  padding: '14px',
                  border: 'none',
                  background: '#ff5722',
                  color: '#fff',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                <MdShoppingBag />
                Add to Cart
              </button>

              <button
                style={{
                  width: '55px',
                  border: '1px solid #ddd',
                  background: '#fff',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  fontSize: '25px',
                }}
              >
                <MdFavoriteBorder />
              </button>
            </div>
          </div>
        </div>

        {/* ==================== TABS ==================== */}

        <div style={{ marginTop: '60px' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(event, newValue) =>
                setActiveTab(newValue)
              }
            >
              <Tab label="Description" />
              <Tab label="Reviews" />
            </Tabs>
          </Box>

          {/* Description */}
          {activeTab === 0 && (
            <div style={{ padding: '25px 0' }}>
              <p style={{ lineHeight: '1.8' }}>
                Our signature Pepperoni Supreme Pizza is crafted
                using traditional techniques and premium
                ingredients. Hand-tossed dough is left to ferment
                for 24 hours to ensure a light, crispy crust.
              </p>

              <h4>Key Ingredients:</h4>

              <ul style={{ lineHeight: '2' }}>
                <li>100% Whole Milk Mozzarella Cheese</li>
                <li>Artisanal Italian Pepperoni</li>
                <li>
                  Slow-cooked San Marzano Tomato Sauce
                </li>
                <li>
                  Extra Virgin Olive Oil & Fresh Basil
                </li>
              </ul>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 1 && (
            <div style={{ padding: '25px 0' }}>
              <div
                style={{
                  borderBottom: '1px solid #ddd',
                  paddingBottom: '20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <strong>John Doe</strong>

                  <span style={{ color: '#777' }}>
                    2 days ago
                  </span>
                </div>

                <Rating
                  value={5}
                  readOnly
                  size="small"
                />

                <p>
                  Really tasty pizza! The crust was crispy and
                  the ingredients were fresh.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ==================== RELATED PRODUCTS ==================== */}

        <div style={{ marginTop: '60px' }}>
          <h2 style={{ marginBottom: '25px' }}>
            You Might Also Like
          </h2>

          <Swiper
            modules={[Navigation]}
            navigation
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              768: {
                slidesPerView: 2,
              },
              992: {
                slidesPerView: 2,
              },
            }}
          >
            {dummyRelatedProducts.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </main>
  );
}