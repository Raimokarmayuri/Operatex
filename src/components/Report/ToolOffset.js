
import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import API_BASE_URL from "../config";

const ToolOffsetChart = ({ toolNumber }) => {
    const [seriesData, setSeriesData] = useState([]);
    const [loading, setLoading] = useState(false);
    const machineId = localStorage.getItem("selectedMachineId");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${API_BASE_URL}/api/tool-offsets/machine/${machineId}/tool/${toolNumber}`
                );
                const data = response.data || [];

                const series = [
                    {
                        name: 'GeomZ',
                        data: data
                            .filter((item) => item.OffsetType === 'GeomZ')
                            .map((item) => [
                                new Date(item.Timestamp).getTime(),
                                item.OffsetValue,
                            ]),
                    },
                    {
                        name: 'GeomX',
                        data: data
                            .filter((item) => item.OffsetType === 'GeomX')
                            .map((item) => [
                                new Date(item.Timestamp).getTime(),
                                item.OffsetValue,
                            ]),
                    },
                    {
                        name: 'WearZ',
                        data: data
                            .filter((item) => item.OffsetType === 'WearZ')
                            .map((item) => [
                                new Date(item.Timestamp).getTime(),
                                item.OffsetValue,
                            ]),
                    },
                    {
                        name: 'WearX',
                        data: data
                            .filter((item) => item.OffsetType === 'WearX')
                            .map((item) => [
                                new Date(item.Timestamp).getTime(),
                                item.OffsetValue,
                            ]),
                    },
                ];

                setSeriesData(series);
            } catch (error) {
                console.error('Error fetching tool offset data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toolNumber]);

    // Calculate dynamic min and max for y-axis
    const allValues = seriesData.flatMap((series) =>
        series.data.map((point) => point[1])
    );
    const yAxisMin = Math.min(...allValues, -10); // Default min is -10 if data is empty
    const yAxisMax = Math.max(...allValues, 10);  // Default max is 10 if data is empty

    const chartOptions = {
        chart: {
            type: 'line',
            height: 350,
        },
        stroke: {
            curve: 'smooth',
        },
        title: {
            // text: `Tool Offset Data for Tool ${toolNumber}`,
            align: 'center',
        },
        xaxis: {
            type: 'datetime',
            title: {
                text: 'Timestamp',
            },
            labels: {
                datetimeFormatter: {
                    year: 'yyyy',
                    month: 'MMM yyyy',
                    day: 'dd MMM',
                    hour: 'HH:mm',
                },
            },
        },
        yaxis: {
            title: {
                text: 'Offset Value',
            },
            min: yAxisMin,
            max: yAxisMax,
            tickAmount: 10,
            labels: {
                formatter: (value) => value.toFixed(2),
            },
        },
        annotations: {
            yaxis: [
                {
                    y: 0,
                    borderColor: '#00E396',
                    label: {
                        borderColor: '#00E396',
                        style: {
                            color: '#fff',
                            background: '#00E396',
                        },
                        text: 'Baseline (0)',
                    },
                },
            ],
        },
        grid: {
            borderColor: '#e7e7e7',
            strokeDashArray: 5,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
    };

    return (
        <div className="container-flex mt-4">
            <div className="row">
                <div className="col mb-4">
                    <div className="card shadow-lg">
                        <div className="card-header bg-light text-black text-center">
                            <h6>Tool Offset Data for ToolNumber {toolNumber}</h6>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center">
                                    <p>Loading chart data...</p>
                                </div>
                            ) : seriesData.length > 0 ? (
                                <div>
                                    <Chart
                                        options={chartOptions}
                                        series={seriesData}
                                        type="line"
                                        // height={350}
                                        // width={650}
                                    />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p>No data available for Tool {toolNumber}.</p>
                                </div>
                            )}
                        </div>
                        {/* <div className="card-footer text-center text-muted">
                            Data retrieved from Machine {machineId}
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolOffsetChart;



