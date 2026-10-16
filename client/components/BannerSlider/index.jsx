'use client';

import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import {
  Autoplay,
  Pagination,
} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

export default function BannerSlider() {
  const router = useRouter();

  const slides = [
    {
      id: 1,
      title: 'CRISPY',
      title2: 'CHICKEN',
      description:
        'Crispy chicken, fresh vegetables and delicious sauce.',
      price: '₹199',
      code: 'FOOD01',
      bgImage: '/slide1.jpg',
    },
    {
      id: 2,
      title: 'FRESH',
      title2: 'FLAVOUR',
      description:
        'Fresh ingredients and amazing taste in every bite.',
      price: '₹249',
      code: 'FOOD02',
      bgImage: '/slide2.jpg',
    },
  ];

  return (
    <section
      style={{
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        loop={true}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        style={{
          width: '100%',
        }}
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              style={{
                position: 'relative',
                minHeight: '620px',
                width: '100%',
                backgroundImage: `url(${slide.bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Orange Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(90deg, rgba(232,73,24,0.94) 0%, rgba(232,73,24,0.78) 42%, rgba(0,0,0,0.05) 75%)',
                  zIndex: 1,
                }}
              />

              {/* Decorative Circles */}
              <div
                style={{
                  position: 'absolute',
                  width: '420px',
                  height: '420px',
                  border: '2px solid rgba(255,255,255,0.12)',
                  borderRadius: '50%',
                  left: '-180px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  width: '300px',
                  height: '300px',
                  border: '2px solid rgba(255,255,255,0.08)',
                  borderRadius: '50%',
                  left: '-120px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
              />

              {/* Hero Content */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  width: '100%',
                  maxWidth: '1400px',
                  margin: '0 auto',
                  padding: '80px 7%',
                  color: '#fff',
                }}
              >
                <div
                  style={{
                    maxWidth: '650px',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 12px',
                      fontSize: '18px',
                      fontWeight: '700',
                      letterSpacing: '3px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Food Express Special
                  </p>

                  <h1
                    style={{
                      margin: 0,
                      fontSize: 'clamp(60px, 8vw, 110px)',
                      lineHeight: '0.88',
                      fontWeight: '900',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      color: '#fff',
                    }}
                  >
                    {slide.title}
                    <br />
                    {slide.title2}
                  </h1>

                  <p
                    style={{
                      marginTop: '30px',
                      marginBottom: '20px',
                      maxWidth: '520px',
                      fontSize: '19px',
                      lineHeight: '1.6',
                      color: 'rgba(255,255,255,0.92)',
                    }}
                  >
                    {slide.description}
                  </p>

                  <p
                    style={{
                      margin: '0 0 25px',
                      fontSize: '18px',
                      fontWeight: '600',
                    }}
                  >
                    Open Daily:{' '}
                    <span
                      style={{
                        color: '#ffd21c',
                        fontWeight: '900',
                      }}
                    >
                      11:30 AM - 8:30 PM
                    </span>
                  </p>

                  {/* Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => router.push('/cart')}
                      style={{
                        border: 'none',
                        backgroundColor: '#f8b400',
                        color: '#222',
                        padding: '15px 32px',
                        fontSize: '16px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Order Now
                    </button>

                    <button
                      type="button"
                      onClick={() => router.push('/menu')}
                      style={{
                        border: '2px solid #fff',
                        backgroundColor: 'transparent',
                        color: '#fff',
                        padding: '13px 30px',
                        fontSize: '16px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                      }}
                    >
                      View Menu
                    </button>
                  </div>
                </div>
              </div>

              {/* Price Badge */}
              <div
                style={{
                  position: 'absolute',
                  right: '8%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  width: '145px',
                  height: '145px',
                  borderRadius: '50%',
                  backgroundColor: '#ef251c',
                  border: '5px solid rgba(255,255,255,0.9)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  textAlign: 'center',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  Only
                </span>

                <strong
                  style={{
                    fontSize: '34px',
                    lineHeight: '1',
                    margin: '5px 0',
                  }}
                >
                  {slide.price}
                </strong>

                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                  }}
                >
                  Code: {slide.code}
                </span>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}