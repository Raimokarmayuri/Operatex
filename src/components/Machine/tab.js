import React from "react";
import { Outlet, useParams } from "react-router-dom";
// import Files from "../Machine/Files"; // Import the tab navigation component

const MachineDetails = () => {
  const { machineId } = useParams(); // Get machine ID from URL

  return (
    <div className="mt-0">
      {/* <h2 className="text-center">Machine Details - {machineId}</h2> */}

      {/* Tabs Navigation */}
      {/* <Files /> */}

      {/* Outlet renders selected tab content */}
      <div className="mt-0">
        <Outlet />
      </div>
    </div>
  );
};

export default MachineDetails;
