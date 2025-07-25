import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import API_BASE_URL from "../config";
// const API_BASE_URL = "http://localhost:5003";

export const useMachineData = (id) =>
  useQuery({
    queryKey: ["machineData", id],
    queryFn: () =>
      axios.get(`${API_BASE_URL}/api/oee/live/${id}`).then((res) => res.data),
    refetchInterval: 5000,
  });

export const useCurrentStatus = (title) =>
  useQuery({
    queryKey: ["currentStatus", title],
    queryFn: () =>
      axios.get(`${API_BASE_URL}/api/latest/${title}`).then((res) => res.data),
    refetchInterval: 5000,
  });

export const useMachineStatus = (id) =>
  useQuery({
    queryKey: ["machineStatus", id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/machines/getallmachine`);
      return res.data.find((m) => m.machine_id === id);
    },
  });

// export const useAlerts = (title) =>
//   useQuery({
//     queryKey: ["alerts", title],
//     queryFn: async () => {
//       const res = await axios.get(`${API_BASE_URL}/api/alerts/machine/${title}`);
//       const today = new Date().toISOString().split("T")[0];
//       return res.data.filter(
//         (a) =>
//           a.updatedAt === a.triggeredAt &&
//           new Date(a.createdAt).toISOString().split("T")[0] === today
//       );
//     },
//     refetchInterval: 5000,
//   });

export const useShifts = () =>
  useQuery({
    queryKey: ["shifts"],
    queryFn: () => axios.get(`${API_BASE_URL}/api/shifts`).then((res) => res.data),
    staleTime: Infinity,
  });
