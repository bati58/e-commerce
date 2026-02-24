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
            <li>Email: batidev01@gmail.com</li>
            <li>Phone: +251989977058</li>
            <li>Address:Adama, Oromia, Ethiopia</li>
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
        <a href="https://instagram.com/bati_jano" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <a href="https://facebook.com/bati-jano" target="_blank" rel="noreferrer">
          Facebook
        </a>
        <a href="https://linkedin.com/in/bati-jano" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href="https://x.com/moonba1212" target="_blank" rel="noreferrer">
          Twitter/X
        </a>
      </div>
      <p className="footer-copy">&copy; {year} My Shop. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
