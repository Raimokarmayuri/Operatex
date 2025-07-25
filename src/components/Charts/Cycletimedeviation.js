

import React, { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import moment from "moment";
import useSWR from "swr";
import axios from "axios";
import API_BASE_URL from "../config";

// SWR fetcher function
const fetcher = (url) => axios.get(url).then((res) => res.data);

const CycleTimeDeviationChart = () => {
  const [colorMap, setColorMap] = useState({});

  // Fetch bottleneck machine IDs
  const { data: machineIds, error: machineIdsError } = useSWR(
    `${API_BASE_URL}/api/machines/machines/bottleneck-ids`,
    fetcher
  );

  // Fetch last 7 days' production data (only after machine IDs are fetched)
  const { data: productionData, error: productionError } = useSWR(
    machineIds ? `${API_BASE_URL}/api/machine-data/ORG001/last7days` : null,
    fetcher
  );

  // Generate and cache colors per machineId
  const getColor = (machineId, opacity = 1) => {
    if (colorMap[machineId]) {
      const { r, g, b } = colorMap[machineId];
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    const newColor = generateRandomColor();
    setColorMap((prev) => ({
      ...prev,
      [machineId]: newColor,
    }));
    return `rgba(${newColor.r}, ${newColor.g}, ${newColor.b}, ${opacity})`;
  };

  const generateRandomColor = () => {
    return {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    };
  };

  // Memoized chart data
  const lineChartData = useMemo(() => {
    if (!machineIds || !productionData) return { labels: [], datasets: [] };

    const filteredMachines = productionData.filter((machine) =>
      machineIds.includes(machine.machineId)
    );

    const labelsSet = new Set();
    const datasets = [];

    filteredMachines.forEach((machine) => {
      const { machineId, last7DaysProduction } = machine;

      if (last7DaysProduction && last7DaysProduction.length > 0) {
        const sortedData = last7DaysProduction
          .filter((day) => day.latestData && day.latestData.CycleTime)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        const machineLabels = sortedData.map((day) =>
          moment(day.date).format("DD MMM")
        );
        const cycleTimes = sortedData.map((day) =>
          parseFloat(day.latestData.CycleTime)
        );

        machineLabels.forEach((label) => labelsSet.add(label));

        datasets.push({
          label: `Cycle Time - ${machineId}`,
          data: cycleTimes,
          borderColor: getColor(machineId),
          borderWidth: 2,
          fill: false,
          pointBackgroundColor: getColor(machineId),
          tension: 0.4,
        });
      }
    });

    // Add reference line for standard cycle time (140s)
    const allLabels = Array.from(labelsSet).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    const standardCycleTime = Array(allLabels.length).fill(140);

    datasets.unshift({
      label: "Standard Cycle Time (140s)",
      data: standardCycleTime,
      borderColor: "#FF0000",
      borderWidth: 2,
      borderDash: [10, 5],
      fill: false,
      pointRadius: 0,
    });

    return { labels: allLabels, datasets };
  }, [machineIds, productionData, colorMap]);

  if (machineIdsError || productionError) {
    return <div>Error loading chart data.</div>;
  }

  if (!machineIds || !productionData) {
    return <div>Loading...</div>;
  }

  return (
    <Line
      data={lineChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          x: {
            ticks: {
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false,
              align: "center",
            },
          },
          y: {
            beginAtZero: false,
          },
        },
        plugins: {
          legend: {
            position: "top",
          },
        },
      }}
      height={125}
    />
  );
};

export default CycleTimeDeviationChart;
