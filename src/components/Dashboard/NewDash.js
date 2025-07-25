import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdOutlinePendingActions, MdDashboard } from "react-icons/md";
import { BsFillCassetteFill } from "react-icons/bs";
import { FaTools } from "react-icons/fa";
import MachineCard from "../Admin/MachineCards";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://192.168.29.244:5003";

const organizationId = "ORG001";

const fetchMachines = () =>
  axios.get(`${API_BASE_URL}/api/machines/getallmachine`).then(res => res.data);

const fetchActiveCount = () =>
  axios.get(`${API_BASE_URL}/api/machines/active-count`).then(res => res.data.count);

const fetchInactiveCount = () =>
  axios.get(`${API_BASE_URL}/api/machines/inactive-count`).then(res => res.data.count);

const fetchBreakdownCount = () =>
  axios.get(`${API_BASE_URL}/api/breakdowns/count`).then(res => res.data.count);

const fetchProductionData = () =>
  axios.get(`${API_BASE_URL}/api/machine-data/${organizationId}/allprocurrentDay1`).then(res => res.data);

const fetchOeeLogStats = () =>
  axios.get(`${API_BASE_URL}/api/oee-logs/currentlasttoday/34`).then(res => res.data);



const Dashboard = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("active");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { data: machines = [] } = useQuery({
    queryKey: ['machines'],
    queryFn: fetchMachines,
    refetchInterval: 10000,
  });

  const { data: onlineCount = 0 } = useQuery({
    queryKey: ['activeCount'],
    queryFn: fetchActiveCount,
    refetchInterval: 10000,
  });

  const { data: offlineCount = 0 } = useQuery({
    queryKey: ['inactiveCount'],
    queryFn: fetchInactiveCount,
    refetchInterval: 10000,
  });

  const { data: breakdownCount = 0 } = useQuery({
    queryKey: ['breakdownCount'],
    queryFn: fetchBreakdownCount,
    refetchInterval: 10000,
  });

  const { data: productionData = [] } = useQuery({
    queryKey: ['productionData'],
    queryFn: fetchProductionData,
    refetchInterval: 10000,
  });

  const { data: oeeStats = {} } = useQuery({
    queryKey: ['oeeStats'],
    queryFn: fetchOeeLogStats,
    refetchInterval: 10000,
  });

  const totalPartsProduced = productionData.reduce((sum, machine) => {
    return sum + ["Shift1", "Shift2"].reduce((shiftSum, shift) => {
      return shiftSum + (machine.latestProductionData?.[shift]?.TotalPartsProduced || 0);
    }, 0);
  }, 0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const filteredMachines = machines.filter((machine) => {
  //   if (filter === "active") return machine.status === "ACTIVE";
  //   if (filter === "inactive") return machine.status !== "ACTIVE";
  //   return true;
  // });

  const [runningMachines, setRunningMachines] = useState([]);


// useEffect(() => {
//   const fetchRunningMachines = async () => {
//     try {
//       const res = await fetch (`${API_BASE_URL}/api/withoutmidrunningstatus`);
//       const data = await res.json();

//       // Extract unique machine_ids that are running
//       const uniquemachine_ids = [...new Set(
//         data
//           .filter(item => item.Status === "Running")
//           .map(item => item.machine_id)
//       )];

//       setRunningMachines(uniquemachine_ids);
//     } catch (err) {
//       console.error("Error fetching running machines:", err);
//     }
//   };

//   fetchRunningMachines();
//   const interval = setInterval(fetchRunningMachines, 100000);
//   return () => clearInterval(interval);
// }, []);


const filteredMachines = machines.filter((machine) => {
  const status = machine.status?.toUpperCase();  // Normalize casing
  const isActive = status === "Active" || status === "ACTIVE";

  switch (filter) {
    case "active":
      return isActive;
    case "inactive":
      return !isActive;
    case "all":
    default:
      return true;
  }
});



// Filter machines based on the selected filter
// const filteredMachines = machines.filter((machine) => {
//   const isActive = machine.status === "ACTIVE";
//   const hasRunningPlan = runningMachines.includes(machine.machine_id);

//   switch (filter) {
//     case "active":
//       return isActive;
//     case "inactive":
//       return !isActive;
//     case "activeRunning":
//       return isActive && hasRunningPlan;
//     default: // 'all'
//       return true;
//   }
// });

  const handleCardClick = (path) => navigate(path);

  const cards = [
    {
      label: "Total Parts",
      count: oeeStats.currentDay || 0,
      icon: <MdDashboard style={{ width: 25, height: 25, fill: "#4a90e2" }} />,
      onClick: () => handleCardClick("/partchart"),
    },
    {
      label: "Online Assets",
      count: onlineCount,
      icon: <BsFillCassetteFill style={{ width: 25, height: 25, fill: "green" }} />,
      onClick: () => handleCardClick("/machineform"),
    },
    {
      label: "Offline Assets",
      count: offlineCount,
      icon: <MdOutlinePendingActions style={{ width: 25, height: 25, fill: "red" }} />,
      onClick: () => handleCardClick("/machineform2"),
    },
    {
      label: "Breakdowns",
      count: breakdownCount,
      icon: <FaTools style={{ width: 25, height: 25, fill: "#9b59b6" }} />,
      onClick: () => handleCardClick("/breakdowntable"),
    },
  ];

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "10px",
    height: "5.5rem",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const cardContentStyle = {
    display: "flex",
    alignItems: "center",
    height: "50%",
    padding: "10px",
  };

  const iconContainerStyle = {
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
    width: "40%",
    borderRadius: "7px",
    height: "5rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  };

  const textContainerStyle = {
    textAlign: "left",
    marginLeft: "20px",
    marginTop : "1rem",
    width: "90%",
  };

  const labelStyle = {
    color: "#034694",
    fontSize: "1.3rem",
    fontWeight: "bold",
  };

  const countStyle = {
    color: "#034694",
    fontSize: "1.5rem",
    marginTop: 0,
  };

  return (
    <Container fluid style={{ padding: "10px", marginTop: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
      <Row className="text-center mt-5">
        {cards.map((card, index) => (
          <Col xs={12} sm={4} md={3} key={index} className="mb-3">
            <div
              className="card shadow-sm mx-auto dashboard-card"
              style={cardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onClick={card.onClick}
            >
              <div className="card-content" style={cardContentStyle}>
                <div className="icon-container" style={iconContainerStyle}>{card.icon}</div>
                <div className="text-container" style={textContainerStyle}>
                  <div className="label"><span style={labelStyle}>{card.label}</span></div>
                  <h2 className="count" style={countStyle}>{card.count}</h2>
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="mb-3">
        <Col xs={12} className="text-start d-flex flex-wrap gap-2">
          {[
            { label: "All", value: "all", variant: "primary" },
            { label: "Active", value: "active", variant: "success" },
            { label: "Inactive", value: "inactive", variant: "danger" },
          ].map((btn, i) => (
            <Button
              key={i}
              variant={filter === btn.value ? btn.variant : `outline-${btn.variant}`}
              onClick={() => setFilter(btn.value)}
              style={{
                borderRadius: "10px",
                padding: "10px 20px",
                fontWeight: 500,
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              {btn.label}
            </Button>
          ))}
        </Col>
      </Row>

      <Row className="gy-3 gx-3">
{filteredMachines.map((machine) => {
  const status = machine.status?.toUpperCase();
const isActiveMachine = machine.status?.toUpperCase() === "ACTIVE" || status === "Active";
  return (
    <Col key={machine.machine_id} xs={12} md={4} lg={3}>
      {/* <MachineCard
        id={machine.machine_id}
        title={machine.machine_id}
        status={machine.status}
        statusColor={machine.status === "Active" || "ACTIVE" ? "#2dc653" : "red"}
        bgColor={machine.status ===  "Active" || "ACTIVE" ? "#90ee90" : "#f08080"}
      /> */}
      <MachineCard
        id={machine.machine_id}
        title={machine.machine_id}
        status={machine.status}
        statusColor={isActiveMachine ? "#2dc653" : "red"}
        bgColor={isActiveMachine ? "#90ee90" : "#f08080"}
      />
    </Col>
  );
})}

        
      </Row>

      <ToastContainer position="top-right" autoClose={5000} closeOnClick pauseOnHover draggable />
    </Container>
  );
};

export default Dashboard;
