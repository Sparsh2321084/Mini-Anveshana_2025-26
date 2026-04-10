import Navbar from '../components/Navbar';
import './AppShell.css';

function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-shell-content">{children}</main>
    </div>
  );
}

export default AppShell;
