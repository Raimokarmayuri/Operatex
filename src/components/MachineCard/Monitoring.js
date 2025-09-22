import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import { useQueries } from "@tanstack/react-query";
import Files from "../Machine/Files";
import API_BASE_URL from "../config";
import Parameter from "../Charts/Parameter";
import { Container, Row, Col, Button } from "react-bootstrap";

const parameterMap = {
  Encoder: ["Encoder1", "Encoder2", "Encoder3", "Encoder4"],
  SpindleSpeed: ["SpindleSpeed"],
  ServoLoad: ["ServoLoad1", "ServoLoad2", "ServoLoad3", "ServoLoad4"],
  ServoTemp: ["ServoTemp1", "ServoTemp2", "ServoTemp3", "ServoTemp4"],
};

const MonitoringChart = () => {
  const [activeComponent, setActiveComponent] = useState("monitoring");

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/machines/getallmachine`).then((res) => {
      localStorage.setItem("allMachines", JSON.stringify(res.data));
    });
  }, []);

  // const machine_id = localStorage.getItem("selectedmachine_id");
  const machine_id = localStorage.getItem("selectedmachine_id");
  const machine_name_type = localStorage.getItem("selectedMachineName");

  useEffect(() => {
    console.log("Selected Machine ID:", machine_id);
    console.log("Selected Machine Name:", machine_name_type);
  }, []);

  const [parameter, setParameter] = useState("Encoder");
  const [days, setDays] = useState(7);

  const subParameters = parameterMap[parameter];

  const queries = useQueries({
    queries: subParameters.map((sub) => ({
      queryKey: ["monitoring", sub, days],
      queryFn: async () => {
        const res = await axios.get(
          `http://192.168.29.244:5003/api/monitoring/${machine_name_type}?days=${days}&parameter=${sub}`
        );
        return res.data;
      },
    })),
  });

  const chartsData = subParameters.reduce((acc, sub, idx) => {
    acc[sub] = queries[idx].data || [];
    return acc;
  }, {});

  const loadingParams = subParameters.filter(
    (_, idx) => queries[idx].isLoading
  );

  const renderChart = (subParam, data) => {
    const option = {
      title: {
        text: subParam,
        left: "center",
        top: 10,
        textStyle: { fontSize: 16 },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(50,50,50,0.85)",
        textStyle: { color: "#fff" },
      },
      xAxis: {
        type: "category",
        data: data.map((d) => d.bucket),
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          formatter: (val) => {
            const date = new Date(val);
            const hour = date.getHours();
            const minute = date.getMinutes();
            if (hour === 0 && minute === 0) {
              return date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              });
            }
            return "";
          },
        },
        axisPointer: { type: "line", snap: true },
      },
      yAxis: {
        type: "value",
        name: "Value",
        nameTextStyle: { fontSize: 12 },
      },
      dataZoom: [
        { type: "inside", start: 80, end: 100 },
        { type: "slider", start: 80, end: 100 },
      ],
      series: [
        {
          name: "Avg",
          type: "line",
          data: data.map((d) => parseFloat(d.avg_value)),
          smooth: true,
          lineStyle: { color: "#007bff" }, // blue
          areaStyle: { color: "rgba(66, 135, 245, 0.2)" },
          symbol: "circle",
        },
        {
          name: "Min",
          type: "line",
          data: data.map((d) => parseFloat(d.min_value)),
          smooth: true,
          lineStyle: { type: "dashed", color: "#CC9900" }, // yellow
          symbol: "none",
        },
        {
          name: "Max",
          type: "line",
          data: data.map((d) => parseFloat(d.max_value)),
          smooth: true,
          lineStyle: { type: "dashed", color: "#dc3545" }, // red
          symbol: "none",
        },
      ],
    };

    return (
      <ReactECharts
        option={option}
        style={{ height: 400, width: "100%" }}
        notMerge={true}
        lazyUpdate={true}
      />
    );
  };

  return (
    <div style={{ padding: "20px", marginTop: "2rem" }}>
      <Files />
      Machine : {machine_name_type || "N/A"}
        <Col xs="auto" className="d-flex justify-content-end flex-wrap gap-3">

      <Button
        variant="link"
        className="text-dark fw-bold px-3 py-1"
        style={{
          fontSize: "16px",
          textDecoration: "none",
        }}
        onClick={() => setActiveComponent("pmc")}
      >
        PMC Parameters
      </Button>
</Col>
      {activeComponent === "pmc" && (
        <div
          style={{
            // backgroundColor: "#e9ecef",
            padding: "15px",
            marginTop: "15px",
            borderRadius: "5px",
          }}
        >
          <Parameter machineId={machine_id} />
        </div>
      )}
      
      
       {activeComponent === "monitoring" && (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "20px",
          gap: "15px",
          fontSize: "16px",
        }}
      >
        <label>
          Parameter:{" "}
          <select
            value={parameter}
            onChange={(e) => setParameter(e.target.value)}
            style={{ fontSize: "16px", padding: "5px" }}
          >
            {Object.keys(parameterMap).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label>
          Days:{" "}
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            style={{ fontSize: "16px", padding: "5px" }}
          >
            <option value={1}>1 Day</option>
            <option value={7}>7 Days</option>
            <option value={15}>15 Days</option>
            <option value={30}>30 Days</option>
          </select>
        </label>
      </div>
       )}
        {activeComponent === "monitoring" && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "space-between",
          }}
        >
          {subParameters.map((sub) => (
            <div
              key={sub}
              style={{
                flex: "0 0 48%",
                border: "1px solid #ccc",
                borderRadius: 10,
                padding: 10,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                minHeight: 440,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff",
              }}
            >
              {chartsData[sub] && chartsData[sub].length > 0 ? (
                renderChart(sub, chartsData[sub])
              ) : loadingParams.includes(sub) ? (
                <p style={{ fontSize: "14px", color: "#888" }}>
                  Loading {sub}...
                </p>
              ) : (
                <p style={{ fontSize: "14px", color: "#888" }}>
                  No data for {sub}
                </p>
              )}
            </div>
          ))}
        </div>
        )}
      
    </div>
  );
};

export default MonitoringChart;
