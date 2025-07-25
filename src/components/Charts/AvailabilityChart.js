

import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import API_BASE_URL from "../config";

const API_URL = `${API_BASE_URL}/api/oee-logs/bottleneck/last7days`;

const fetchLast7DaysData = async () => {
  const { data } = await axios.get(API_URL);
  return data;
};

// Generate the last 7 days in 'DD MMM' format
const getLast7Days = () => {
  return Array.from({ length: 7 }).map((_, i) =>
    dayjs().subtract(6 - i, 'day').format('DD MMM')
  );
};

// Normalize the API response to match 7 days
const normalizeChartData = (rawData, key) => {
  const map = {};
  rawData.forEach(item => {
    const dateKey = dayjs(item.createdAt).format('DD MMM');
    map[dateKey] = parseFloat(item[key]) || 0;
  });
  return getLast7Days().map(date => map[date] ?? 0);
};

// Chart styling like your screenshot
const getChartOption = (title, rawData, key, color) => {
  const dates = getLast7Days();
  const values = normalizeChartData(rawData, key);

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#333',
      textStyle: { color: '#fff' },
      borderRadius: 8,
    },
    grid: {
      top: 40,
      left: 40,
      right: 20,
      bottom: 50,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        fontSize: 12,
        fontWeight: 500,
        margin: 12, // pull down labels
      },
      axisLine: {
        lineStyle: { color: '#ccc' },
      },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        fontSize: 12,
        fontWeight: 500,
      },
      splitLine: {
        lineStyle: { color: '#f0f0f0' },
      },
    },
    legend: {
      top: 0,
      left: 'center',
      data: [title],
      textStyle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#003870',
      },
      icon: 'rect',
    },
    series: [
      {
        name: title,
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        lineStyle: {
          width: 4,
          color: color,
        },
        itemStyle: {
          color: '#fff',
          borderColor: color,
          borderWidth: 3,
        },
        areaStyle: {
          color: 'rgba(0, 200, 83, 0.12)', // green background
        },
        label: {
          show: false,
        },
      },
      {
        name: 'Target',
        type: 'line',
        data: new Array(dates.length).fill(100),
        lineStyle: {
          type: 'dashed',
          width: 2,
          color: 'red',
        },
        symbol: 'none',
        tooltip: { show: false },
      },
    ],
  };
};

const Card = ({ title, data, keyName, color }) => (
  <div
    style={{
      flex: 1,
      // minWidth: 380,
      background: '#fff',
      borderRadius: '16px',
      padding: '10px 5px 5px',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.06)',
      border: '1px solid #eee',
      transition: 'all 0.3s ease',
    }}
  >
    <ReactECharts
      option={getChartOption(title, data, keyName, color)}
      style={{ height: 230, width: '100%' }}
    />
  </div>
);

const Last7DaysOeeAvailabilityCards = () => {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['last7days-oee'],
    queryFn: fetchLast7DaysData,
  });

  if (isLoading) return <p className="text-center text-gray-500">Loading charts...</p>;
  if (error) return <p className="text-center text-red-500">Error fetching data.</p>;

  return (
    <div
      style={{
        // display: 'flex',
        // flexWrap: 'wrap',
        // gap: '12px',
        // padding: '10px 0',
        // justifyContent: 'center',
      }}
    >
      <Card title="Average OEE (%)" data={data} keyName="OEE" color="#0072ff" />
      <Card title="Average Availability (%)" data={data} keyName="availability" color="#00c49f" />
    </div>
  );
};

export default Last7DaysOeeAvailabilityCards;
