import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-mark">
          Real Estate Index
        </Link>
        <nav className="top-nav">
          <Link href="/">Home</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/admin/dashboard">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
