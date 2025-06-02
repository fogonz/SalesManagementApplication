import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import HelpMenu from "./pages/Help/help";
import TopBar from "./layouts/TopBar/TopBar";

function App() {
  return (
    <Routes>
      {/* MAIN PATH - HOME */}
      {
        <Route path="/" element={
            <div>
              <TopBar></TopBar>
              <Home></Home>
            </div>
          }>
        </Route>
      }

      {/* HELP PATH */}
      {
        <Route path="/ayuda" element={
            <div>
              <TopBar></TopBar>
              <HelpMenu></HelpMenu>
            </div>
          }>
        </Route>
      }
            
      {/* ADMIN PATH */}
      {
        <Route path="/administrador" element={
            <div>
              <TopBar></TopBar>
              <div> <h1>.</h1><h1> VENTANA DE ADMINISTRACION - PLACHOLDER</h1></div>
            </div>
          }>
        </Route>
      }
    </Routes>
  );
}

export default App;
