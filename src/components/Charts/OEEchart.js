import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import moment from "moment";
import annotationPlugin from "chartjs-plugin-annotation";
import { Chart as ChartJS } from "chart.js";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://192.168.29.244:5003";


ChartJS.register(annotationPlugin);

const AvailabilityChart = () => {
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch OEE data from bottleneck/last7days API
        const response = await axios.get(`${API_BASE_URL}/api/oee-logs/bottleneck/last7days`);
        const oeeData = response.data;

        if (!oeeData || oeeData.length === 0) {
          console.warn("No OEE data received.");
          return;
        }

        // Simulate dates for last 7 entries (if API does not provide dates)
        const today = moment();
        const dataWithDates = oeeData.map((entry, index) => ({
          ...entry,
          date: today.clone().subtract(oeeData.length - 1 - index, "days").format("YYYY-MM-DD"),
        }));

        const grouped = {};
        dataWithDates.forEach((entry) => {
          const date = entry.date;
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(parseFloat(entry.OEE));
        });

        const processed = Object.entries(grouped).map(([date, values]) => {
          const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
          return { date, avg };
        });

        const sorted = processed.sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sorted.map((d) => moment(d.date).format("DD MMM"));
        const values = sorted.map((d) => parseFloat(d.avg.toFixed(2)));

        setLineChartData({
          labels,
          datasets: [
            {
              label: "Average OLE (%)",
              data: values,
              borderColor: "#0000b3",
              backgroundColor: "#d5f5e3",
              borderWidth: 3,
              fill: true,
              pointBackgroundColor: "#FF9800",
              tension: 0.4,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching OEE data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Line
      data={lineChartData}
      options={{
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          x: {
            ticks: { maxRotation: 0, minRotation: 0 },
          },
          y: {
            beginAtZero: true,
            max: 100,
          },
        },
        plugins: {
          legend: { position: "top" },
          annotation: {
            annotations: {
              line1: {
                type: "line",
                yMin: 100,
                yMax: 100,
                borderColor: "red",
                borderDash: [5, 5],
                borderWidth: 6,
                label: {
                  content: "100% Actual OLE",
                  enabled: true,
                  position: "end",
                  backgroundColor: "red",
                  color: "white",
                  font: {
                    size: 12,
                    weight: "bold",
                  },
                  padding: 6,
                },
              },
            },
          },
        },
      }}
      height={120}
    />
  );
};

export default AvailabilityChart;
