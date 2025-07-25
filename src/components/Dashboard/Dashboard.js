import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FaProductHunt, FaShieldAlt, FaChartArea } from "react-icons/fa";
import axios from "axios";
// import moment from "moment";
import { useNavigate } from "react-router-dom";
import ApexCharts from "react-apexcharts";
import MachineStatusPiechart from "./MachineStatusPiechart";
import "bootstrap/dist/css/bootstrap.min.css";
// import CycleTimeDeviationChart from "../Charts/Cycletimedeviation";
import AvailabilityChart from "../Charts/AvailabilityChart";
// import OEEChart from "../Charts/OEEchart";
import MachineOEEGauge from "../Charts/MachineOEEGauge";
// import API_BASE_URL from "../config";
import API_BASE_URL from "../config";

// Chart.js Registration (If Required)
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);
// const API_BASE_URL = "http://192.168.29.244:5003";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const Dashboard = () => {
  const [mttr, setMTTR] = useState(0);
  const [mtbf, setMTBF] = useState(0);
  const [productionData, setProductionData] = useState({
    currentmonthtotalpartsproduced: 0,
    lastmonthtotalpartsproduced: 0,
    currentdaytotalpartsproduced: 0,
    lastdaytotalpartsproduced: 0,
  });
  const [rejectedParts, setRejectedParts] = useState(0);
  // const machine_ids = ["CN52", "CN39", "CN40"];
  const [totalDowntime, setTotalDowntime] = useState(0);
  const navigate = useNavigate();
  const [shiftHours, setShiftHours] = useState(0);
  const [currentShift, setCurrentShift] = useState(null);
  const [lastdaytotalpartsproducedOEE, setlastdaytotalpartsproducedOEE] =
    useState(null);
  const [lastmonthtotalpartsproducedOEE, setlastmonthtotalpartsproducedOEE] =
    useState(null);
  const [todayOee, setTodayOEE] = useState(null);
  const [bottleneckMachines, setBottleneckMachines] = useState([]);
  const [oeeData, setOeeData] = useState({
    availability: 0,
    quality: 0,
    performance: 0,
    oee: 0,
  });
  const [uptime, setUptime] = useState(0);
  const [calculatedPlantTime, setPlantime] = useState(0);
  const [numberOfFailures, setNumberOfFailures] = useState(0);
  const [openBreakdownCount, setOpenBreakdownCount] = useState(0);
  const [totalMaintenanceHours, setTotalMaintenanceHours] = useState(0);

  const [chartTitle, setChartTitle] = useState("MTTR vs MTBF");

  const [chartData, setChartData] = useState({
    series: [],
    categories: [],
  });
  const [plannedQuantities, setPlannedQuantities] = useState({}); // Store PlannedQty
  const [machine_ids, setmachine_ids] = useState([]); // Dynamically fetched machine IDs

  const [machineData, setMachineData] = useState({});
  useEffect(() => {
    const fetchOEEData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/machine-average-data`
        );

        // Extract machineData directly (without shift filtering)
        const machineData = response.data.machineData || {};

        // Extract total metrics safely
        const {
          availability = 0,
          quality = 0,
          performance = 0,
          OEE = 0,
        } = machineData.averageMetrics || {};

        // Store machine data separately
        setMachineData(machineData);
        console.log("avgoee", machineData, oeeData);
        // Update OEE data state (normalized for GaugeChart)
        setOeeData({
          availability: parseFloat(availability) / 100,
          quality: parseFloat(quality) / 100,
          performance: parseFloat(performance) / 100,
          oee: parseFloat(OEE) / 100,
        });
      } catch (error) {
        console.error("Error fetching OEE data:", error);
      }
    };

    fetchOEEData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchOEEData, 30000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  // Format Date (YYYY-MM-DD)
  const formattedDate = now.toISOString().split("T")[0];
  // Format Time (HH:MM:SS)
  const formattedTime = now.toTimeString().split(" ")[0]; // Extracts only HH:MM:SS

   useEffect(() => {
    // Fetch data initially
    fetchMachineData();
    // Set interval to fetch data every 3 seconds
    const interval = setInterval(fetchMachineData, 30000);
    return () => clearInterval(interval);
  }, []);

  const [updatedTimestamps, setUpdatedTimestamps] = useState({});

  //new code to get prod count from oee
  const fetchMachineData = async () => {
    // console.log("🔁 fetchMachineData called");

    try {
      // Step 1: Fetch bottleneck machine IDs
      const bottleneckResponse = await axios.get(
        `${API_BASE_URL}/api/machines/machines/bottleneck-ids`
      );

      const fetchedmachine_ids = bottleneckResponse.data;

      if (
        !Array.isArray(fetchedmachine_ids) ||
        fetchedmachine_ids.length === 0
      ) {
        console.error("❌ No bottleneck machines found");
        return;
      }

      setmachine_ids(fetchedmachine_ids);

      // Step 2: Fetch latest OEE entry for each machine
      const latestOeeData = await Promise.all(
        fetchedmachine_ids.map(async (machine_id) => {
          try {
            const res = await axios.get(
              `${API_BASE_URL}/api/oee-logs/getlatestoeebymachineid/${machine_id}`
            );
            return { machine_id, data: res.data };
          } catch (err) {
            console.warn(`⚠️ No OEE data for ${machine_id}`, err.message);
            return { machine_id, data: null };
          }
        })
      );

      // Step 3: Extract data for chart
      const machineNames = [];
      const totalPartsProduced = [];
      const plannedQtyData = {};

      latestOeeData.forEach(({ machine_id, data }) => {
        const totalProduced = data?.TotalPartsProduced || 0;
        const plannedQty = data?.expectedPartCount || 0;

        machineNames.push(machine_id);
        totalPartsProduced.push(totalProduced);
        plannedQtyData[machine_id] = plannedQty;
      });

      setPlannedQuantities(plannedQtyData);
      console.log("prod", plannedQtyData);
      // Step 4: Update chart
      setChartData({
        series: [
          {
            name: "Total Parts Produced",
            data: totalPartsProduced,
          },
          {
            name: "Planned Quantity",
            data: fetchedmachine_ids.map((id) => plannedQtyData[id] || 0),
          },
        ],
        categories: machineNames,
      });

      console.log("✅ Chart Updated:", {
        machineNames,
        totalPartsProduced,
        plannedQtyData,
      });

      const updatedTimestamps = {};
      latestOeeData.forEach(({ machine_id, data }) => {
        if (data) {
          updatedTimestamps[machine_id] = new Date(
            data.updatedAt
          ).toLocaleString(); // format as readable
        } else {
          updatedTimestamps[machine_id] = "No data";
        }
      });
      setUpdatedTimestamps(updatedTimestamps); // useState object
    } catch (error) {
      console.error("❌ Error in fetchMachineData:", error);
    }
  };

  // Chart options
  const options = {
    chart: {
      type: "bar",
      //   height: 350,
    },
    plotOptions: {
      bar: {
        horizontal: true, // Ensures vertical bar chart
        // columnWidth: "50%", // Adjusts the width of the bars
        endingShape: "rounded", // Makes bars have rounded edges
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toFixed(0), // Show integer values
      style: {
        // fontSize: "12px",
        colors: ["#333"], // Ensure label visibility
      },
    },
    xaxis: {
      categories: chartData.categories,
    },
    yaxis: {
      title: {
        // Optional title for y-axis
      },
    },
    legend: {
      position: "top",
      labels: {
        font: {
          size: 10, // Readable legend size
        },
      },
    },
    colors: ["#009CD1", "#20AF24"], // Set colors for different series
  };

  /* mttr and mtbf using breakdown */
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/breakdown
        `
        );
        let maintenanceRecords = response.data;

        if (!maintenanceRecords.length) {
          setMTTR(0);
          setMTBF(0);
          setOpenBreakdownCount(0);
          setTotalMaintenanceHours(0);
          setUptime(0);
          return;
        }

        // Filter breakdowns for the current month
        const currentmonthtotalpartsproduced = new Date().getMonth(); // Get current month (0-11)
        const currentYear = new Date().getFullYear();

        maintenanceRecords = maintenanceRecords.filter((record) => {
          const recordDate = new Date(record.breakdown_start);
          return (
            recordDate.getMonth() === currentmonthtotalpartsproduced &&
            recordDate.getFullYear() === currentYear
          );
        });

        if (!maintenanceRecords.length) {
          // console.warn("No breakdown data found for the current month.");
          setMTTR(0);
          setMTBF(0);
          setOpenBreakdownCount(0);
          setTotalMaintenanceHours(0);

          // Still calculate uptime based on available shift time
          const currentDate = new Date().getDate();
          const shiftTime = 8.5; // Each shift is 8.5 hours
          setPlantime(shiftTime * currentDate); // Considering 3 machines
          setUptime(shiftTime * currentDate); // Assuming full uptime when no breakdowns exist
          return;
        }

        // Filter for open breakdowns
        const openBreakdowns = maintenanceRecords.filter(
          (record) => record.status === "open"
        );
        setOpenBreakdownCount(openBreakdowns.length); // Count open breakdowns

        // Sort breakdowns by breakdownEndDateTime for correct uptime calculation
        maintenanceRecords.sort(
          (a, b) => new Date(a.breakdown_end) - new Date(b.breakdown_end)
        );

        let totalDowntime = 0; // in minutes
        let failureCount = 0;

        maintenanceRecords.forEach((record, index) => {
          const downtimeStart = record.breakdown_start
            ? new Date(record.breakdown_start)
            : null;
          const downtimeEnd = record.breakdown_end
            ? new Date(record.breakdown_end)
            : null;

          // Validate dates
          if (
            downtimeStart &&
            downtimeEnd &&
            !isNaN(downtimeStart) &&
            !isNaN(downtimeEnd)
          ) {
            const downtimeDuration =
              (downtimeEnd - downtimeStart) / (1000 * 60); // Convert to minutes
            totalDowntime += downtimeDuration;
            failureCount++; // Count valid failures
          } else {
            console.warn(`Invalid breakdown dates for record ${index}`, {
              downtimeStart,
              downtimeEnd,
            });
          }
        });

        // Get current date in the month
        const currentDate = new Date().getDate();

        // Calculate Plant Time (total available time in hours)
        const shiftTime = 8.5; // Each shift is 8.5 hours
        const calculatedPlantTime = shiftTime * currentDate; // Considering 3 machines

        // Convert totalDowntime (minutes) to hours
        const lossTime = totalDowntime / 60;

        // Calculate Uptime
        const calculatedUptime = calculatedPlantTime - lossTime;

        // Calculate MTTR (Mean Time To Repair) in hours
        const calculatedMTTR = failureCount
          ? totalDowntime / failureCount / 60
          : 0;

        // Calculate MTBF (Mean Time Between Failures) in hours
        const calculatedMTBF =
          failureCount > 1 ? calculatedUptime / (failureCount - 1) : 0;

        // Set state values
        setTotalMaintenanceHours(lossTime);
        setPlantime(calculatedPlantTime);
        setNumberOfFailures(failureCount);
        setUptime(calculatedUptime);
        setMTTR(calculatedMTTR);
        setMTBF(calculatedMTBF);
      } catch (error) {
        console.error("Error fetching maintenance data:", error);
      }
    };

    fetchMaintenanceData();

    // Set interval to fetch data every 30 seconds
    const interval = setInterval(fetchMaintenanceData, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNavigation = () => {
    navigate("/newdash"); // Update this path as needed
  };
  const handleNavigationole = () => {
    navigate("/ole"); // Update this path as needed
  };

  const [machineId, setMachineId] = useState('');

// ✅ Step 1: Fetch bottleneck machine ID only once
useEffect(() => {
  const fetchBottleneckMachine = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/machines/machines/bottleneck-ids`);
      const bottlenecks = response.data;

      if (Array.isArray(bottlenecks) && bottlenecks.length > 0) {
        setMachineId(bottlenecks[0]); // use first bottleneck machine
      } else {
        console.warn("No bottleneck machine found");
      }
    } catch (error) {
      console.error("Error fetching bottleneck machines:", error);
    }
  };

  fetchBottleneckMachine();
}, []);

  //first prod card
useEffect(() => {
  if (!machineId) return; // wait for bottleneck ID

  const fetchProductionData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/oee-logs/currentlasttoday/${machineId}`
      );
      if (response.data) {
        setProductionData(response.data);
        console.log("production", response.data);
      }
    } catch (error) {
      console.error("Error fetching production data:", error);
    }
  };

  fetchProductionData();
  const interval = setInterval(fetchProductionData, 30000);

  return () => clearInterval(interval);
}, [machineId]); // ✅ runs when machineId is ready
 const {
    currentmonthtotalpartsproduced,
    lastmonthtotalpartsproduced,
    currentdaytotalpartsproduced,
    lastdaytotalpartsproduced,
  } = productionData;
  // const { data, error, isLoading } = useSWR(
  //   // `${API_BASE_URL}/api/oeelog/getlastcurrntmonthlastdaytotalpartsproduced`,
  //   `${API_BASE_URL}/api/oee-logs/currentlasttoday/34`,
  //   fetcher,
  //   {
  //     refreshInterval: 60000, // Optional: auto-refresh every 10 sec
  //   }
  // );

  // console.log("This is plannedQuantities", plannedQuantities);

  // if (isLoading) return <div>Loading OEE data...</div>;
  // if (error) return <div>Error fetching OEE data.</div>;

 

  return (
    <div
      className="container-fluid bg-light "
      style={{
        fontFamily: "Montserrat, sans-serif",
        marginTop: window.innerWidth >= 768 ? "3.8rem" : "5rem",
      }}
    >
      {/* {Object.values(plannedQuantities)[0] === 0 ? (
        <center>
          <h2
            style={{
              color: "red",
              fontWeight: "bold",
              backgroundColor: "black",
              animation: "blinker 2s linear infinite",
            }}
          >
            No Active Production
          </h2>
          <style>
            {`
        @keyframes blinker {
          50% { opacity: 0; }
        }
      `}
          </style>
        </center>
      ) : (
        ""
      )} */}
      <div className="row">
        {/* First Card */}
        <div className="col-lg-4 col-md-6 mb-1" style={{ paddingRight: "0px" }}>
          <div className="card  border  rounded-4 h-100">
            <div className="card-body p-3">
              {/* Header Section */}
              <div className="d-flex align-items-center mb-3">
                <div
                  className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                  style={{ width: "50px", height: "50px", color: "salmon" }}
                >
                  <FaProductHunt className="fs-3" />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold text-danger">PRODUCTION</h5>
                  <small className="text-muted">Live Overview</small>
                </div>
                <div className="ms-auto text-end">
                  <h4 className="mb-0 fw-bold text-dark">
                    {currentdaytotalpartsproduced}
                  </h4>
                  <small className="text-muted">Today</small>
                </div>
              </div>

              <hr className="opacity-25" />

              {/* Stats Section */}
              <div className="row">
                <div className="col-6">
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">Today</p>
                    <h6 className="mb-0 fw-bold text-success">
                      {currentdaytotalpartsproduced}
                    </h6>
                    {/* <h6 className="mb-0 fw-bold text-success">123456</h6> */}
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">Current Month</p>
                    {/* <h6 className="mb-0 fw-bold text-success">123456</h6> */}
                    <h6 className="mb-0 fw-bold text-primary">
                      {currentmonthtotalpartsproduced}
                    </h6>
                  </div>
                </div>

                <div className="col-6">
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">Last Day</p>
                    {/* <h6 className="mb-0 fw-bold text-success">123456</h6> */}
                    <h6 className="mb-0 fw-bold text-success">
                      {lastdaytotalpartsproduced}
                    </h6>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">Last Month</p>
                    {/* <h6 className="mb-0 fw-bold text-success">123456</h6> */}
                    <h6 className="mb-0 fw-bold text-primary">
                      {lastmonthtotalpartsproduced}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 col-md-6 mb-1" style={{ paddingRight: "0px" }}>
          <div className="card border  rounded-4 h-100">
            <div className="card-body p-3">
              {/* Header Section */}
              <div className="d-flex align-items-center mb-1">
                <div
                  className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                  style={{ width: "50px", height: "50px", color: "lightgreen" }}
                >
                  <FaChartArea className="fs-3" />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold text-success">OLE</h5>
                  <small className="text-muted">Overall Line Efficiency</small>
                </div>
                <div className="ms-auto text-end">
                  <h4 className="mb-0 fw-bold text-dark">
                    {todayOee ? `${todayOee.OEE}%` : "N/A"}
                  </h4>
                  <small className="text-muted">Today</small>
                </div>
              </div>

              <hr className="opacity-25" />

              {/* Stats Section */}
              <div className="row">
                <div className="col-6">
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">Availability</p>
                    <h6 className="mb-0 fw-bold text-primary">
                      {(oeeData.availability * 100).toFixed(2)}%
                    </h6>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">Quality</p>
                    <h6 className="mb-0 fw-bold text-warning">
                      {(oeeData.quality * 100).toFixed(2)}%
                    </h6>
                  </div>
                </div>

                <div className="col-6">
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">Performance</p>
                    <h6 className="mb-0 fw-bold text-success">
                      {(oeeData.performance * 100).toFixed(2)}%
                    </h6>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">Last Month</p>
                    <h6 className="mb-0 fw-bold text-danger">
                      {lastmonthtotalpartsproducedOEE
                        ? `${lastmonthtotalpartsproducedOEE.OEE}%`
                        : "N/A"}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Card */}
        <div className="col-lg-4 col-md-6 mb-1">
          <div className="card border  rounded-4 h-100">
            <div className="card-body p-3">
              {/* Header Section */}
              <div className="d-flex align-items-center mb-3">
                <div
                  className="me-3 d-flex align-items-center justify-content-center rounded-circle bg-light"
                  style={{ width: "50px", height: "50px", color: "skyblue" }}
                >
                  <FaShieldAlt className="fs-3" />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold text-primary">MAINTENANCE</h5>
                  <small className="text-muted">Monthly Overview</small>
                </div>
                <div className="ms-auto text-end">
                  <h4 className="mb-0 fw-bold text-dark">{numberOfFailures}</h4>
                  <small className="text-muted">Failures</small>
                </div>
              </div>

              <hr className="opacity-25" />

              {/* Stats Section */}
              <div className="row">
                <div className="col-6">
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">Uptime (hrs)</p>
                    <h6 className="mb-0 fw-bold text-success">
                      {uptime.toFixed(2)}
                    </h6>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">MTTR</p>
                    <h6 className="mb-0 fw-bold text-warning">
                      {mttr.toFixed(2)}
                    </h6>
                  </div>
                </div>

                <div className="col-6">
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">LossTime (hrs)</p>
                    <h6 className="mb-0 fw-bold text-danger">
                      {totalMaintenanceHours.toFixed(2)}
                    </h6>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <p className="mb-0 text-muted">MTBF</p>
                    <h6 className="mb-0 fw-bold text-primary">
                      {mtbf.toFixed(2)}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid mt-2">
        <div className="row justify-content-center">
          {/* First Column (6) - Contains Two Cards */}
          <div className="col-lg-6 col-sm-12">
            <div className="row">
              <div
                className="col-lg-6 col-sm-12"
                style={{ paddingRight: "0px" }}
              >
                <div
                  className=" d-flex card border rounded-4"
                  style={{ minHeight: "300px" }}
                >
                  {/* <div className="d-flex justify-content-end align-items-end"> */}
                  {/* <h6 className="fw-bold text-success m-0">
                    Line Production Summary
                  </h6> */}
                  <div
                    className="btn fw-bold shadow-sm"
                    style={{ color: "red", fontSize: "14px" }}
                    onClick={handleNavigation}
                  >
                    View More
                  </div>
                  {/* </div> */}
                  <div className="card-body mb-1 d-flex justify-content-center align-items-center">
                    {/* <p className="fs-5 text-muted">Card 1 (Inside Col-6)</p> */}
                    <ApexCharts
                      options={options}
                      series={chartData.series}
                      type="bar"
                      height={280}
                    />
                  </div>
                  {/* <div className="ms-1">
                    <span>Updated Time: </span>
                    {machine_ids.map((id, index) => (
                      <span key={id}>
                        {updatedTimestamps[id] || "Loading..."}
                        {index < machine_ids.length - 1 && " | "}
                      </span>
                    ))}
                  </div> */}
                </div>
              </div>

              <div
                className="col-lg-6 col-sm-12"
                style={{ paddingRight: "0px" }}
              >
                <div
                  className="card border  mb-1 rounded-4"
                  style={{ minHeight: "300px" }}
                >
                  {" "}
                  {/* Added Card with Border */}
                  <div className="card-body">
                    <MachineStatusPiechart />
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <div
                  className="card border  mb-1 rounded-4"
                  style={{ minHeight: "150px" }}
                >
                  <div className="card-body d-flex justify-content-center align-items-center">
                    {/* <p className="fs-5 text-muted">Card 1 (Inside Col-6)</p> */}
                    <MachineOEEGauge />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Column (6) - One Full Width Card */}
          <div className="col-lg-6">
            <div
              className="card border  mb-2 rounded-4"
              style={{ minHeight: "100px" }}
            >
              {/* <div className="d-flex justify-content-end align-items-end"> */}
              <div
                className="btn fw-bold shadow-sm  "
                style={{ color: "red", fontSize: "14px" }}
                onClick={handleNavigationole}
              >
                View More
              </div>
              <div
              className="card border  mb- rounded-4"
              style={{ minHeight: "100px" }}
            >
              {/* <div className="card-body d-flex justify-content-center align-items-center"> */}
                {/* <p className="fs-5 fw-bold">Card 3 (Inside Col-12 of Col-6)</p> */}
                <AvailabilityChart />
              {/* </div> */}
            </div>
              {/* <div className="card-body d-flex justify-content-center align-items-center">
                <OEEChart />
              </div> */}
            </div>
           
            {/* <div
              className="card border  mb-2 rounded-4"
              style={{ minHeight: "100px" }}
            >
              <div className="card-body d-flex justify-content-center align-items-center">
                <CycleTimeDeviationChart />
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
