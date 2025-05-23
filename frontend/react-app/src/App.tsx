import React from "react";
import TopBar from "./components/TopBar/TopBar";
import TableBox from "./components/TableBox/TableBox";
import SideBar from "./components/SideBar/SideBar";


function App() {
  return (
    <div>
      <TopBar></TopBar>
      <div className="column">
        <SideBar></SideBar>
        <TableBox></TableBox>
        
      </div>
    </div>
  );
}

export default App;
