import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import HelpMenu from "./pages/Help/help";
import TopBar from "./layouts/TopBar/TopBar";
import StatisticsDashboard from "./layouts/StatsDashboard/StatsDashboard";

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
        <Route path="/admin" element={
            <div>
              <TopBar></TopBar>
              <StatisticsDashboard></StatisticsDashboard>
            </div>
          }>
        </Route>
      }
    </Routes>
  );
}

export default App;
