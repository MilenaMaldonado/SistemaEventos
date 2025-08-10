import React, { useState, useEffect } from 'react';

const promociones = [
  {
    url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=1200&q=80',
    titulo: 'Conciertos Épicos',
    descripcion: 'Vive la música en vivo como nunca antes',
    cta: 'Ver Eventos',
    gradient: 'from-purple-600/80 to-pink-600/80'
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    titulo: '¡Ofertas Especiales!',
    descripcion: '2x1 en eventos seleccionados por tiempo limitado',
    cta: 'Aprovecha Ahora',
    gradient: 'from-cyan-600/80 to-blue-600/80'
  },
  {
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    titulo: 'Artistas Internacionales',
    descripcion: 'Los mejores shows llegan a tu ciudad',
    cta: 'Descubrir',
    gradient: 'from-orange-600/80 to-red-600/80'
  },
  {
    url: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80',
    titulo: 'Compra Segura',
    descripcion: 'Tickets garantizados con pago 100% protegido',
    cta: 'Más Info',
    gradient: 'from-green-600/80 to-emerald-600/80'
  },
];

export default function CarruselPromociones() {
  const [actual, setActual] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isAutoPlaying || isHovering) return;
    
    const timer = setInterval(() => {
      setActual(prev => (prev + 1) % promociones.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovering]);

  const goToSlide = (index) => {
    setActual(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const siguiente = () => {
    setActual((actual + 1) % promociones.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const anterior = () => {
    setActual((actual - 1 + promociones.length) % promociones.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <div 
      className="relative w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Main Carousel Container */}
      <div className="relative w-full h-full">
        {/* Slides */}
        {promociones.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === actual 
                ? 'opacity-100 z-10' 
                : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image with responsive loading */}
            <img
              src={slide.url}
              alt={slide.titulo}
              className="absolute inset-0 w-full h-full object-cover"
              loading={index === actual ? 'eager' : 'lazy'}
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
            
            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {slide.titulo}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 leading-relaxed">
                    {slide.descripcion}
                  </p>
                  <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 hover:border-white/50 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl">
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Navigation Arrows - Only show on hover or touch devices */}
        <button
          onClick={anterior}
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
            isHovering ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
          }`}
          aria-label="Slide anterior"
        >
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={siguiente}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
            isHovering ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'
          }`}
          aria-label="Siguiente slide"
        >
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Dots Indicator */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2 sm:space-x-3">
          {promociones.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === actual 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-20">
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-1000 ease-out"
            style={{ 
              width: isAutoPlaying && !isHovering 
                ? `${((actual + 1) / promociones.length) * 100}%` 
                : '0%',
              transitionDuration: isAutoPlaying && !isHovering ? '5000ms' : '300ms'
            }}
          />
        </div>
      </div>
    </div>
  );
}