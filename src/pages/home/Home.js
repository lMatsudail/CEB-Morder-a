import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const features = [
    {
      icon: '📐',
      title: 'Moldes Profesionales',
      description: 'Patrones digitales creados por expertos en OptiTex con precisión milimétrica.'
    },
    {
      icon: '🎓',
      title: 'Capacitación Personalizada',
      description: 'Aprende a modificar y adaptar moldes con clases uno a uno con nuestros patronistas.'
    },
    {
      icon: '💾',
      title: 'Archivos Digitales',
      description: 'Descarga inmediata de archivos compatibles con OptiTex y plotters de impresión.'
    },
    {
      icon: '🔄',
      title: 'Actualizaciones',
      description: 'Acceso de por vida a actualizaciones y mejoras de tus moldes adquiridos.'
    }
  ];

  const packages = [
    {
      title: 'Molde Básico',
      price: '20.000',
      features: [
        'Archivo digital del molde',
        'Compatible con OptiTex 23.2',
        'Listo para plotter',
        'Guía de tallas incluida'
      ],
      popular: false
    },
    {
      title: 'Molde + Capacitación',
      price: '80.000',
      features: [
        'Todo lo del molde básico',
        'Clase personalizada 1 hora',
        'Aprende modificaciones',
        'Soporte técnico',
        'Técnicas de gradación'
      ],
      popular: true
    }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>
                Moldería Profesional <br />
                <span className="highlight">con OptiTex</span>
              </h1>
              <p>
                Descubre nuestra colección de moldes digitales de alta calidad y 
                perfecciona tus habilidades con capacitación personalizada de patronistas expertos.
              </p>
              <div className="hero-actions">
                <Link to="/catalogo" className="btn btn-primary">
                  Ver Catálogo
                </Link>
                <Link to="/register" className="btn btn-secondary">
                  Comenzar Ahora
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <div className="placeholder-image">
                📐 OptiTex 23.2
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">¿Por qué elegir CEB Moldería?</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing">
        <div className="container">
          <h2 className="section-title">Nuestros Paquetes</h2>
          <div className="pricing-grid">
            {packages.map((pkg, index) => (
              <div key={index} className={`pricing-card ${pkg.popular ? 'popular' : ''}`}>
                {pkg.popular && <div className="popular-badge">Más Popular</div>}
                <h3>{pkg.title}</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">{pkg.price}</span>
                  <span className="period">COP</span>
                </div>
                <ul className="features-list">
                  {pkg.features.map((feature, featureIndex) => (
                    <li key={featureIndex}>✓ {feature}</li>
                  ))}
                </ul>
                <Link to="/catalogo" className="btn btn-primary">
                  Ver Moldes
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>¿Eres Patronista Profesional?</h2>
            <p>
              Únete a nuestra plataforma y vende tus moldes a una comunidad 
              apasionada por la moda y el patronaje.
            </p>
            <Link to="/register" className="btn btn-secondary">
              Registrarse como Patronista
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;