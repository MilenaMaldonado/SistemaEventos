import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-links">
  <a href="mailto:contacto@encuentro.com">contacto@encuentro.com</a>
        <a href="/terminos">Términos y condiciones</a>
        <a href="/privacidad">Política de privacidad</a>
      </div>
      <div className="footer-social">
  <a href="https://redencuentro.com" target="_blank" rel="noopener noreferrer" aria-label="RedEncuentro">🌐 RedEncuentro</a>
  <a href="https://musigram.com/encuentro" target="_blank" rel="noopener noreferrer" aria-label="Musigram">🎵 Musigram</a>
  <a href="https://eventbook.com/encuentro" target="_blank" rel="noopener noreferrer" aria-label="EventBook">📚 EventBook</a>
  <a href="https://chatencuentro.com" target="_blank" rel="noopener noreferrer" aria-label="ChatEncuentro">� ChatEncuentro</a>
      </div>
      <div className="footer-copy">
        © 2025 Encuentro. Todos los derechos reservados.
      </div>
    </footer>
  );
}
