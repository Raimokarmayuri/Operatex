import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import ProductionReport from './ProductionReportTable';
import API_BASE_URL from "../config";

const API_URL = `${API_BASE_URL}/api/oee-logs/forProductionchart`;

const DrilldownProductionChart = () => {
  const [view, setView] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const nodeRef = useRef(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ['production-summary'],
    queryFn: async () => {
      const res = await axios.get(API_URL);
      return res.data;
    },
  });

  const monthlyData = () => {
    const grouped = data.reduce((acc, entry) => {
      const month = dayjs(entry.createdAt).format('MMMM');
      if (!acc[month]) acc[month] = { TotalPartsProduced: 0, expectedPartCount: 0 };
      acc[month].TotalPartsProduced += Number(entry.TotalPartsProduced || 0);
      acc[month].expectedPartCount += Number(entry.expectedPartCount || 0);
      return acc;
    }, {});
    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthOrder.filter(m => grouped[m]).map(m => ({
      label: m,
      ...grouped[m],
    }));
  };

  const machineData = (month) => {
    const filtered = data.filter(d => dayjs(d.createdAt).format('MMMM') === month);
    const grouped = filtered.reduce((acc, entry) => {
      const name = entry.machine_name_type || `Machine ${entry.machine_id}`;
      if (!acc[name]) acc[name] = { TotalPartsProduced: 0, expectedPartCount: 0 };
      acc[name].TotalPartsProduced += Number(entry.TotalPartsProduced || 0);
      acc[name].expectedPartCount += Number(entry.expectedPartCount || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([label, values]) => ({ label, ...values }));
  };

  const dayData = (month, machineName) => {
    const filtered = data.filter(d =>
      dayjs(d.createdAt).format('MMMM') === month &&
      (d.machine_name_type || `Machine ${d.machine_id}`) === machineName
    );
    const grouped = filtered.reduce((acc, entry) => {
      const day = dayjs(entry.createdAt).format('YYYY-MM-DD');
      if (!acc[day]) acc[day] = { TotalPartsProduced: 0, expectedPartCount: 0 };
      acc[day].TotalPartsProduced += Number(entry.TotalPartsProduced || 0);
      acc[day].expectedPartCount += Number(entry.expectedPartCount || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([label, values]) => ({ label, ...values }));
  };

  const shiftData = (month, machineName, day) => {
    const filtered = data.filter(d =>
      dayjs(d.createdAt).format('MMMM') === month &&
      (d.machine_name_type || `Machine ${d.machine_id}`) === machineName &&
      dayjs(d.createdAt).format('YYYY-MM-DD') === day
    );
    const grouped = filtered.reduce((acc, entry) => {
      const shift = entry.shift_no || 'Unknown';
      if (!acc[shift]) acc[shift] = { TotalPartsProduced: 0, expectedPartCount: 0 };
      acc[shift].TotalPartsProduced += Number(entry.TotalPartsProduced || 0);
      acc[shift].expectedPartCount += Number(entry.expectedPartCount || 0);
      return acc;
    }, {});
    return Object.entries(grouped).map(([label, values]) => ({ label: `Shift ${label}`, ...values }));
  };

  const chartData =
    view === 'month'
      ? monthlyData()
      : view === 'machine'
      ? machineData(selectedMonth)
      : view === 'day'
      ? dayData(selectedMonth, selectedMachine)
      : shiftData(selectedMonth, selectedMachine, selectedDay);

  const handleClick = (params) => {
    if (view === 'month') {
      setSelectedMonth(params.name);
      setView('machine');
    } else if (view === 'machine') {
      setSelectedMachine(params.name);
      setView('day');
    } else if (view === 'day') {
      setSelectedDay(params.name);
      setView('shift');
    }
  };

  const goBack = () => {
    if (view === 'shift') {
      setView('day');
      setSelectedDay(null);
    } else if (view === 'day') {
      setView('machine');
      setSelectedMachine(null);
    } else if (view === 'machine') {
      setView('month');
      setSelectedMonth(null);
    }
  };

  const chartOption = {
    title: {
  text:
    view === 'month'
      ? 'Monthly Production Summary'
      : view === 'machine'
      ? `Machine-wise Production in ${selectedMonth}`
      : view === 'day'
      ? `Daily Production for ${selectedMachine} in ${selectedMonth}`
      : `Shift-wise Production in ${selectedMonth} for ${selectedMachine} on ${selectedDay}`,

      left: 'center',
      textStyle: { fontSize: 20, fontWeight: 'bold', color: '#003870' },
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { show: true, top: 30 },
    xAxis: {
      type: 'category',
      data: chartData.map(d => d.label),
      axisLabel: { fontSize: 13, color: '#333' },
      name:
        view === 'month' ? 'Month' :
        view === 'machine' ? 'Machine' :
        view === 'day' ? 'Date' : '',
      nameLocation: 'middle',
      nameGap: 40,
    },
    yAxis: {
      type: 'value',
      name: 'Parts Count',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: { fontSize: 14, fontWeight: 'bold' },
    },
    series: [
      {
        name: 'Total Parts Produced',
        type: 'bar',
        data: chartData.map(d => d.TotalPartsProduced),
        itemStyle: { color: '#0072ff' },
        label: { show: true, position: 'top', fontWeight: 'bold' },
        barWidth: '40%',
      },
      {
        name: 'Expected Part Count',
        type: 'bar',
        data: chartData.map(d => d.expectedPartCount),
        itemStyle: { color: '#ff9f40' },
        label: { show: true, position: 'top', fontWeight: 'bold' },
        barWidth: '40%',
        barGap: '0%',
      },
    ],
  };

  return (
    <>
    <div
      style={{
        background: '#fff',
        padding: '30px',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginTop: '30px',
        position: 'relative',
      }}
    >
      <style>
        {`
          .fade-enter { opacity: 0.01; }
          .fade-enter-active { opacity: 1; transition: opacity 200ms ease-in; }
          .fade-exit { opacity: 1; }
          .fade-exit-active { opacity: 0.01; transition: opacity 200ms ease-out; }
        `}
      </style>

      {view !== 'month' && (
        <button
          onClick={goBack}
          style={{
            marginBottom: '16px',
            padding: '6px 12px',
            backgroundColor: '#0072ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Back
        </button>
      )}

      {isLoading ? (
        <p className="text-center text-gray-500">Loading production data...</p>
      ) : (
        <SwitchTransition mode="in-out">
          <CSSTransition
            key={view + selectedMonth + selectedMachine + selectedDay}
            timeout={300}
            classNames="fade"
            nodeRef={nodeRef}
          >
            <div ref={nodeRef}>
              <ReactECharts
                option={chartOption}
                style={{ height: 520, width: '100%' }}
                onEvents={{ click: handleClick }}
              />
            </div>
          </CSSTransition>
        </SwitchTransition>
      )}
    </div>
    <ProductionReport />
    </>
  );
};

export default DrilldownProductionChart;
