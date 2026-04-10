import { BarChart3, BrainCircuit, ShieldCheck, Wheat } from 'lucide-react';
import './Navbar.css';

const navLinks = [
  { href: '#overview', label: 'Overview', icon: BarChart3 },
  { href: '#quality', label: 'Quality', icon: ShieldCheck },
  { href: '#insights', label: 'Insights', icon: BrainCircuit }
];

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a className="navbar-brand" href="#top" aria-label="Smart Grain Storage Dashboard">
          <span className="navbar-brand-mark">
            <Wheat size={18} />
          </span>
          <span className="navbar-brand-copy">
            <strong>Smart Storage</strong>
            <span>Grain operations cockpit</span>
          </span>
        </a>

        <nav className="navbar-links" aria-label="Section navigation">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <a key={href} href={href} className="navbar-link">
              <Icon size={16} />
              <span>{label}</span>
            </a>
          ))}
        </nav>

        <div className="navbar-actions">
          <span className="navbar-chip">Live Warehouse</span>
          <a className="navbar-cta" href="#visualization">
            Open 3D View
          </a>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
