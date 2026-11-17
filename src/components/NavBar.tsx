import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Inicio", icon: "🏠" },
  { to: "/esta-semana", label: "Semana", icon: "📅" },
  { to: "/tabla", label: "Tabla", icon: "🏆" },
  { to: "/mejores-parejas", label: "Parejas", icon: "🤝" },
  { to: "/rachas", label: "Rachas", icon: "🔥" },
  { to: "/historial", label: "Historial", icon: "📖" },
];

export default function NavBar() {
  return (
    <nav className="navbar">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
        >
          <span className="nav-icon">{link.icon}</span>
          <span className="nav-label">{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
