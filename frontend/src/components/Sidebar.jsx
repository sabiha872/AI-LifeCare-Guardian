import {
  LayoutDashboard,
  Bot,
  FileText,
  Pill,
  Brain,
  Salad,
  Siren,
  User,
  HeartPulse
} from "lucide-react";

function Sidebar({ activePage, setActivePage }) {

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={19} />
    },

    {
      name: "AI Health Avatar",
      icon: <Bot size={19} />
    },

    {
      name: "Medical Reports",
      icon: <FileText size={19} />
    },

    {
      name: "Medicines",
      icon: <Pill size={19} />
    },

    {
      name: "Mental Health",
      icon: <Brain size={19} />
    },

    {
      name: "Lifestyle",
      icon: <Salad size={19} />
    },

    {
      name: "Emergency",
      icon: <Siren size={19} />
    },

    {
      name: "Profile",
      icon: <User size={19} />
    }
  ];


  return (
    <aside className="sidebar">

      <div className="logo">

        <div className="logo-icon">
          <HeartPulse size={24} />
        </div>

        <div>
          <h2>LifeCare</h2>
          <span>Guardian</span>
        </div>

      </div>


      <nav>

        {menuItems.map((item) => (

          <button
            key={item.name}
            className={
              activePage === item.name
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => setActivePage(item.name)}
          >

            {item.icon}

            <span>
              {item.name}
            </span>

          </button>

        ))}

      </nav>

    </aside>
  );
}

export default Sidebar;