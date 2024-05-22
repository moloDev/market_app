import React, { useEffect, useState } from 'react';
import './styles/Banner.css';

const Banner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slides = [
    './image1.jpg',
    './image2.jpg',
    './image3.jpg'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="banner">
      <div className="banner-container">
        {slides.map((slide, index) => (
          <div key={index} className={`banner-slide ${index === currentIndex ? 'active' : ''}`}>
            <img src={slide} alt={`Slide ${index + 1}`} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Banner;
