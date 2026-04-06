import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <strong>Arad Real Estate</strong>
            <p>
              Your trusted platform for premium real estate listings.
              Browse verified properties and connect directly with sellers.
            </p>
            <div className="footer-contact-item">
              <span>info@aradre.com</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/projects">Projects</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Property Types</h4>
            <ul>
              <li><Link href="/?propertyType=Apartment">Apartments</Link></li>
              <li><Link href="/?propertyType=House">Houses</Link></li>
              <li><Link href="/?propertyType=Villa">Villas</Link></li>
              <li><Link href="/?propertyType=Commercial">Commercial</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Arad Real Estate. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
