import React from 'react';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1>Vive la emoción de tus eventos favoritos con <span className="hero-brand">Encuentro</span></h1>
        <p>Compra tus tickets de forma fácil, rápida y segura.</p>
        <a href="#eventos" className="hero-btn">Comprar Tickets</a>
      </div>
    </section>
  );
}
