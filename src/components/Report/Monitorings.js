
import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import { useQueries, useQuery } from '@tanstack/react-query';
import API_BASE_URL from "../config";


const parameterMap = {
  Encoder: ['Encoder1', 'Encoder2', 'Encoder3', 'Encoder4'],
  SpindleSpeed: ['SpindleSpeed'],
  ServoLoad: ['ServoLoad1', 'ServoLoad2', 'ServoLoad3', 'ServoLoad4'],
  ServoTemp: ['ServoTemp1', 'ServoTemp2', 'ServoTemp3', 'ServoTemp4']
};

const MonitoringChart = () => {
  const [parameter, setParameter] = useState('Encoder');
  const [days, setDays] = useState(7);
  const [selectedMachine, setSelectedMachine] = useState('');

  const subParameters = parameterMap[parameter];

  const { data: machines = [], isLoading: isMachinesLoading } = useQuery({
    queryKey: ['machines'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      return res.data;
    }
  });

  useEffect(() => {
  if (machines.length > 0 && !selectedMachine) {
    setSelectedMachine(machines[0].machine_name_type); // ✅ Always select first machine from API
  }
}, [machines, selectedMachine]);


  const queries = useQueries({
    queries: selectedMachine
      ? subParameters.map((sub) => ({
          queryKey: ['monitoring', selectedMachine, sub, days],
          queryFn: async () => {
            const res = await axios.get(
              `${API_BASE_URL}/api/monitoring/${selectedMachine}?days=${days}&parameter=${sub}`
            );
            return res.data;
          }
        }))
      : []
  });

  const chartsData = subParameters.reduce((acc, sub, idx) => {
    acc[sub] = queries[idx]?.data || [];
    return acc;
  }, {});

  const loadingParams = subParameters.filter((_, idx) => queries[idx]?.isLoading);

  const renderChart = (subParam, data) => {
    const option = {
      color: ['#007bff', '#CC9900', '#dc3545'],

      title: {
        text: subParam,
        left: 'center',
        top: 10,
        textStyle: { fontSize: 16 }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(50,50,50,0.85)',
        textStyle: { color: '#fff' }
      },
      legend: {
        top: 30,
        textStyle: { fontSize: 12 }
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.bucket),
        axisLabel: {
          rotate: 45,
          fontSize: 10,
          formatter: (val) => {
            const date = new Date(val);
            const hour = date.getHours();
            const minute = date.getMinutes();
            if (hour === 0 && minute === 0) {
              return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
            }
            return '';
          }
        },
        axisPointer: { type: 'line', snap: true }
      },
      yAxis: {
        type: 'value',
        name: 'Value',
        nameTextStyle: { fontSize: 12 }
      },
      dataZoom: [
        { type: 'inside', start: 80, end: 100 },
        { type: 'slider', start: 80, end: 100 }
      ],
      series: [
        {
          name: 'Avg',
          type: 'line',
          data: data.map(d => parseFloat(d.avg_value)),
          smooth: true,
          lineStyle: { color: '#007bff' },
          areaStyle: { color: 'rgba(66, 135, 245, 0.2)' },
          symbol: 'circle'
        },
        {
          name: 'Min',
          type: 'line',
          data: data.map(d => parseFloat(d.min_value)),
          smooth: true,
          lineStyle: { type: 'dashed', color: '#CC9900' },
          symbol: 'none'
        },
        {
          name: 'Max',
          type: 'line',
          data: data.map(d => parseFloat(d.max_value)),
          smooth: true,
          lineStyle: { type: 'dashed', color: '#dc3545' },
          symbol: 'none'
        }
      ]
    };

    return <ReactECharts option={option} style={{ height: 400, width: '100%' }} notMerge={true} lazyUpdate={true} />;
  };

  return (
    <div style={{ padding: '20px', marginTop: "5rem" }}>
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '20px',
        marginBottom: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
        fontSize: '16px'
      }}>
        <label style={{ fontWeight: 'bold', color: '#003870' }}>
          Machine:{' '}
          <select
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            style={{
              fontSize: '15px',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              backgroundColor: '#f9f9f9',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
              outline: 'none',
              minWidth: '160px',
              color: '#333',
            }}
          >
            {machines.map((machine, index) => (
              <option key={index} value={machine.machine_name_type}>
                {machine.machine_name_type}
              </option>
            ))}
          </select>
        </label>

        <label style={{ fontWeight: 'bold', color: '#003870' }}>
          Parameter:{' '}
          <select
            value={parameter}
            onChange={(e) => setParameter(e.target.value)}
            style={{
              fontSize: '15px',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              backgroundColor: '#f9f9f9',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
              outline: 'none',
              minWidth: '140px',
              color: '#333',
            }}
          >
            {Object.keys(parameterMap).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label style={{ fontWeight: 'bold', color: '#003870' }}>
          Days:{' '}
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            style={{
              fontSize: '15px',
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              backgroundColor: '#f9f9f9',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
              outline: 'none',
              minWidth: '120px',
              color: '#333',
            }}
          >
            <option value={1}>1 Day</option>
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={180}>6 Months</option>
          </select>
        </label>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        justifyContent: 'space-between'
      }}>
        {subParameters.map((sub) => (
          <div
            key={sub}
            style={{
              flex: '0 0 48%',
              border: '1px solid #ccc',
              borderRadius: 10,
              padding: 10,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              minHeight: 440,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#fff'
            }}
          >
            {chartsData[sub] && chartsData[sub].length > 0 ? (
              renderChart(sub, chartsData[sub])
            ) : loadingParams.includes(sub) ? (
              <p style={{ fontSize: '14px', color: '#888' }}>Loading {sub}...</p>
            ) : (
              <p style={{ fontSize: '14px', color: '#888' }}>No data for {sub}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MonitoringChart;