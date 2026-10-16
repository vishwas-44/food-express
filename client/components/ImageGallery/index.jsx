'use client';

const galleryImages = [
  {
    src: '/gallery1.jpg',
    alt: 'Delicious burger',
  },
  {
    src: '/gallery2.jpg',
    alt: 'Fresh pizza',
  },
  {
    src: '/gallery3.jpg',
    alt: 'Grilled food',
  },
  {
    src: '/gallery4.jpg',
    alt: 'Cheesy pizza',
  },
  {
    src: '/gallery5.jpg',
    alt: 'Fresh burger',
  },
  {
    src: '/gallery6.jpg',
    alt: 'Delicious food',
  },
  {
    src: '/gallery7.jpg',
    alt: 'Restaurant food',
  },
  {
    src: '/gallery8.jpg',
    alt: 'Special burger',
  },
];

const fallbackImage = '/gallery1.jpg';

export default function ImageGallery() {
  const handleImageError = (event) => {
    if (event.currentTarget.src !== window.location.origin + fallbackImage) {
      event.currentTarget.src = fallbackImage;
    }
  };

  return (
    <section
      style={{
        padding: '90px 5%',
        backgroundColor: '#ffffff',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            margin: 0,
            color: '#e21b12',
            fontSize: '46px',
            fontWeight: '800',
            letterSpacing: '1px',
          }}
        >
          IMAGE GALLERY
        </h2>

        <p
          style={{
            marginTop: '18px',
            marginBottom: '45px',
            color: '#999999',
            fontSize: '16px',
            lineHeight: '1.8',
          }}
        >
          A glimpse of our delicious food, special moments and
          restaurant experience.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
          }}
        >
          {galleryImages.map((image, index) => (
            <div
              key={index}
              style={{
                width: '100%',
                height: '250px',
                overflow: 'hidden',
                borderRadius: '4px',
                backgroundColor: '#f5f5f5',
              }}
            >
              <img
                src={image.src || fallbackImage}
                alt={image.alt}
                loading="lazy"
                onError={handleImageError}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}