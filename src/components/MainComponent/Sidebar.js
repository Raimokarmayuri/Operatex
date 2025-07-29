import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BiSolidDashboard } from "react-icons/bi";
import { HiAdjustments } from "react-icons/hi";
import { FaTools } from "react-icons/fa";
import { GrGraphQl, GrCheckboxSelected, GrAddCircle } from "react-icons/gr";
import { MdReport, MdSettings } from "react-icons/md";
import logo from "../Admin/Images/user.png";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaTable, FaChartPie, FaSignOutAlt } from "react-icons/fa";
import { PiCopyBold } from "react-icons/pi";
import { SlCalender } from "react-icons/sl";
import { LiaWpforms } from "react-icons/lia";
import { useAuth } from "../../context/AuthContext";
import {
  BellFill,
  PeopleFill,
  GearFill,
  BarChartFill,
  ShieldLockFill,
  BoxArrowRight,
} from "react-bootstrap-icons"; // New Bootstrap Icons

const Sidebar = ({ collapsed, toggleSidebar, isOpen, isMobileView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState(null); // Ensure only one section is open at a time
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { user, logout } = useAuth();

  // const toggleSection = (section) => {
  //   setExpandedSection((prevSection) =>
  //     prevSection === section ? null : section
  //   ); // Close if already open, else open new
  // };

  const toggleSection = (section) => {
    setExpandedSection((prevSection) =>
      prevSection === section ? null : section
    ); // Close if already open, else open new
  };
  // console.log(user.role)
  const categories = [
    user?.role === "admin" && {
      title: "Dashboard",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      path: "/admin/dashboard", // ✅ direct path, no items
      section: "dash",
    },
    user?.role === "admin" && {
      title: "Production",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      section: "prod_mgmt",
      items: [
       
        {
          icon: <GrGraphQl />,
          text: "Production Monitoring",
          path: "/partchart",
        },
        {
          icon: <FaTools />,
          text: "Downtime Analysis",
          path: "/downtimereport",
        },
      ],
    },
    user?.role === "admin" && {
      title: "Machine Diagnostics",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      section: "machine_diag",
      items: [
        {
          icon: <PiCopyBold />,
          text: "Diagnostics Parameter",
          path: "/monitorings",
        },
  
        // { icon: <GrGraphQl />, text: "Tool Monitoring", path: "/toolreport" },
        { icon: <FaTools />, text: "PM Alerts", path: "/pmalert" },
  
     
      ],
    },
    user?.role === "admin" && {
      title: "OEE Montitoring",
      icon: <MdReport style={{ fontSize: "1.2rem" }} />,
      section: "oee_monitor",
      items: [
        {
          icon: <GrCheckboxSelected size={18} className="text-primary" />,
          text: "OEE RealTime",
          path: "/oeereport",
        },
        {
          icon: <GrCheckboxSelected size={18} className="text-danger" />,
          text: "Trend Analysis",
          path: "/loss",
        },
        {
          icon: <FaTools size={18} className="text-info" />,
          text: "Loss Identification",
          path: "/prodsummary",
        },
        // { icon: <FaTools size={18} className="text-success" />, text: "Breakdown Report", path: "/breakdownreport" },
      ],
    },
    user?.role === "admin" && {
      title: "TPM Report",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      section: "tpm_report",
      items: [
        {
          icon: <PiCopyBold />,
          text: "MTTR & MTBF Analysis",
          path: "/bdhistory",
        },
        // { icon: <GrGraphQl />, text: "Tool Monitoring", path: "/partchart" },
        // { icon: <FaTools />, text: "PM Alerts", path: "/downtimereport" },
      ],
    },

    user?.role === "admin" && {
      title: "All Pages ",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      section: "alerts",
      items: [
        // { icon: <PiCopyBold />, text: "Alarms", path: "/alerttable" },
        // { icon: <FaTools />, text: "Tool Alerts", path: "/toolalert" },
        { icon: <GrGraphQl />, text: "PMC Alerts", path: "/pmcalert" },
        {
          icon: <PiCopyBold />,
          text: "PMC Alerts History",
          path: "/pmchistory",
        },
         {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Downtime",
          path: "/alldowntime",
        },
         {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Maintenance",
          path: "/addmaintenance",
        },
         {
          icon: <FaTable size={18} className="text-primary" />,
          text: " PMC Parameter",
          path: "/pmc",
        },
         {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "setup History ",
          path: "/Setuphistory",
        },
        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Setup Approval",
          path: "/setups",
        },
        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Quality Approval",
          path: "/qualityapprove",
        },
         {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Breakdown History",
          path: "/breakdownhistory",
        },
                // { icon: <HiAdjustments size={18} className="text-primary" />, text: "Rejected Parts", path: "/reject" },

        // {
        //   icon: <GrCheckboxSelected size={18} className="text-primary" />,
        //   text: "OEE RealTime",
        //   path: "/oeereport",
        // },
        //  {
        //   icon: <GrCheckboxSelected size={18} className="text-primary" />,
        //   text: "Production Report",
        //   path: "/prodreport",
        // },
           ],
    },
    user?.role === "admin" && {
      title: "Reports",
      icon: <MdReport style={{ fontSize: "1.2rem" }} />,
      section: "reports",
      items: [
        {
          icon: <GrCheckboxSelected size={18} className="text-primary" />,
          text: "Production Report",
          path: "/prodreport",
        },
        // {
        //   icon: <HiAdjustments size={18} className="text-primary" />,
        //   text: "Rejected Parts",
        //   path: "/reject",
        // },
        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Downtime Report",
          path: "/alldowntime",
        },

        { icon: <GrCheckboxSelected size={18} className="text-danger" />, text: "Part Reject Report", path: "/partrejecttable" },
        // { icon: <FaTools size={18} className="text-info" />, text: "Downtime Report", path: "/downtimereport" },
        {
          icon: <FaTools size={18} className="text-success" />,
          text: "Breakdown Report",
          path: "/breakdownreport",
        },
      ],
    },

    user?.role === "admin" && {
      title: "Masters",
      icon: <MdSettings style={{ fontSize: "1.2rem" }} />,
      section: "masters",
      items: [
       
         {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Line",
          path: "/line",
        },
        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Machine",
          path: "/machine",
        },
          {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Part",
          path: "/parts",
        },
         {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Process",
          path: "/process",
        },
        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Setup",
          path: "/setup",
        },
        
        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Shift",
          path: "/shift",
        },
        //  {
        //   icon: <HiAdjustments size={18} className="text-primary" />,
        //   text: "User",
        //   path: "/workforce",
        // },
        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Skill",
          path: "/skill",
        },
        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Tool",
          path: "/tool",
        },
         
        
        // {
        //   icon: <HiAdjustments size={18} className="text-primary" />,
        //   text: "Pending Breakdown",
        //   path: "/openbd",
        // },
        // {
        //   icon: <HiAdjustments size={18} className="text-primary" />,
        //   text: "Breakdown History",
        //   path: "/breakdownhistory",
        // },
        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Workforce",
          path: "/workforce",
        },
      

        {
          icon: <HiAdjustments size={18} className="text-primary" />,
          text: "Maintenance",
          path: "/addmaintenance",
        },
       
        // {
        //   icon: <FaTable size={18} className="text-danger" />,
        //   text: "Diagnostic Threshold",
        //   path: "/diagnostic",
        // },
      ],
    },

    // PRODUCTION ROLE

    user?.role === "production" && {
      title: "Dashboard",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      path: "/newdash", // ✅ direct path, no items
      section: "dash",
    },

    user?.role === "production" && {
      title: "Production Planning",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      section: "planning",
      items: [
        // {
        //   icon: <PiCopyBold />,
        //   text: "Production Schedules",
        //   path: "/productionplan",
        // },
        { icon: <GrGraphQl />, text: "Shifts", path: "/shift" },
      ],
    },
    user?.role === "production" && {
      title: "Production Monitoring",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      section: "moitoring",
      items: [
        {
          icon: <GrGraphQl />,
          text: "Production Monitoring",
          path: "/partchart",
        },
        { icon: <PiCopyBold />, text: "Production Cycle", path: "/prodreport" },
        {
          icon: <GrGraphQl />,
          text: "Identify & Resolve Bottlenecks",
          path: "/machine",
        },
      ],
    },
    user?.role === "production" && {
      title: "Downtime Analysis",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      section: "downtime",
      items: [
        {
          icon: <PiCopyBold />,
          text: "Downtime Report",
          path: "/downtimereport",
        },
      ],
    },
    user?.role === "production" && {
      title: "Reporting & Shift Analytics",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      section: "report",
      items: [
        {
          icon: <PiCopyBold />,
          text: "Production Report",
          path: "/prodsummary",
        },
        { icon: <GrGraphQl />, text: "Track OEE", path: "/loss" },
      ],
    },

    //OPERATOR ROLE
    
    user?.role === "operator" && {
      title: "User Dashboard",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      path: "/user", // ✅ direct path, no items
      section: "dash",
    },

        user?.role === "quality" && {
      title: "Dashboard",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      path: "/user/quality-check", // ✅ direct path, no items
      section: "dash",
    },

    // MAINTENANCE ROLE

    user?.role === "maintenance" && {
      title: "Dashboard",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      path: "/newdash", // ✅ direct path, no items
      section: "dash",
    },

    user?.role === "maintenance" && {
      title: "Maintenance Task",
      icon: <BiSolidDashboard style={{ fontSize: "1.2rem" }} />,
      // path: "/newdash", // ✅ direct path, no items
      section: "prod_mgmt",
      items: [
        // { icon: <PiCopyBold />, text: "Machine Status", path: "/newdash" },
        { icon: <GrGraphQl />, text: "PM Tasks", path: "/pmalert" },
        {
          icon: <PiCopyBold />,
          text: "View Maintenance",
          path: "/addmaintenance",
        },
      ],
    },

    user?.role === "maintenance" && {
      title: "Reports",
      icon: <MdReport style={{ fontSize: "1.2rem" }} />,
      section: "reports",
      items: [
        // { icon: <GrCheckboxSelected size={18} className="text-primary" />, text: "Production Report", path: "/loss" },
        // { icon: <GrCheckboxSelected size={18} className="text-danger" />, text: "OEE Report", path: "/OEEReport" },
        // { icon: <FaTools size={18} className="text-info" />, text: "Downtime Report", path: "/downtimereport" },
        {
          icon: <FaTools size={18} className="text-success" />,
          text: "Breakdown Report",
          path: "/breakdownreport",
        },
      ],
    },
  ].filter(Boolean); // Remove null values from the array

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile(); // Check immediately
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);


//   if (user?.role === "operator" && location.pathname === "/UserPage") {
//   return null;
// }

  if (isMobile && collapsed) {
    return (
      <div
        className="d-flex justify-content-start p-1 align-items-center border pt-5 fixed-top bg-transparent"
        style={{
          height: "7rem",
          width: "100%",
          zIndex: 1030,
          transition: "all 0.3s ease",
          left: 0,
        }}
      >
        <img
          src={logo}
          alt="User"
          className="rounded-circle"
          style={{
            width: "30px",
            height: "30px",
            cursor: "pointer",
            position: "fixed",
            transition: "right 0.3s ease",
            transform: isOpen ? "translateX(260px)" : "translateX(0)",
          }}
          onClick={toggleSidebar}
        />
      </div>
    );
  }

  return (
    <div
      className={`position-fixed d-flex flex-column bg-light shadow-sm ${
        isMobileView && collapsed ? "d-none" : ""
      }`}
      style={{
        width: collapsed ? "80px" : "260px",
        // fontFamily: "'Segoe UI', sans-serif",
        height: "calc(100vh - 70px)",
        marginTop: "50px",
        left: 0,
        transition: "width 0.3s ease",
        zIndex: 1040,
        borderRight: "1px solid #dee2e6",
        overflowY: "auto",
      }}
    >
      {/* Sidebar Header */}
      <div className="d-flex justify-content-end align-items-center p-3 border-bottom">
        <img
          src={logo}
          alt="User"
          className="rounded-circle"
          style={{ width: "30px", height: "30px", cursor: "pointer" }}
          onClick={toggleSidebar}
        />
      </div>

      {/* Sidebar Body */}
      <div className="flex-grow-1">
        {categories.map((category, categoryIndex) => (
          <div key={categoryIndex} className="px-2">
            {/* Section Header */}
            {/* If direct link (like Dashboard) */}
            {category.path ? (
              <div key={categoryIndex} className="px-2">
                <button
                  className={`w-100 text-start px-3 py-2 my-1 rounded d-flex align-items-center border-0 ${
                    location.pathname === category.path
                      ? "text-white"
                      : "text-dark"
                  }`}
                  style={{
                    background:
                      location.pathname === category.path
                        ? "#012169"
                        : "transparent",
                    color:
                      location.pathname === category.path ? "#fff" : "#333",
                    fontSize: "0.9rem",
                    transition: "background 0.2s ease",
                  }}
                  onClick={() => {
                    navigate(category.path);
                    if (isMobileView) toggleSidebar();
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== category.path)
                      e.currentTarget.style.background = "#f0f4f8";
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== category.path)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span
                    className={`me-3 ${collapsed ? "w-100 text-center" : ""}`}
                  >
                    {category.icon}
                  </span>
                  {!collapsed && <span>{category.title}</span>}
                </button>
              </div>
            ) : (
              <div key={categoryIndex} className="px-2">
                {/* Section Header with dropdown */}
                <div
                  className="d-flex justify-content-between align-items-center px-3 py-2 mt-2 rounded"
                  style={{
                    background: "#f1f3f5",
                    color: "#002B5B",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                  }}
                  onClick={() => toggleSection(category.section)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#e0e6ec")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#f1f3f5")
                  }
                >
                  <div className="d-flex align-items-center">
                    <span className="me-2">{category.icon}</span>
                    {!collapsed && <span>{category.title}</span>}
                  </div>
                  {!collapsed && category.section && (
                    <i
                      className={`bi ${
                        expandedSection === category.section
                          ? "bi-chevron-up"
                          : "bi-chevron-down"
                      }`}
                    ></i>
                  )}
                </div>
              </div>
            )}

            {/* Dropdown Items */}
            <div
              style={{
                maxHeight:
                  expandedSection === category.section ? "500px" : "0px",
                overflow: "hidden",
                transition: "max-height 0.4s ease",
              }}
            >
              {expandedSection === category.section &&
                category.items.map((item, itemIndex) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <div key={itemIndex} className="px-2">
                      <button
                        className={`w-100 text-start px-3 py-2 my-1 rounded d-flex align-items-center border-0 ${
                          isActive ? "text-white" : "text-dark"
                        }`}
                        style={{
                          background: isActive ? "#012169" : "transparent",
                          color: isActive ? "#fff" : "#333",
                          fontSize: "0.9rem",
                          transition: "background 0.2s ease",
                        }}
                        onClick={() => {
                          navigate(item.path);
                          if (isMobileView) toggleSidebar();
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background = "#f0f4f8";
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span
                          className={`me-3 ${
                            collapsed ? "w-100 text-center" : ""
                          }`}
                        >
                          {item.icon}
                        </span>
                        {!collapsed && <span>{item.text}</span>}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Button */}
      {user && (
        <div className="p-3 border-top mt-auto">
          <button
            className="btn d-flex align-items-center w-100 justify-content-center justify-content-md-start gap-2"
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                logout();
              }
            }}
            style={{
              backgroundColor: "#dc3545",
              color: "#ffffff",
              borderRadius: "8px",
              padding: "10px 15px",
              fontSize: "0.95rem",
              border: "none",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#c82333")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#dc3545")
            }
          >
            <i
              className="bi bi-box-arrow-right"
              style={{ fontSize: "1rem" }}
            ></i>
            {!collapsed && (
              <span>
                <center>Logout</center>
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

// import React, { useState,useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";
// import { BiSolidDashboard } from "react-icons/bi";
// import { HiAdjustments } from "react-icons/hi";
// import { FaTools } from "react-icons/fa";
// import { GrGraphQl, GrCheckboxSelected, GrAddCircle } from "react-icons/gr";
// import { MdReport, MdSettings } from "react-icons/md";
// import logo from "../components/Admin/Images/user.png";
// import { useNavigate, useLocation } from "react-router-dom";
// import { FaHome, FaTable, FaChartPie, FaSignOutAlt } from "react-icons/fa";
// import { PiCopyBold } from "react-icons/pi";
// import { SlCalender } from "react-icons/sl";
// import { LiaWpforms } from "react-icons/lia";
// import { useAuth } from "../context/AuthContext";
//  import{ BellFill, PeopleFill, GearFill, BarChartFill, ShieldLockFill, BoxArrowRight
// } from "react-bootstrap-icons"; // New Bootstrap Icons

// const Sidebar = ({ collapsed, toggleSidebar, isOpen, isMobileView }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [expandedSection, setExpandedSection] = useState(null); // Ensure only one section is open at a time
//   const [hoveredIndex, setHoveredIndex] = useState(null);
// const { user, logout } = useAuth();

//   const toggleSection = (section) => {
//     setExpandedSection((prevSection) => (prevSection === section ? null : section)); // Close if already open, else open new
//   };
// // console.log(user.role)
//   const categories = [
//     user?.role === "admin" && {
//       title: "Dashboard",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "dash",
//       items: [
//         { icon: <FaHome size={18} className="text-primary" />, text: "Dashboard", path: "/admin/dashboard" },
//         // { icon: <GrGraphQl size={18} className="text-warning" />, text: "Cell Summary", path: "/partchart" },
//         // { icon: <PiCopyBold size={18} className="text-info" />, text: "Production Plan", path: "/productionplan" },
//       ],
//     },
//     user?.role === "admin" && {
//       title: "Production",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "prod_mgmt",
//       items: [
//         { icon: <PiCopyBold />, text: "Production Plan", path: "/productionplan" },
//         { icon: <GrGraphQl />, text: "Production Monitoring", path: "/partchart" },
//         { icon: <FaTools />, text: "Downtime Analysis", path: "/downtimereport" },
//       ],
//     },
//     user?.role === "admin" && {
//       title: "Machine Diagnostics",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "machine_diag",
//       items: [
//         { icon: <PiCopyBold />, text: "Diagnostics Parameter", path: "/monitorings" },
//         { icon: <GrGraphQl />, text: "Tool Monitoring", path: "/toolreport" },
//         { icon: <FaTools />, text: "PM Alerts", path: "/pmalert" },
//       ],
//     },
//     user?.role === "admin" && {
//       title: "OEE Montitoring",
//       icon: <MdReport style={{ fontSize: "1.2rem" }} />,
//       section: "oee_monitor",
//       items: [
//         { icon: <GrCheckboxSelected size={18} className="text-primary" />, text: "OEE RealTime", path: "/oeereport" },
//         { icon: <GrCheckboxSelected size={18} className="text-danger" />, text: "Trend Analysis", path: "/loss" },
//         { icon: <FaTools size={18} className="text-info" />, text: "Loss Identification", path: "/prodsummary" },
//         // { icon: <FaTools size={18} className="text-success" />, text: "Breakdown Report", path: "/breakdownreport" },
//       ],
//     },
//     user?.role ===  "admin" && {
//       title: "TPM Report",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "tpm_report",
//       items: [
//         { icon: <PiCopyBold />, text: "MTTR & MTBF Analysis", path: "/bdhistory" },
//         // { icon: <GrGraphQl />, text: "Tool Monitoring", path: "/partchart" },
//         // { icon: <FaTools />, text: "PM Alerts", path: "/downtimereport" },
//       ],
//     },

//     user?.role === "admin" && {
//       title: "Alerts & Notifications",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "alerts",
//       items: [
//         { icon: <PiCopyBold />, text: "Alarms", path: "/alerttable" },
//         { icon: <GrGraphQl />, text: "PMC Alerts", path: "/pmcalert" },
//         { icon: <FaTools />, text: "Tool Alerts", path: "/toolalert" },
//       ],
//     },
//     user?.role === "admin" && {
//       title: "Reports",
//       icon: <MdReport style={{ fontSize: "1.2rem" }} />,
//       section: "reports",
//       items: [
//         { icon: <GrCheckboxSelected size={18} className="text-primary" />, text: "Production Report", path: "/prodreport" },
//         // { icon: <GrCheckboxSelected size={18} className="text-danger" />, text: "OEE Report", path: "/OEEReport" },
//         // { icon: <FaTools size={18} className="text-info" />, text: "Downtime Report", path: "/downtimereport" },
//         { icon: <FaTools size={18} className="text-success" />, text: "Breakdown Report", path: "/breakdownreport" },
//       ],
//     },

//     user?.role === "admin" && {
//       title: "Masters",
//       icon: <MdSettings style={{ fontSize: "1.2rem" }} />,
//       section: "masters",
//       items: [
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Machine", path: "/machine" },
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Shift", path: "/shift" },
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Skill", path: "/skill" },
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Tool", path: "/tool" },
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Breakdown Raise", path: "/breakdownraise" },
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Pending Breakdown", path: "/openbd" },
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Breakdown History", path: "/breakdownhistory" },
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Workforce", path: "/workforce" },
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Parts", path: "/parts" },
//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Rejected Parts", path: "/reject" },

//         { icon: <HiAdjustments size={18} className="text-primary" />, text: "Maintenance", path: "/addmaintenance" },
//         { icon: <FaTable size={18} className="text-primary" />, text: "Add PMC Parameter", path: "/pmc" },
//         { icon: <FaTable size={18} className="text-danger" />, text: "Diagnostic Threshold", path: "/diagnostic" },
//       ],
//     },

//     // PRODUCTION ROLE
//     user?.role === "production" && {
//       title: "Dashboard",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "prod_mgmt",
//       items: [
//         { icon: <PiCopyBold />, text: "Machine Status", path: "/newdash" },
//         { icon: <GrGraphQl />, text: "Production Monitoring", path: "/partchart" },
//         { icon: <FaTools />, text: "Downtime Reasons", path: "/downtime" },
//       ],
//     },
//     user?.role === "production" && {
//       title: "Production Planning",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "planning",
//       items: [
//         { icon: <PiCopyBold />, text: "Production Schedules", path: "/productionplan" },
//         { icon: <GrGraphQl />, text: "Shifts", path: "/shift" },
//       ],
//     },
//     user?.role === "production" && {
//       title: "Production Monitoring",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "moitoring",
//       items: [
//         { icon: <PiCopyBold />, text: "Production Cycle", path: "/prodreport" },
//         { icon: <GrGraphQl />, text: "Identify & Resolve Bottlenecks", path: "/machine" },
//       ],
//     },
//     user?.role === "production" && {
//       title: "Downtime Analysis",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "downtime",
//       items: [
//         { icon: <PiCopyBold />, text: "Downtime Report", path: "/downtimereport" },
//       ],
//     },
//     user?.role === "production" && {
//       title: "Reporting & Shift Analytics",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "report",
//       items: [
//         { icon: <PiCopyBold />, text: "Production Report", path: "/prodsummary" },
//         { icon: <GrGraphQl />, text: "Track OEE", path: "/loss" },
//       ],
//     },

// //OPERATOR ROLE
//     user?.role === "operator" && {
//       title: "Dashboard",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "prod_mgmt",
//       items: [
//         { icon: <PiCopyBold />, text: "Machine Status", path: "/newdash" },
//         { icon: <GrGraphQl />, text: "Production Progress", path: "/partchart" },
//         // { icon: <FaTools />, text: "Downtime Reasons", path: "/downtime" },
//       ],
//     },

//     user?.role === "operator" && {
//       title: "Production Execution",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "prod",
//       items: [
//         { icon: <PiCopyBold />, text: "Downtimes", path: "/downtime" },
//         { icon: <FaTools />, text: "Production Details", path: "/productionplan" },
//       ],
//     },

//     user?.role === "operator" && {
//       title: "Tool Life Monitoring",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "machine_diag",
//       items: [
//         { icon: <PiCopyBold />, text: "Diagnostics Parameter", path: "/monitorings" },
//         { icon: <GrGraphQl />, text: "Track Tool Usage", path: "/toolreport" },
//         // { icon: <FaTools />, text: "PM Alerts", path: "/pmalert" },
//       ],
//     },
//     user?.role === "operator" && {
//       title: "Quality",
//       icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//       section: "quality",
//       items: [
//         { icon: <PiCopyBold />, text: "Rejected Parts", path: "/reject" },

//         { icon: <GrGraphQl />, text: "OEE Report", path: "/oeereport" },

//       ],
//     },

// // MAINTENANCE ROLE

// user?.role === "maintenance" && {
//   title: "Dashboard",
//   icon: <BiSolidDashboard  style={{ fontSize: "1.2rem" }} />,
//   section: "prod_mgmt",
//   items: [
//     { icon: <PiCopyBold />, text: "Machine Status", path: "/newdash" },
//     { icon: <GrGraphQl />, text: "PM Tasks", path: "/pmalert" },
//     { icon: <PiCopyBold />, text: "View Maintenance", path: "/addmaintenance" },

//   ],
// },

//     user?.role === "maintenance" && {
//       title: "Reports",
//       icon: <MdReport style={{ fontSize: "1.2rem" }} />,
//       section: "reports",
//       items: [

//         { icon: <FaTools size={18} className="text-success" />, text: "Breakdown Report", path: "/breakdownreport" },
//       ],
//     },

//   ].filter(Boolean); // Remove null values from the array

//   const [isMobile, setIsMobile] = useState(false);

//   useEffect(() => {
//     const checkIfMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };

//     checkIfMobile(); // Check immediately
//     window.addEventListener('resize', checkIfMobile);
//     return () => window.removeEventListener('resize', checkIfMobile);
//   }, []);

//   if (isMobile && collapsed) {
//     return (
//       <div className="d-flex justify-content-start p-1 align-items-center border pt-5 fixed-top bg-white"
//         style={{
//           height: '7rem',
//           width: '100%',
//           zIndex: 1030,
//           transition: 'all 0.3s ease',
//           left: 0
//         }}
//       >
//         <img
//           src={logo}
//           alt="User"
//           className="rounded-circle"
//           style={{
//             width: "30px",
//             height: "30px",
//             cursor: "pointer",
//             position: 'fixed',
//             transition: 'right 0.3s ease',
//             transform: isOpen ? 'translateX(260px)' : 'translateX(0)'
//           }}
//           onClick={toggleSidebar}
//         />
//       </div>
//     );
//   }

//   return (

//   <div
//   className={`position-fixed d-flex flex-column bg-light shadow-sm`}
//   // className={`position-fixed d-flex flex-column bg-light shadow-sm ${isMobileView && collapsed ? "d-none" : ""}`}
//   style={{
//     width: collapsed ? "80px" : "260px",
//     height: "calc(100vh - 70px)",
//     marginTop: "50px",
//     left: 0,
//     transition: "width 0.5s ease",
//     zIndex: 1040,
//     borderRight: "1px solid #dee2e6",
//     overflowY: "auto",
//   }}
// >
//   {/* Sidebar Header */}
//   <div className="d-flex justify-content-end align-items-center p-3 border-bottom">
//     <img
//       src={logo}
//       alt="User"
//       className="rounded-circle"
//       style={{ width: "30px", height: "30px", cursor: "pointer" }}
//       onClick={toggleSidebar}
//     />
//   </div>

//   {/* Sidebar Body */}

//   <div className="flex-grow-1">
//     {categories.map((category, categoryIndex) => (
//       <div key={categoryIndex} className="px-2">
//         {/* Section Header */}
//         <div
//           className="d-flex justify-content-between align-items-center px-3 py-2 mt-2 rounded"
//           style={{
//             background: "#f1f3f5",
//             color: "#002B5B",
//             fontWeight: 600,
//             cursor: "pointer",
//             transition: "background 0.3s ease",
//           }}
//           onClick={() => toggleSection(category.section)}
//           onMouseEnter={(e) => (e.currentTarget.style.background = "#e0e6ec")}
//           onMouseLeave={(e) => (e.currentTarget.style.background = "#f1f3f5")}
//         >
//           <div className="d-flex align-items-center">
//             <span className="me-2">{category.icon}</span>
//             {!collapsed && <span>{category.title}</span>}
//           </div>
//           {!collapsed && category.section && (
//             <i
//               className={`bi ${
//                 expandedSection === category.section
//                   ? "bi-chevron-up"
//                   : "bi-chevron-down"
//               }`}
//             ></i>
//           )}
//         </div>

//         {/* Dropdown Items */}
//         <div
//           style={{
//             maxHeight: expandedSection === category.section ? "500px" : "0px",
//             overflow: "hidden",
//             transition: "max-height 0.4s ease",

//           }}
//         >
//           {expandedSection === category.section &&
//             category.items.map((item, itemIndex) => {
//               const isActive = location.pathname === item.path;
//               return (
//                 <div key={itemIndex} className="px-2">
//                   <button
//                     className={`w-100 text-start px-3 py-2 my-1 rounded d-flex align-items-center border-0 ${
//                       isActive ? "text-white" : "text-dark"
//                     }`}
//                     style={{
//                       background: isActive ? "#012169" : "transparent",
//                       color: isActive ? "#fff" : "#333",
//                       fontSize: "0.9rem",
//                       transition: "background 0.2s ease",
//                     }}
//                     onClick={() => {
//                       navigate(item.path);
//                       if (isMobileView) toggleSidebar();
//                     }}
//                     onMouseEnter={(e) => {
//                       if (!isActive) e.currentTarget.style.background = "#f0f4f8";
//                     }}
//                     onMouseLeave={(e) => {
//                       if (!isActive) e.currentTarget.style.background = "transparent";
//                     }}
//                   >
//                     <span className={`me-3 ${collapsed ? "w-100 text-center" : ""}`}>
//                       {item.icon}
//                     </span>
//                     {!collapsed && <span>{item.text}</span>}
//                   </button>
//                 </div>
//               );
//             })}
//         </div>
//       </div>
//     ))}
//   </div>

//   {/* Logout Button */}
//   {user && (
//     <div className="p-3 border-top mt-auto">
//       <button
//         className="btn d-flex align-items-center w-100 justify-content-center justify-content-md-start gap-2"
//         onClick={() => {
//                       if (window.confirm("Are you sure you want to logout?")) {
//                         logout();
//                       }
//                     }}
//         style={{
//           backgroundColor: "#dc3545",
//           color: "#ffffff",
//           borderRadius: "8px",
//           padding: "10px 15px",
//           fontSize: "0.95rem",
//           border: "none",
//           transition: "background 0.3s ease",
//         }}
//         onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c82333")}
//         onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
//       >
//         <i className="bi bi-box-arrow-right" style={{ fontSize: "1rem" }}></i>
//         {!collapsed && <span><center>Logout</center></span>}
//       </button>
//     </div>
//   )}
// </div>

//   );
// };

// export default Sidebar;
