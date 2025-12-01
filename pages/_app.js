// pages/_app.js
import "../styles/globals.css";
import Link from "next/link";
import { useRouter } from "next/router";

function Layout({ children }) {
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/register", label: "Register asset" },
    { href: "/assets", label: "Asset registry" },
    { href: "/monitor", label: "Monitoring dashboard" },
    { href: "/enforce", label: "Simulate enforcement" },
    { href: "/simulate", label: "Simulate online hit" },
    { href: "/settings/allowlist", label: "Settings / allowlist" },
  ];

  return (
    <div className="app-shell">
      <header className="top-nav">
        {/* Logo only – no N avatar here */}
        <Link href="/" className="nav-logo">
          <span className="nav-logo-text">CORA</span>
        </Link>

        <nav className="nav-links">
          {navItems.map((item) => {
            const isActive =
              router.pathname === item.href || router.asPath === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "nav-link" + (isActive ? " nav-link-active" : "")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="app-main">{children}</main>

    </div>
  );
}

export default function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}