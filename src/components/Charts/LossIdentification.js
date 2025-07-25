import React, { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import API_BASE_URL from "../config";

const API_URL = `${API_BASE_URL}/api/oee-logs`;
const FILTER_OPTIONS = ['Today', 'Last Day', 'Month', 'Year'];

const filterDataByRange = (data, filter) => {
  const now = dayjs();
  return data.filter(entry => {
    const created = dayjs(entry.createdAt);
    if (filter === 'Today') return created.isSame(now, 'day');
    if (filter === 'Last Day') return created.isSame(now.subtract(1, 'day'), 'day');
    if (filter === 'Month') return created.isSame(now, 'month');
    if (filter === 'Year') return created.isSame(now, 'year');
    return false;
  });
};

const groupDataByMachine = (data) => {
  const grouped = {};
  data.forEach(item => {
    const machine = item.machine_name_type || `Machine ${item.machine_id}`;
    if (!grouped[machine]) {
      grouped[machine] = {
        expectedPartCount: 0,
        TotalPartsProduced: 0,
        defectiveParts: 0,
      };
    }
    grouped[machine].expectedPartCount += parseInt(item.expectedPartCount || 0);
    grouped[machine].TotalPartsProduced += parseInt(item.TotalPartsProduced || 0);
    grouped[machine].defectiveParts += parseInt(item.defectiveParts || 0);
  });
  return grouped;
};

const ProductionStatsPerMachineChart = () => {
  const [filter, setFilter] = useState('Today');

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['oee-logs'],
    queryFn: async () => {
      const res = await axios.get(API_URL);
      return res.data || [];
    },
  });

  const filteredData = filterDataByRange(data, filter);
  const grouped = groupDataByMachine(filteredData);
  const machines = Object.keys(grouped);

  const planned = machines.map(machine => grouped[machine].expectedPartCount);
  const produced = machines.map(machine => grouped[machine].TotalPartsProduced);
  const defective = machines.map(machine => grouped[machine].defectiveParts);

  const option = {
    title: {
      text: `Production Stats per Machine - ${filter}`,
      left: 'center',
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#003870',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    legend: {
      bottom: 0,
      data: ['Planned Quantity', 'Total Produced', 'Defective'],
    },
    grid: {
      top: 60,
      left: '3%',
      right: '4%',
      bottom: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: machines,
      axisLabel: {
        fontSize: 12,
        rotate: 0,
        margin: 12,
      },
    },
    yAxis: {
      type: 'value',
      name: 'Parts Count',
      axisLabel: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: 'Planned Quantity',
        type: 'bar',
        data: planned,
        itemStyle: { color: '#0072ff' },
        barWidth: '25%',
        label: {
          show: true,
          position: 'top',
        },
      },
      {
        name: 'Total Produced',
        type: 'bar',
        data: produced,
        itemStyle: { color: '#ff9f40' },
        barWidth: '25%',
        barGap: '0%',
        label: {
          show: true,
          position: 'top',
        },
      },
      {
        name: 'Defective',
        type: 'bar',
        data: defective,
        itemStyle: { color: '#FF6B6B' },
        barWidth: '25%',
        barGap: '0%',
        label: {
          show: true,
          position: 'top',
        },
      },
    ],
  };

  return (
    <div
      style={{
        background: '#fff',
        padding: 20,
        marginTop: '4rem',
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* Filter Buttons */}
      <div style={{ display: 'flex', justifyContent: 'start', gap: '16px', marginBottom: 20 }}>
        {FILTER_OPTIONS.map(option => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              backgroundColor: filter === option ? '#003870' : '#eee',
              color: filter === option ? '#fff' : '#333',
              fontWeight: filter === option ? 'bold' : 'normal',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Chart */}
      {isLoading ? (
        <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
      ) : error ? (
        <p style={{ textAlign: 'center', color: 'red' }}>Error loading data</p>
      ) : (
        <ReactECharts option={option} style={{ height: 480, width: '100%' }} />
      )}
    </div>
  );
};

export default ProductionStatsPerMachineChart;
