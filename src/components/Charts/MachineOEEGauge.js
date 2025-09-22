import React from "react";
import useSWR from "swr";
import axios from "axios";
import API_BASE_URL from "../config";
import Speedometer from "react-d3-speedometer";
// const API_BASE_URL = "http://192.168.29.244:5003";

// SWR fetcher
const fetcher = (url) => axios.get(url).then((res) => res.data);

const GaugeMeter = ({ label, value }) => (
  <div className="col-12 col-md-3 d-flex flex-column align-items-center mb-1">
    <h6 style={{ fontWeight: "bold", marginBottom: "1px", color: "black" }}>
      {label}{" "}
      <span style={{ fontSize: "16px", color: "#034694" }}>{value}%</span>
    </h6>
    <Speedometer
      maxValue={100}
      value={value}
      segments={5}
      needleColor="#000000"
      currentValueText=""
      width={160}
      height={110}
      ringWidth={18}
      needleTransition="easeElastic"
      needleHeightRatio={0.6}
      segmentColors={["#FF4E4E", "#FFA534", "#FFEB3B", "#A2F57A", "#4CAF50"]}
      customSegmentLabels={[]}
      valueTextFontSize="0px"
      labelFontSize="0px"
    />
  </div>
);

const safeValue = (val) => {
  if (val == null || isNaN(val)) return 0;
  return val < 0 ? 0 : val;
};

const MachineOEEGauge = () => {
  // Bottleneck machine IDs
  const { data: bottleneckIds, error: bottleneckError } = useSWR(
    `${API_BASE_URL}/api/machines/machines/bottleneck-ids`,
    fetcher
  );

  // All OEE log data
  const { data: oeeLog, error: oeeLogError } = useSWR(
    `${API_BASE_URL}/api/oee-logs`,
    fetcher,
    { refreshInterval: 60000 } // Refresh every 60 seconds
  );

  // Average OEE data
  const { data: avgOeeData, error: avgOeeError } = useSWR(
    `${API_BASE_URL}/api/machine-average-data`,
    fetcher
  );

  if (bottleneckError || oeeLogError || avgOeeError) {
    return <div> loading OEE data.</div>;
  }

  if (!bottleneckIds || !oeeLog || !avgOeeData) {
    return <div>Loading...</div>;
  }

  const todayString = new Date().toISOString().split("T")[0];
  const todayData = {};

  (oeeLog.oeeData || []).forEach((entry) => {
    const entryDate = new Date(entry.savedAt).toISOString().split("T")[0];
    if (entryDate === todayString && bottleneckIds.includes(entry.machineId)) {
      if (
        !todayData[entry.machineId] ||
        new Date(entry.savedAt) > new Date(todayData[entry.machineId].savedAt)
      ) {
        todayData[entry.machineId] = entry;
      }
    }
  });

  const computeMetrics = (data) => {
    if (data.length === 0) return null;
    const total = data.length;
    const sum = data.reduce(
      (acc, curr) => {
        acc.OEE += curr.OEE || 0;
        acc.availability += curr.availability || 0;
        acc.quality += curr.quality || 0;
        acc.performance += curr.performance || 0;
        return acc;
      },
      { OEE: 0, availability: 0, quality: 0, performance: 0 }
    );
    return {
      OEE: (sum.OEE / total).toFixed(2),
      availability: (sum.availability / total).toFixed(2),
      quality: (sum.quality / total).toFixed(2),
      performance: (sum.performance / total).toFixed(2),
    };
  };

  const todayOee = computeMetrics(Object.values(todayData));
  const fallbackOee = avgOeeData?.machineData?.averageMetrics;

  return (
    <div className="container mt-4">
      <div className="row d-flex justify-content-center">
        <GaugeMeter
          label="A"
          value={safeValue(
            todayOee
              ? parseFloat(todayOee.availability)
              : parseFloat(fallbackOee?.availability || 0)
          )}
        />
        <GaugeMeter
          label="Q"
          value={safeValue(
            todayOee
              ? parseFloat(todayOee.quality)
              : parseFloat(fallbackOee?.quality || 0)
          )}
        />
        <GaugeMeter
          label="P"
          value={safeValue(
            todayOee
              ? parseFloat(todayOee.performance)
              : parseFloat(fallbackOee?.performance || 0)
          )}
        />
        <GaugeMeter
          label="OLE"
          value={safeValue(
            todayOee
              ? parseFloat(todayOee.OEE)
              : parseFloat(fallbackOee?.OEE || 0)
          )}
        />
      </div>
    </div>
  );
};


export default MachineOEEGauge;
