import {
  Bell,
  Search,
  User
} from "lucide-react";

function Navbar() {

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