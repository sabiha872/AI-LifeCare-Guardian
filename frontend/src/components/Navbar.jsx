import {
  Bell,
  Search,
  User,
  Sun,
  Moon
} from "lucide-react";

function Navbar({ theme, toggleTheme }) {

  return (
    <header className="navbar">

      <div className="search-box">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search health records..."
        />

      </div>


      <div className="navbar-right">

        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="notification">
          <Bell size={20} />
          <span></span>
        </button>


        <div className="user-info">

          <div className="user-avatar">
            <User size={18} />
          </div>

          <div>
            <strong>Sabiha</strong>
            <small>Patient</small>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;