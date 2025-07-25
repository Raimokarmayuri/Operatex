import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import ReactECharts from "echarts-for-react";
import API_BASE_URL from "../config";

const machine_id = localStorage.getItem("selectedmachine_id");

// Replace with actual machine ID or make dynamic if needed
const API_URL = `${API_BASE_URL}/api/production/getHourlyCount/${machine_id}`;
console.log("machine", machine_id);
const formatTimeRange = (from, to) => {
  const start = new Date(from).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const end = new Date(to).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${start} - ${end}`;
};

const HourlyCustomRangeChart = () => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["hourly-custom-range"],
    queryFn: async () => {
      const res = await axios.get(API_URL);
      return res.data.sort((a, b) => new Date(a.from) - new Date(b.from)); // sort by start time ascending
    },
  });

  const xAxisLabels = data.map((d) => formatTimeRange(d.from, d.to));
  const yAxisValues = data.map((d) => d.produced);

  const option = {
    title: {
      text: "Time Range Production Chart",
      left: "center",
      top: 10,
      textStyle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#003870",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
    },
    grid: {
      top: 80,
      left: "5%",
      right: "5%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: xAxisLabels,
      name: "Time Range (Hourly)",
      nameLocation: "center",
      nameGap: 40,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: "bold",
        padding: [10, 0, 0, 0],
      },
      axisLabel: {
        fontSize: 13,
        rotate: 0,
        margin: 12,
      },
    },
    yAxis: {
      type: "value",
      name: "Produced Parts",
      nameLocation: "middle",
      nameGap: 40,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: "bold",
        padding: [0, 0, 0, 0],
      },
      axisLabel: {
        fontSize: 13,
      },
    },
    series: [
      {
        name: "Parts Produced",
        type: "bar",
        barWidth: "50%",
        data: yAxisValues,
        itemStyle: {
          color: "#3b82f6",
        },
        label: {
          show: true,
          position: "inside",
          fontWeight: "bold",
        },
      },
    ],
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "20px",
        borderRadius: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginTop: "20px",
      }}
    >
      Machine ID: {machine_id || "Not selected"}
      {isLoading ? (
        <p className="text-center text-gray-500">Loading production data...</p>
      ) : (
        <ReactECharts option={option} style={{ height: 520, width: "100%" }} />
      )}
    </div>
  );
};

export default HourlyCustomRangeChart;
