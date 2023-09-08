"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import * as d3 from 'd3'
import Covid19HeatChart from "./Covid19HeatChart";
import Covid19ChooseType from "./Covid19ChooseType";
import Covid19ZoomTool from "./Covid19ZoomTool";

export default function Covid19Analysis({ bodyWidth }) {
    const margin = { top: 40, left: 55, bottom: 40, right: 55 };
    const [covid19HeatChart, setCovid19HeatChart] = useState(<Loading />)
    const [dataType, setDataType] = useState('confirmed');

    const getData = async (url) => {
        return (
            await fetch(url, {
                method: 'GET'
            })
                .then((res) => res.json())
                .then((data) => {
                    return data
                })
        )
    }

    function GenerateCovid19HeatChart(dataType) {
        getData(`http://${process.env.DB_HOST}/api/covid19/${dataType}`)
            .then((res) => {
                handleSetCovid19HeatChart(res.chartDatas);
            });
    }

    const handleSetCovid19HeatChart = (data) => {
        const width = parseInt(d3.select(".covid19-heat-chart").style("width")) - margin.left - margin.right
        const height = width * 0.6 - margin.top - margin.bottom;
        setCovid19HeatChart(
            <Covid19HeatChart
                bodyWidth={bodyWidth}
                data={data}
                width={width}
                height={height}
                margin={margin}
                dataType={dataType}
            />
        )
    }

    const handleDataTypeChoose = (dataTypeChoose) => {
        setDataType(dataTypeChoose);
    };

    useEffect(() => {
        GenerateCovid19HeatChart(dataType);
    }, [bodyWidth, dataType]);

    return (
        <div className="flex justify-evenly p-4 bg-[#353C51]">
            <div className="grid grid-cols-1 gap-4 w-full justify-center">
                <div className="flex justify-center covid19-heat-chart-title">
                    <p className="text-2xl font-medium text-gray-200">各國武漢肺炎分析</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Covid19ChooseType handleDataTypeChoose={handleDataTypeChoose} />
                    </div>
                    <div className="w-40 bg-gray-300">
                        <Covid19ZoomTool />
                    </div>
                </div>
                <div className="covid19-heat-chart relative">
                    {covid19HeatChart}
                </div>
            </div>
        </div>
    );
}
