import React from 'react';
import './Testimonios.css';

export default function Testimonios() {
  return (
    <section className="testimonios">
      <h3>Lo que dicen nuestros clientes</h3>
      <div className="testimonios-list">
        <div className="testimonio-card">
          <p>“Encuentro me facilitó la compra de boletos, ¡muy rápido y seguro!”</p>
          <span>- Juan P.</span>
        </div>
        <div className="testimonio-card">
          <p>“Excelente atención y variedad de eventos. Recomendado.”</p>
          <span>- María G.</span>
        </div>
        <div className="testimonio-card">
          <p>“Me encantó la experiencia, volveré a comprar.”</p>
          <span>- Carlos R.</span>
        </div>
      </div>
    </section>
  );
}
