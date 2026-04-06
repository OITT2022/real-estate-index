import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="not-found-code">404</p>
      <h1>Page Not Found</h1>
      <p>
        Sorry, the page you are looking for does not exist or has been moved.
        Let&apos;s get you back on track.
      </p>
      <Link href="/" className="button-primary">
        Back to Homepage
      </Link>
    </main>
  );
}
