const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <section className="footer-block">
          <h3>About</h3>
          <p>
            My Shop is built to make online shopping simple, reliable, and fast. We focus on
            quality products, transparent pricing, and smooth checkout from mobile and desktop.
          </p>
        </section>

        <section className="footer-block">
          <h3>Contact</h3>
          <ul className="footer-list">
            <li>Email: your-email@example.com (update required)</li>
            <li>Phone: +1 000 000 0000 (update required)</li>
            <li>Address: Your business address here (update required)</li>
          </ul>
        </section>

        <section className="footer-block">
          <h3>FAQ</h3>
          <ul className="footer-list">
            <li>How long does shipping take? Usually 3-7 business days.</li>
            <li>Can I return items? Yes, returns are supported per policy.</li>
            <li>How can I track my order? Use Account &gt; Track Order.</li>
          </ul>
        </section>

        <section className="footer-block">
          <h3>Terms</h3>
          <ul className="footer-list">
            <li>Prices and product availability may change without notice.</li>
            <li>Orders are confirmed after payment validation.</li>
            <li>By ordering, you agree to our shipping and return policies.</li>
          </ul>
        </section>
      </div>

      <div className="footer-social">
        <a
          href="https://instagram.com/bati_jano"
          target="_blank"
          rel="noreferrer"
          className="footer-social-link"
          aria-label="Instagram bati_jano"
        >
          <span className="social-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z" />
              <circle cx="12" cy="12" r="3.5" />
              <circle cx="17.5" cy="6.5" r="0.9" />
            </svg>
          </span>
          <span>bati_jano</span>
        </a>
        <a
          href="https://facebook.com/bati-jano"
          target="_blank"
          rel="noreferrer"
          className="footer-social-link"
          aria-label="Facebook bati-jano"
        >
          <span className="social-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M13.5 22v-8h3l.5-4h-3.5V7.5c0-1.1.3-1.8 1.8-1.8H17V2.2c-.3 0-1.3-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5V10H7v4h3V22h3.5Z" />
            </svg>
          </span>
          <span>bati-jano</span>
        </a>
        <a
          href="https://linkedin.com/in/bati-jano"
          target="_blank"
          rel="noreferrer"
          className="footer-social-link"
          aria-label="LinkedIn bati-jano"
        >
          <span className="social-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M6.2 8.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM4.5 22V10h3.4v12H4.5Zm5.2 0V10h3.2v1.7h.1c.4-.8 1.5-2 3.4-2 3.6 0 4.2 2.3 4.2 5.4V22h-3.4v-6.3c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V22H9.7Z" />
            </svg>
          </span>
          <span>bati-jano</span>
        </a>
        <a
          href="https://x.com/moonba1212"
          target="_blank"
          rel="noreferrer"
          className="footer-social-link"
          aria-label="Twitter moonba1212"
        >
          <span className="social-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M18.8 3H22l-7.1 8.1L23 21h-6.3l-5-6.4L6.1 21H3l7.6-8.7L2 3h6.5l4.5 5.9L18.8 3Z" />
            </svg>
          </span>
          <span>moonba1212</span>
        </a>
      </div>
      <p className="footer-copy">&copy; {year} My Shop. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
