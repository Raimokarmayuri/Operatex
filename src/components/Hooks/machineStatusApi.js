// src/Hooks/machineStatusApi.js
import axios from 'axios';
import API_BASE_URL from '../config';

export const fetchMachineStatusByDate = async (machineId) => {
  const date = new Date().toISOString().split("T")[0];
  const response = await axios.post(
    `${API_BASE_URL}/api/bydaterange/machinestatus/${machineId}`,
    {
      startDate: date,
      endDate: date,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};
