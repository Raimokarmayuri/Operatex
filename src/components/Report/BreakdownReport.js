// BreakdownDrilldownChart.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import BreakdownTable from "../Masters/BreakdownRaise";
import API_BASE_URL from "../config";

const BreakdownDrilldownChart = () => {
  const [rawData, setRawData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [title, setTitle] = useState('Breakdown Hours by Month');
  const [stack, setStack] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}api/breakdown`);
      setRawData(res.data);
      const monthData = groupByMonth(res.data);
      setChartData(monthData);
    } catch (err) {
      console.error('Failed to fetch breakdowns:', err);
    }
  };

  const getDurationInHours = (start, end) => {
    const diff = new Date(end) - new Date(start);
    return +(diff / (1000 * 60 * 60)).toFixed(2);
  };

  const groupByMonth = (data) => {
    const monthly = {};
    data.forEach((item) => {
      const date = new Date(item.breakdown_start);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      monthly[key] = (monthly[key] || 0) + getDurationInHours(item.breakdown_start, item.breakdown_end);
    });
    return Object.entries(monthly).map(([name, value]) => ({ name, value }));
  };

  const groupByMachine = (data, selectedMonth) => {
    const filtered = data.filter((item) => {
      const date = new Date(item.breakdown_start);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      return key === selectedMonth;
    });
    const machines = {};
    filtered.forEach((item) => {
      machines[item.machine_id] = (machines[item.machine_id] || 0) + getDurationInHours(item.breakdown_start, item.breakdown_end);
    });
    return Object.entries(machines).map(([name, value]) => ({ name: `Machine ${name}`, value }));
  };

  const groupByDay = (data, selectedMonth, machineId) => {
    const filtered = data.filter((item) => {
      const date = new Date(item.breakdown_start);
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      return key === selectedMonth && item.machine_id === machineId;
    });
    const days = {};
    filtered.forEach((item) => {
      const dayKey = new Date(item.breakdown_start).toLocaleDateString();
      days[dayKey] = (days[dayKey] || 0) + getDurationInHours(item.breakdown_start, item.breakdown_end);
    });
    return Object.entries(days).map(([name, value]) => ({ name, value }));
  };

  const groupByShift = (data, selectedMonth, machineId, selectedDay) => {
    const filtered = data.filter((item) => {
      const date = new Date(item.breakdown_start);
      const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      const dayKey = date.toLocaleDateString();
      return monthKey === selectedMonth && item.machine_id === machineId && dayKey === selectedDay;
    });
    const shifts = {};
    filtered.forEach((item) => {
      const shift = `Shift ${item.shift_no || 'N/A'}`;
      shifts[shift] = (shifts[shift] || 0) + getDurationInHours(item.breakdown_start, item.breakdown_end);
    });
    return Object.entries(shifts).map(([name, value]) => ({ name, value }));
  };

  const handleBarClick = (params) => {
    const currentLevel = stack.length;

    if (currentLevel === 0) {
      const month = params.name;
      const machines = groupByMachine(rawData, month);
      setChartData(machines);
      setTitle(`Breakdown by Machine - ${month}`);
      setStack([{ month }]);
    } else if (currentLevel === 1) {
      const machineId = parseInt(params.name.replace('Machine ', ''));
      const { month } = stack[0];
      const days = groupByDay(rawData, month, machineId);
      setChartData(days);
      setTitle(`Breakdown by Day - Machine ${machineId} (${month})`);
      setStack([...stack, { machineId }]);
    } else if (currentLevel === 2) {
      const selectedDay = params.name;
      const { month, machineId } = Object.assign({}, ...stack);
      const shifts = groupByShift(rawData, month, machineId, selectedDay);
      setChartData(shifts);
      setTitle(`Breakdown by Shift - ${selectedDay} (Machine ${machineId})`);
      setStack([...stack, { selectedDay }]);
    }
  };

  const handleBack = () => {
    const newStack = [...stack];
    newStack.pop();
    setStack(newStack);

    if (newStack.length === 0) {
      setTitle('Breakdown Hours by Month');
      setChartData(groupByMonth(rawData));
    } else if (newStack.length === 1) {
      const { month } = newStack[0];
      setTitle(`Breakdown by Machine - ${month}`);
      setChartData(groupByMachine(rawData, month));
    } else if (newStack.length === 2) {
      const { month } = newStack[0];
      const { machineId } = newStack[1];
      setTitle(`Breakdown by Day - Machine ${machineId} (${month})`);
      setChartData(groupByDay(rawData, month, machineId));
    }
  };

  const option = {
    title: {
      text: title,
      left: 'center',
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a237e',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} hrs',
      backgroundColor: 'rgba(33, 33, 33, 0.9)',
      borderColor: '#00acc1',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 13,
      },
      extraCssText: 'box-shadow: 0 0 12px rgba(0, 172, 193, 0.5);',
    },
    animationDurationUpdate: 600,
    animationEasing: 'cubicOut',
    xAxis: {
      type: 'category',
      data: chartData.map((item) => item.name),
      axisLabel: {
        rotate: 0,
        interval: 0,
        fontSize: 12,
        color: '#424242',
      },
    },
    yAxis: {
      type: 'value',
      name: 'Hours',
      axisLabel: {
        color: '#424242',
        fontSize: 12,
      },
    },
    series: [
      {
        name: 'Breakdown Time',
        type: 'bar',
        data: chartData.map((item) => item.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1550db' },
            { offset: 1, color: '#0754ed' }
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        emphasis: {
          itemStyle: {
            color: '#1675ea',
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.25)'
          },
        },
        label: {
          show: true,
          position: 'top',
          color: '#195fd9',
          fontWeight: 'bold',
        },
      },
    ],
  };

  return (
    <div style={{ padding: '2rem', marginTop:'2rem' , backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
      {stack.length > 0 && (
        <button
          style={{
            marginBottom: '1rem',
            padding: '6px 12px',
            fontSize: '0.9rem',
            backgroundColor: '#e3f2fd',
            border: '1px solid #90caf9',
            borderRadius: '6px',
            color: '#1976d2',
            cursor: 'pointer',
          }}
          onClick={handleBack}
        >
          ← Back
        </button>
      )}
      <div
        style={{
          backgroundColor: 'white',
          padding: '1rem',
          borderRadius: '12px',
          boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease-in-out',
        }}
      >
        <ReactECharts
          option={option}
          style={{ height: '450px', width: '100%' }}
          onEvents={{ click: handleBarClick }}
          opts={{ renderer: 'svg' }}
        />
      </div>
      <BreakdownTable />
    </div>
    
  );
};

export default BreakdownDrilldownChart;
