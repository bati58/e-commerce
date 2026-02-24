const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="#!">About</a>
        <a href="#!">Contact</a>
        <a href="#!">FAQ</a>
        <a href="#!">Terms</a>
      </div>
      <div className="footer-social">
        <a href="#!">Instagram</a>
        <a href="#!">Facebook</a>
        <a href="#!">X</a>
      </div>
      <p>&copy; {new Date().getFullYear()} My Shop. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
