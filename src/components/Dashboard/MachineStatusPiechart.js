import React from "react";
import axios from "axios";
import ReactECharts from "echarts-for-react";
import { useQuery } from "@tanstack/react-query";
import API_BASE_URL from "../config";

const fetchRuntimeData = async () => {
  const { data } = await axios.get(
      `${API_BASE_URL}/api/machine-status/bottleneckRuntimeDowntime/today`
  );
  return data;
};

const MachineRuntimePieChart = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["runtimeVsDowntime"],
    queryFn: fetchRuntimeData,
  });

  if (isLoading) return <div>Loading chart...</div>;
  if (error) return <div>Error loading data</div>;

  const { RunTime = 0, DownTime = 0 } = data;

  const option = {
    title: {
      text: "Machine Running vs Down Time",
      left: "center",
      top: 10,
      textStyle: {
        fontSize: 14,
        fontWeight: "semibold",
      },
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} mins ({d}%)",
    },
    legend: {
      orient: "horizontal", // horizontal layout
      bottom: 10, // position at bottom
      left: "center", // center align
      textStyle: {
        fontSize: 16,
      },
    },

    series: [
      {
        name: "Status",
        type: "pie",
        radius: "70%",
        data: [
          {
            value: RunTime,
            name: "Running Time",
            itemStyle: { color: "#00E6E6" },
          },
          {
            value: DownTime,
            name: "Downtime",
            itemStyle: { color: "#FF4D4D" },
          },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{d}%", // Only percentage
          fontSize: 14,
          fontWeight: "bold",
          color: "#fff",
        },
      },
    ],
  };

  return (
    <div className="  p-3 bg-white max-w-xl mx-auto">
      <ReactECharts
        option={option}
        style={{ height: "300px", width: "100%" }}
      />
    </div>
  );
};

export default MachineRuntimePieChart;
