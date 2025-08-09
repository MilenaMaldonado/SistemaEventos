import React from 'react';
import './InfoPagoSeguridad.css';

export default function InfoPagoSeguridad() {
  return (
    <section className="info-pago-seguridad">
      <h3>Pagos y Seguridad</h3>
      <div className="info-icons">
        <div className="info-item">
          <span role="img" aria-label="seguro">🔒</span>
          <p>Pagos 100% seguros</p>
        </div>
        <div className="info-item">
          <span role="img" aria-label="tarjeta">💳</span>
          <p>Aceptamos tarjetas y transferencias</p>
        </div>
        <div className="info-item">
          <span role="img" aria-label="proteccion">🛡️</span>
          <p>Protección de datos</p>
        </div>
      </div>
    </section>
  );
}
