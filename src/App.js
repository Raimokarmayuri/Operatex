
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "./context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./components/MainComponent/Sidebar";
import Navbar from "./components/MainComponent/Navbar";
import Footer from "./components/MainComponent/Footer";
import LoginPage from "./components/Auth/LoginPage";
import RegisterPage from "./components/Auth/RegisterPage";
import Dashboard from "./components/Dashboard/Dashboard";
import "./App.css";
import NewDash from "./components/Dashboard/NewDash";
import OleReport from "./components/Report/OleReport";
import ProductionReport from "./components/Report/ProductionReport";
import ProductionChart from "./components/Admin/View/ProductionChart";
import OEEreport from "./components/Report/OEEreport";
import Downtimereport from "./components/Report/Downtimereport";
import ProductionCHartReport from "./components/Report/ProductionCHartReport";
import ProdChart from "./components/Report/ProductionReportTable";

import BreakdownReport from "./components/Report/BreakdownReport";
import BreakdownRaise from "./components/Masters/BreakdownRaise";
import Tool from "./components/Report/ToolReports";
import EditOeeForQuality from "./components/Report/EditOeeForQuality";
import Monitorings from "./components/Report/Monitorings";
import OeeSheet from "./components/Report/OeeSheet";
import Downtime from "./components/MachineCard/Downtime";

import Breakdowntime from "./components/Admin/View/Breakdowntime";
import Addmaintenance from "./components/Masters/Addmaintenance";
import Summary from "./components/MachineCard/Summary";
import Report from "./components/MachineCard/Report";
import Monitoring from "./components/MachineCard/Monitoring";
import Tools from "./components/MachineCard/Tools";
import Alerts from "./components/MachineCard/Alerts";
import Maintenance from "./components/Machine/Maintenance";
import Tab from "./components/Machine/tab";
import MainTab from "./components/Machine/MaintTab";
import AllDowntime from "./components/Masters/AllDowntime";
import MachinePartChart from "./components/Charts/MachinePartChart";
import ProductionSummary from "./components/Charts/LossIdentification";
import LossReport from "./components/Report/LossReport";
import PMDash from "./components/Machine/PMDash";
import UpcommingSchedule from "./components/Machine/upcomingSchedule";

import MainSchedule from "./components/Machine/MainSchedule";
import MainAsset from "./components/Machine/MainAsset";
import ActiveMachine from "./components/Machine/ActiveMachine";
import InactiveMachine from "./components/Machine/InactiveMachine";

import PMCHistory from "./components/Machine/PMCHistory";

import MachineMaster from "./components/Masters/MachineMaster";
import Shift from "./components/Masters/Shift";
import Skill from "./components/Masters/Skill";
import AddTool from "./components/Masters/Tool";
import Workforce from "./components/Masters/Workforce";
import OpenBD from "./components/Masters/OpenBD";
import Parts from "./components/Masters/Part";
// import Parts from "./components/Masters/Part";
import SetupHistory from "./components/Masters/setupHistory";


import BDHistory from "./components/Masters/BDAnalysis";
import BreakdownHistory from "./components/Masters/BreakdownHistory";
import PmcParameter from "./components/Masters/PmcParameter";
import Diagnostic from "./components/Masters/Diagnostics";
import AlertTable from "./components/Admin/Alerts/AlertTable";
import PMCAlert from "./components/Admin/Alerts/PMCAlert";
import ToolAlert from "./components/Admin/Alerts/ToolAlert";
import PMAlert from "./components/Admin/Alerts/PMAlerts";
import RejectedPartsTable from "./components/Masters/RejectTable";
import EditBreakdown from "./components/Masters/EditBreakdown";
import Line from "./components/Masters/Linemaster";
import Process from "./components/Masters/ProcessMaster";
import SetupMaster from "./components/Masters/setupMaster";
import Setups from "./components/Masters/setupApproval";
import QualityApproval from "./components/Masters/QualityApproval";

import Alarms from "./components/User/Alarms";
import DownTime from "./components/User/DownTime";
import GuageCalibration from "./components/User/GuageCalibration";
import MachineStartup from "./components/User/MachineStartup";
import MachineDocument from "./components/User/MachineDocument";
import ProcessOperation from "./components/User/ProcessOperation";
import QualityCheck from "./components/User/QualityCheck";
import RaiseBreakdown from "./components/User/RaiseBreakdown";
import Rejection from "./components/User/Rejection";
import Setup from "./components/User/Setup";
import SetupApproval from "./components/User/SetupApproval";
import UserPage from "./components/User/UserPage";
import WorkInstruction from "./components/User/WorkInstruction";
import SummaryOP from "./components/User/Summary";
import PartRejectTable from "./components/Report/PartRejectTable";



const ProtectedRoute = ({ children, role, roles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  localStorage.setItem("lastVisitedPage", location.pathname);
  return children;
};

const App = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

  const [collapsed, setCollapsed] = useState(true);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  // ✅ Fix: Define `lastVisitedPage`
  const lastVisitedPage =
    localStorage.getItem("lastVisitedPage") || "/admin/dashboard";

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 768);
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="d-flex ">
          {/* Navbar with sidebar toggle */}
          {/* <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} /> */}
          <Sidebar
            collapsed={collapsed}
            toggleSidebar={toggleSidebar}
            isMobileView={window.innerWidth < 768}
          />
          <div
            className="main-content overflowX-hidden"
            style={{
              marginLeft:
                window.innerWidth < 768 ? 0 : collapsed ? "70px" : "265px",
              transition: "margin-left 0.3s ease",
              width: "100%",
              overflowX: "hidden",
            }}
          >
            <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            {/* Main Content Section with dynamic margin */}
            <div className="p-0">
              <Routes>
                <Route path="/" element={<Navigate to={lastVisitedPage} />} />{" "}
                <Route
                  path="/newdash"
                  element={
                    <ProtectedRoute
                      roles={[
                        "admin",
                        "production",
                        "operator",
                        "maintenance",
                        "quality",
                      ]}
                    >
                      <NewDash />
                    </ProtectedRoute>
                  }
                />
                <Route path="/machine/:machineId" element={<Summary />} />
                <Route
                  path="/machine/:machineId"
                  element={
                    <ProtectedRoute>
                      <Tab />
                    </ProtectedRoute>
                  }
                >
                  <Route path="summary" element={<Summary />} />
                  <Route path="monitoring" element={<Monitoring />} />
                  <Route path="maintenance" element={<Maintenance />} />
                  <Route path="machinedetails" element={<Tools />} />
                  <Route path="alert" element={<Alerts />} />
                  <Route path="report" element={<Report />} />
                </Route>
                {/* <Route
                  path="/machine/:machineId/maintenance"
                  element={<Summary />}
                /> */}
                <Route
                  path="/machine/:machineId/maintenances"
                  element={<PMDash />}
                />
                <Route
                  path="/machine/:machineId/maintenance"
                  element={
                    <ProtectedRoute>
                      <MainTab />
                    </ProtectedRoute>
                  }
                >
                  <Route path="pmdash" element={<PMDash />} />
                  <Route path="schedule" element={<UpcommingSchedule />} />
                  <Route path="Schedules" element={<MainSchedule />} />
                  <Route path="assetsdetails" element={<MainAsset />} />
                </Route>
                <Route
                  path="/partchart"
                  element={
                    <ProtectedRoute roles={["admin", "production", "operator"]}>
                      <MachinePartChart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/oeesheet"
                  element={
                    <ProtectedRoute roles={["admin", "production", "operator"]}>
                      <OeeSheet />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/downtime"
                  element={
                    <ProtectedRoute roles={["admin", "production", "operator"]}>
                      <Downtime />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/toolreport"
                  element={
                    <ProtectedRoute roles={["admin", "production", "operator"]}>
                      <Tool />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/line"
                  element={
                    <ProtectedRoute roles={["admin", "production", "operator"]}>
                      <Line />
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/process"
                  element={
                    <ProtectedRoute roles={["admin", "production", "operator"]}>
                      <Process />
                    </ProtectedRoute>
                  }
                />
                  <Route
                  path="/Setuphistory"
                  element={
                    <ProtectedRoute roles={["admin", "operator"]}>
                      <SetupHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/setup"
                  element={
                    <ProtectedRoute roles={["admin", "production", "operator"]}>
                      <SetupMaster />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/pmdash"
                  element={
                    <ProtectedRoute role="admin">
                      <PMDash />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/Schedules"
                  element={
                    <ProtectedRoute role="admin">
                      <MainSchedule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/assetsdetails"
                  element={
                    <ProtectedRoute role="admin">
                      <MainAsset />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/loss"
                  element={
                    <ProtectedRoute
                      roles={["admin", "production", "operator", "quality"]}
                    >
                      <LossReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ole"
                  element={
                    <ProtectedRoute role="admin">
                      <OleReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute role="admin">
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prodsummary"
                  element={
                    <ProtectedRoute roles={["admin", "production"]}>
                      <ProductionSummary />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pmcalert"
                  element={
                    <ProtectedRoute role="admin">
                      <PMCAlert />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pmalert"
                  element={
                    <ProtectedRoute
                      roles={["admin", "production", "maintenance", "operator"]}
                    >
                      <PMAlert />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/toolalert"
                  element={
                    <ProtectedRoute role="admin">
                      <ToolAlert />
                    </ProtectedRoute>
                  }
                />
               
                <Route
                  path="/pmchistory"
                  element={
                    <ProtectedRoute role="admin">
                      < PMCHistory />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/alerttable"
                  element={
                    <ProtectedRoute role="admin">
                      <AlertTable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/productionreport"
                  element={
                    <ProtectedRoute role="admin">
                      <ProductionReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/productionchart"
                  element={
                    <ProtectedRoute role="admin">
                      <ProductionChart />
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/partrejecttable"
                  element={
                    <ProtectedRoute roles={["admin", "production", "operator"]}>
                      <PartRejectTable />
                    </ProtectedRoute>
                  }
                />

                {/* Reports */}
                <Route
                  path="/oeereport"
                  element={
                    <ProtectedRoute
                      roles={["admin", "production", "operator", "quality"]}
                    >
                      <OEEreport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/monitorings"
                  element={
                    <ProtectedRoute
                      roles={[
                        "admin",
                        "production",
                        "operator",
                        "maintenance",
                        "quality",
                      ]}
                    >
                      <Monitorings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/oeereport/edit-oee/:id"
                  element={
                    <ProtectedRoute
                      roles={["admin", "production", "operator", "quality"]}
                    >
                      <EditOeeForQuality />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/prodreport"
                  element={
                    <ProtectedRoute
                      roles={["admin", "production", "operator", "quality"]}
                    >
                      <ProductionCHartReport />
                    </ProtectedRoute>
                  }
                />
                {/* <Route
                  path="/prodreport"
                  element={
                    <ProtectedRoute
                      roles={["admin", "production", "operator", "quality"]}
                    >
                      <ProdChart />
                    </ProtectedRoute>
                  }
                /> */}
                <Route
                  path="/downtimereport"
                  element={
                    <ProtectedRoute
                      roles={["admin", "production", "operator", "quality"]}
                    >
                      <Downtimereport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/breakdownreport"
                  element={
                    <ProtectedRoute
                      roles={[
                        "admin",
                        "production",
                        "operator",
                        "maintenance",
                        "quality",
                      ]}
                    >
                      <BreakdownReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/editbd/:id"
                  element={
                    <ProtectedRoute
                      roles={[
                        "admin",
                        "production",
                        "operator",
                        "maintenance",
                        "quality",
                      ]}
                    >
                      <EditBreakdown />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/breakdownraise"
                  element={
                    <ProtectedRoute role="admin">
                      <BreakdownRaise />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/breakdowntime"
                  element={
                    <ProtectedRoute role="admin">
                      <Breakdowntime />
                    </ProtectedRoute>
                  }
                />
                {/* <Route
                  path="/toolreport"
                  element={
                    <ProtectedRoute
                      roles={[
                        "admin",
                        "production",
                        "operator",
                        "maintenance",
                        "quality",
                      ]}
                    >
                      <Toolreport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/toolmanagement"
                  element={
                    <ProtectedRoute role="admin">
                      <Toolmanagement />
                    </ProtectedRoute>
                  }
                /> */}
                {/* master pages */}
                <Route
                  path="/machine"
                  element={
                    <ProtectedRoute
                      roles={["admin", "production", "operator", "quality"]}
                    >
                      <MachineMaster />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/alldowntime"
                  element={
                    <ProtectedRoute
                      roles={["admin", "production", "operator", "quality"]}
                    >
                      <AllDowntime />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/machineform"
                  element={
                    <ProtectedRoute roles={["admin", "production"]}>
                      <ActiveMachine />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/machineform2"
                  element={
                    <ProtectedRoute roles={["admin", "production"]}>
                      <InactiveMachine />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/tool"
                  element={
                    <ProtectedRoute role="admin">
                      <AddTool />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/shift"
                  element={
                    <ProtectedRoute roles={["admin", "production"]}>
                      <Shift />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/skill"
                  element={
                    <ProtectedRoute role="admin">
                      <Skill />
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/Setups"
                  element={
                    <ProtectedRoute roles={["admin", "operator"]}>
                      <Setups />
                    </ProtectedRoute>
                  }
                />
                  <Route
                  path="/qualityapprove"
                  element={
                    <ProtectedRoute roles={["admin", "operator"]}>
                      <QualityApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/workforce"
                  element={
                    <ProtectedRoute role="admin">
                      <Workforce />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/reject"
                  element={
                    <ProtectedRoute
                      roles={[
                        "admin",
                        "production",
                        "operator",
                        "maintenance",
                        "quality",
                      ]}
                    >
                      <RejectedPartsTable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/parts"
                  element={
                    <ProtectedRoute role="admin">
                      <Parts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/addmaintenance"
                  element={
                    <ProtectedRoute
                      roles={[
                        "admin",
                        "production",
                        "operator",
                        "maintenance",
                        "quality",
                      ]}
                    >
                      <Addmaintenance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pmc"
                  element={
                    <ProtectedRoute role="admin">
                      <PmcParameter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/openbd"
                  element={
                    <ProtectedRoute role="admin">
                      <OpenBD />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/breakdownhistory"
                  element={
                    <ProtectedRoute role="admin">
                      <BreakdownHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bdhistory"
                  element={
                    <ProtectedRoute roles={["admin", "maintenance"]}>
                      <BDHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/diagnostic"
                  element={
                    <ProtectedRoute role="admin">
                      <Diagnostic />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/summary"
                  element={
                    <ProtectedRoute role="operator">
                      <SummaryOP />
                    </ProtectedRoute>
                  }
                />

                {/* operator only */}
                 <Route
                  path="/user/alarms"
                  element={
                    <ProtectedRoute roles={["admin", "operator"]}>
                      <Alarms />
                    </ProtectedRoute>
                  }
                />
                  <Route
                  path="/user/DownTime"
                  element={
                    <ProtectedRoute role="operator">
                      <DownTime />
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/GuageCalibration"
                  element={
                    <ProtectedRoute role="operator">
                      <GuageCalibration />
                    </ProtectedRoute>
                  }
                />
                 <Route
                  path="/MachineStartup"
                  element={
                    <ProtectedRoute role="operator">
                      <MachineStartup />
                    </ProtectedRoute>
                  }
                />

                <Route
                path="/user/MachineDocument"
                element={
                  <ProtectedRoute role="operator">
                    <MachineDocument />
                  </ProtectedRoute>
                }
              />

                 <Route
                  path="/ProcessOperation"
                  element={
                    <ProtectedRoute role="operator">
                      <ProcessOperation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/quality-check"
                  element={
                    <ProtectedRoute roles={["quality", "operator"]}>
                      <QualityCheck />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/raise-breakdown"
                  element={
                    <ProtectedRoute role="operator">
                      <RaiseBreakdown />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/rejection"
                  element={
                    <ProtectedRoute role="operator">
                      <Rejection />
                    </ProtectedRoute>
                  }
                />
                  <Route
                  path="/user/setup"
                  element={
                    <ProtectedRoute roles={["admin", "operator"]}>
                      <Setup />
                    </ProtectedRoute>
                  }
                />
                
                 <Route
                  path="/user/SetupApproval"
                  element={
                    <ProtectedRoute roles={["admin", "operator"]}>
                      <SetupApproval />
                    </ProtectedRoute>
                  }
                />
                 <Route
                path="/user"
                element={
                  <ProtectedRoute roles={["admin", "operator"]}>
                    <UserPage />
                  </ProtectedRoute>
                }
              />
                <Route
                  path="/WorkInstruction"
                  element={
                    <ProtectedRoute role="operator">
                      <WorkInstruction />
                    </ProtectedRoute>
                  }
                />


                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>

          {/* Footer */}
          <Footer />
        </div>
      )}
    </Router>
  );
};

export default App;
