import axios from 'axios';
import API_BASE_URL from "../config";

export const fetchMachineOEEData = async (machine_id, filter = "") => {
  const [responseOEE, responseMachineData] = await Promise.all([
    axios.get(`${API_BASE_URL}/api/oee/live/${machine_id}?filter=${filter}`),
    axios.get(`${API_BASE_URL}/api/oee/live/${machine_id}`)
  ]);

  const {
    OEE,
    selectedUser,
    availability,
    performance,
    quality,
    defectiveParts,
    TotalPartsProduced,
    downtimeDuration,
    shiftStartTime,
    shiftEndTime,
    currentTime,
    remainingTime,
    activeTime,
    expectedPartCount: rawExpectedPartCount,
  } = responseOEE.data;

  const expectedPartCount = Math.max(rawExpectedPartCount, 0);
  const plannedQty = responseMachineData.data.plannedQty;
  const partBehind = Math.max(expectedPartCount - TotalPartsProduced, 0);
  const partAhead = Math.max(TotalPartsProduced - expectedPartCount, 0);
  const goodParts = TotalPartsProduced - defectiveParts;

  return {
    OEE,
    selectedUser,
    availability,
    performance,
    quality,
    defectiveParts,
    TotalPartsProduced,
    downtimeDuration,
    shiftStartTime,
    shiftEndTime,
    currentTime,
    remainingTime,
    activeTime,
    expectedPartCount,
    plannedQty,
    partBehind,
    partAhead,
    goodParts
  };
};

export const fetchReworkData = async (machine_id) => {
  const response = await axios.get(`${API_BASE_URL}/api/getCurrentdateRejection`);
  const reworkData = response.data.filter(
    (item) =>
      item.rejectionType.toLowerCase() === "rework" &&
      item.machine_id === machine_id
  );

  return reworkData.reduce((acc, item) => acc + item.quantity, 0);
};
