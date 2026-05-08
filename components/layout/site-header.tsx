import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-mark">
          <img src="/Favicon/android-chrome-192x192.png" alt="Arad Real Estate" className="brand-logo" />
          Arad Real Estate
        </Link>
        <nav className="top-nav">
          <Link href="/">Home</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/map">Map</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>
    </header>
  );
}
