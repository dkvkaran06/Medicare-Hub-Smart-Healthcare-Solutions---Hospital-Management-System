import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="brand">
          <span className="brand-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </span>
          Medicare Hub <span>Smart Healthcare Solutions</span>
        </div>
        <div className="landing-nav-links">
          <Link to="/login">LOGIN</Link>
          <Link to="/register">REGISTER</Link>
        </div>
      </nav>

      <section
        className="hero-section"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1600&q=80')`,
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="hero-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Connect with over 100+ doctors
          </div>
          <h1>Healthcare Choices for<br/>Better Living...</h1>
          <p>
            Connecting patients with doctors through innovation, making healthcare
            faster, easier, and more accessible for everyone.
          </p>
          <p className="hero-subtitle">
            Book appointments, access medical records, and manage your health journey — all in one place.
          </p>
          <Link to="/login" className="btn-hero">
            Book Appointment
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 16 16 12 12 8" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </Link>
        </div>
        <div className="landing-footer">© 2026 Medicare Hub — A Smart Healthcare Platform</div>
      </section>
    </div>
  );
}
