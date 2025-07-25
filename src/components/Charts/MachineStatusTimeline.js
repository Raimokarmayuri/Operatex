import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-tooltip/dist/react-tooltip.css";
import { Tooltip } from "react-tooltip";
import API_BASE_URL from "../config";
const API_URL = `${API_BASE_URL}/api/downtimes`;

const MachineStatusProgressBar = ({ machine_id }) => {
  const [statusData, setStatusData] = useState([]);
  const [totalDurations, setTotalDurations] = useState({
    Running: 0,
    Idle: 0,
    Downtime: 0,
  });

  // override for demo
  // const API_URL = "http://192.168.29.244:5003";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/machine-status/getstatusbymachineId/${machine_id}`
        );
        const data = await res.json();
        const processed = processTimeline(data);
        setStatusData(processed);

        const totals = { Running: 0, Idle: 0, Downtime: 0 };
        processed.forEach((seg) => {
          totals[seg.status] += seg.duration / 60; // seconds → minutes
        });
        setTotalDurations(totals);
      } catch (err) {
        console.error("Error fetching machine status:", err);
      }
    };
    fetchData();
  }, [machine_id]);

  const processTimeline = (data) => {
    if (!data?.length) return [];

    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    const timeline = [];
    let prev = data[0].is_available;
    let start = new Date(data[0].created_at);
    const dayStart = new Date(start);
    dayStart.setHours(0, 0, 0, 0);

    for (let i = 1; i < data.length; i++) {
      const currTime = new Date(data[i].created_at);
      const dur = (currTime - start) / 1000; // seconds

      if (data[i].is_available !== prev) {
        if (prev === false && data[i].is_available === true) {
          if (dur > 12) {
            timeline.push({
              status: "Idle",
              startTime: start,
              endTime: new Date(start.getTime() + 12000),
              duration: 12,
            });
            timeline.push({
              status: "Downtime",
              startTime: new Date(start.getTime() + 12000),
              endTime: currTime,
              duration: dur - 12,
            });
          } else {
            timeline.push({ status: "Idle", startTime: start, endTime: currTime, duration: dur });
          }
        } else if (prev === true && data[i].is_available === false) {
          timeline.push({
            status: "Running",
            startTime: start,
            endTime: currTime,
            duration: dur,
          });
        }
        start = currTime;
        prev = data[i].is_available;
      }
    }

    return timeline.map((seg) => ({
      ...seg,
      left: ((seg.startTime - dayStart) / 86400000) * 100,
      width: (seg.duration / 86400) * 100,
    }));
  };

  // "Now" marker
  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const nowPct = ((now - dayStart) / 86400000) * 100;

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="timeline-header d-flex justify-content-between align-items-center">
            <strong>Machine {machine_id}</strong>
            <div className="d-flex">
              {["Running", "Idle", "Downtime"].map((st) => (
                <div key={st} className="legend-item mx-3 d-flex align-items-center">
                  <span
                    className="color-box"
                    style={{
                      background:
                        st === "Running" ? "#39FF14" : st === "Idle" ? "gray" : "red",
                    }}
                  />
                  <span className="ml-1">
                    {st}: {totalDurations[st].toFixed(2)} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="row mt-3 timeline-container-wrapper">
        <div className="col-12">
          <div className="timeline-wrapper">
            <div className="timeline-container">
              <div className="current-time-marker" style={{ left: `${nowPct}%` }}>
                <span>Now</span>
              </div>

              {statusData.map((segment, idx) => (
                <div
                  key={idx}
                  className="timeline-segment"
                  data-tooltip-id={`tooltip-${idx}`}
                  data-tooltip-html={`
                    <strong>Status:</strong> ${segment.status}<br/>
                    <strong>Start:</strong> ${new Date(segment.startTime).toLocaleTimeString()}<br/>
                    <strong>End:</strong> ${new Date(segment.endTime).toLocaleTimeString()}<br/>
                    <strong>Dur:</strong> ${(segment.duration / 60).toFixed(2)} min
                  `}
                  style={{
                    left: `${segment.left}%`,
                    width: `${segment.width}%`,
                    background:
                      segment.status === "Running"
                        ? "#39FF14"
                        : segment.status === "Idle"
                        ? "gray"
                        : "red",
                  }}
                >
                  <span className="segment-label">{segment.status}</span>
                </div>
              ))}
            </div>

            <div className="time-markers">
              {Array.from({ length: 24 }, (_, h) => (
                <span key={h} className="time-marker">
                  {h}:00
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltips below segments */}
      {statusData.map((_, idx) => (
        <Tooltip key={idx} id={`tooltip-${idx}`} place="bottom" effect="solid" />
      ))}

      {/* Styles */}
      <style>{`
        .timeline-header {
          position: sticky;
          top: 0;
          background: #fff;
          padding: 8px 20px;
          border-bottom: 1px solid #ddd;
          z-index: 10;
        }
        .legend-item .color-box {
          width: 14px;
          height: 14px;
          display: inline-block;
        }
        .timeline-wrapper {
          position: relative;
          overflow-x: auto;
          white-space: nowrap;
          background-image: linear-gradient(to right, #ddd 1px, transparent 1px);
          background-size: calc(100%/24) 100%;
        }
        .timeline-container {
          position: relative;
          height: 40px;
        }
        .timeline-segment {
          position: absolute;
          height: 100%;
          cursor: pointer;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .timeline-segment:hover {
          transform: scaleY(1.1);
          opacity: 0.9;
          z-index: 5;
        }
        .segment-label {
          position: absolute;
          left: 4px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 10px;
          color: #fff;
          pointer-events: none;
        }
        .current-time-marker {
          position: absolute;
          top: 0;
          width: 2px;
          height: 100%;
          background: #007bff;
          z-index: 4;
        }
        .current-time-marker span {
          position: absolute;
          top: -18px;
          left: -5px;
          font-size: 10px;
          color: #007bff;
        }
        .time-markers {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          font-weight: bold;
          margin-top: 5px;
          padding: 0 10px;
        }
      `}</style>
    </div>
  );
};

export default MachineStatusProgressBar;
