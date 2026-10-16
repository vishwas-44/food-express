'use client';

import { useState } from 'react';

import CategorySlider from '../../components/CategorySlider';
import ProductGrid from '../../components/ProductGrid';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#fff',
        paddingTop: '30px',
        paddingBottom: '80px',
      }}
    >
      {/* Page Heading */}
      <section
        style={{
          textAlign: 'center',
          padding: '50px 20px 30px',
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#e84918',
            fontSize: '16px',
            fontWeight: '700',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}
        >
          Food Express
        </p>

        <h1
          style={{
            margin: '10px 0',
            fontSize: 'clamp(42px, 6vw, 70px)',
            fontWeight: '900',
            color: '#222',
            textTransform: 'uppercase',
          }}
        >
          Our Menu
        </h1>

        <p
          style={{
            margin: '0 auto',
            maxWidth: '650px',
            color: '#777',
            fontSize: '18px',
            lineHeight: '1.6',
          }}
        >
          Explore our delicious selection of food and choose
          your favourite items.
        </p>
      </section>

      {/* Categories */}
      <CategorySlider
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Products */}
      <ProductGrid
        selectedCategory={selectedCategory}
      />
    </main>
  );
}