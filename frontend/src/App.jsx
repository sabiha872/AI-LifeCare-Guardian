import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Dashboard from "./pages/Dashboard";
import Avatar from "./pages/Avatar";
import Reports from "./pages/Reports";
import Medicines from "./pages/Medicines";
import MentalHealth from "./pages/MentalHealth";
import Lifestyle from "./pages/Lifestyle";
import Emergency from "./pages/Emergency";
import Profile from "./pages/Profile";

import "./App.css";


function App() {

  const [activePage, setActivePage] = useState("Dashboard");

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };


  const renderPage = () => {

    switch (activePage) {

      case "Dashboard":
        return <Dashboard setActivePage={setActivePage} />;

      case "AI Health Avatar":
        return <Avatar />;

      case "Medical Reports":
        return <Reports />;

      case "Medicines":
        return <Medicines />;

      case "Mental Health":
        return <MentalHealth />;

      case "Lifestyle":
        return <Lifestyle />;

      case "Emergency":
        return <Emergency />;

      case "Profile":
        return <Profile />;

      default:
        return <Dashboard />;
    }

  };


  return (

    <div className="app">

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main">

        <Navbar theme={theme} toggleTheme={toggleTheme} />

        <div className="content">

          {renderPage()}

        </div>

      </main>

    </div>

  );
}


export default App;