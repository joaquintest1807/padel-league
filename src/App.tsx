import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import EstaSemana from "./pages/EstaSemana";
import Tabla from "./pages/Tabla";
import MejoresParejas from "./pages/MejoresParejas";
import Rachas from "./pages/Rachas";
import Historial from "./pages/Historial";

export default function App() {
  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/esta-semana" element={<EstaSemana />} />
          <Route path="/tabla" element={<Tabla />} />
          <Route path="/mejores-parejas" element={<MejoresParejas />} />
          <Route path="/rachas" element={<Rachas />} />
          <Route path="/historial" element={<Historial />} />
        </Routes>
      </main>
      <NavBar />
    </div>
  );
}
