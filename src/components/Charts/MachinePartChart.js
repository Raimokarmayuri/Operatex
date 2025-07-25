import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import { useQuery } from '@tanstack/react-query';
import MachineStatusTimeline from './MachineStatusTimeline';
import API_BASE_URL from "../config";
const API_URL = `${API_BASE_URL}/api/downtimes`;


const fetchProductionData = async (shift) => {
  const res = await axios.get(`${API_BASE_URL}/api/oee-logs/runningtotalvsecpected?shift=${shift}`);
  return res.data || [];
};


const ProductionSummary = () => {
  const [shift, setShift] = useState(1);
const [activeMachines, setActiveMachines] = useState([]); // Store all active machines
const [chartData, setChartData] = useState({
  series: [],
  options: {
    xaxis: {
      categories: [],
    },
  },
});

useEffect(() => {
  const fetchMachineData = async () => {
    try {
      // Fetch today's OEE data
      const chartResponse = await axios.get(`${API_URL}/api/oeelog/oee-today`);
      const chartData = chartResponse.data;

      // Filter data by activeTab (shiftNumber)
      const filteredData = chartData.filter(item => item.shiftNumber);

      // Extract x-axis categories and series data
      const machineIds = filteredData.map((item) => item.machine_Id);
      const totalParts = filteredData.map((item) => item.TotalPartsProduced);
      const plannedQty = filteredData.map((item) => item.expectedPartCount);

      setChartData((prevData) => ({
        ...prevData,
        series: [
          {
            name: "Total Parts Produced",
            data: totalParts,
          },
          {
            name: "Planned Quantity",
            data: plannedQty,
          },
        ],
        options: {
          ...prevData.options,
          xaxis: {
            ...prevData.options.xaxis,
            categories: machineIds,
          },
        },
      }));

      // Fetch all machines and filter active ones
      const machinesResponse = await axios.get(`${API_URL}/api/machines/getallmachine`);
      const machinesData = machinesResponse.data || [];
      const activeMachines = machinesData.filter(machine => machine.status === "ACTIVE");
      setActiveMachines(activeMachines);
    } catch (error) {
      console.error("Error fetching OEE or machine data:", error);
    }
  };

  // if (activeTab) {
  //   fetchMachineData();
  // }
}, []);

  const { data = [], isLoading } = useQuery({
    queryKey: ['production-summary', shift],
    queryFn: () => fetchProductionData(shift),
    keepPreviousData: true,
  });

  const availableShifts = [...new Set(data.map((d) => d.shift_no))].sort((a, b) => a - b);

  const option = {
    title: {
      // text: `P10-H CNC Monitoring`,
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#003870ff',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['Total Parts Produced', 'Planned Quantity'],
      bottom: 0,
    },
    grid: {
      top: 60,
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.machine_name_type),
      axisLabel: {
        fontSize: 14,
        rotate: 0,
        margin: 15,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Parts Count',
      axisLabel: {
        fontSize: 14,
      },
    },
    series: [
      {
        name: 'Total Parts Produced',
        type: 'bar',
        data: data.map((d) => d.TotalPartsProduced),
        itemStyle: { color: '#0072ff' },
        label: {
          show: true,
          position: 'inside',
          fontWeight: 'bold',
        },
        barGap: 0,
      },
      {
        name: 'Planned Quantity',
        type: 'bar',
        data: data.map((d) => d.expectedPartCount),
        itemStyle: { color: '#ff9f40' },
        label: {
          show: true,
          position: 'inside',
          fontWeight: 'bold',
        },
      },
    ],
  };

  return (
    <>
    <div style={{marginTop:"1rem", padding: '20px', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      {/* Shift buttons aligned right */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {availableShifts.map((s) => (
            <button
              key={s}
              onClick={() => setShift(s)}
              style={{
                padding: '10px 20px',
                borderRadius: 6,
                border: shift === s ? '2px solid #003870' : '1px solid #aaa',
                backgroundColor: shift === s ? '#003870' : '#f0f0f0',
                color: shift === s ? '#fff' : '#333',
                fontWeight: shift === s ? 'bold' : 'normal',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Shift {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <p style={{ textAlign: 'center', color: '#888' }}>Loading chart...</p>
      ) : (
        <ReactECharts option={option} style={{ height: 450, width: '100%' }} />
      )}
    </div>
     {activeMachines.length > 0 ? (
        activeMachines.map((machine) => (
          <MachineStatusTimeline
            key={machine.machine_id}
            machineId={machine.machine_id}
          />
        ))
      ) : (
        <p>No active machines available.</p>
      )}
      </>
  );
};

export default ProductionSummary;
