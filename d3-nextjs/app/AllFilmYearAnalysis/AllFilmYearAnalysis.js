"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import AllFilmYearLineChart from "./AllFilmYearLineChart";
import AllFilmTearBrush from "./AllFilmYearBrush";
import * as d3 from 'd3'

export default function AllFilmYearAnalysis({ bodyWidth }) {
    const margin = { top: 40, left: 40, bottom: 40, right: 40 };
    const brushMargin = { top: 10, left: 40, bottom: 10, right: 40 };
    const [filmYearLineChart, setFilmYearLineChart] = useState(<Loading />)
    const [filmYearBrush, setFilmYearBrush] = useState();
    const [chartBrushExtent, setChartBrushExtent] = useState();
    const [brushToChartExtent, setBrushToChartExtent] = useState();

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

    const handleChartBrushExtent = (e) => {
        setBrushToChartExtent('')
        setChartBrushExtent(e)
    }

    const handleBrusToChartExtent = (e) => {
        setChartBrushExtent('')
        setBrushToChartExtent(e)
    }

    function GenerateFilmYearLineChart() {
        const width = parseInt(d3.select(".filmYearLineChart").style("width")) - margin.left - margin.right
        const height = width * 0.4 - margin.top - margin.bottom;
        
        getData(`http://${process.env.DB_HOST}/api/movies/replenish-flim-year-chart`)
            .then((res) => {
                setFilmYearLineChart(
                    <AllFilmYearLineChart 
                        bodyWidth={bodyWidth} 
                        data={res.chartDatas} 
                        width={width} 
                        height={height} 
                        margin={margin} 
                        handleChartBrushExtent={handleChartBrushExtent} 
                        brushToChartExtent={brushToChartExtent}
                    />
                )
            });
    }

    function GenerateFilmYearBrush() {
        const width = parseInt(d3.select(".filmYearLineChart").style("width")) - margin.left - margin.right
        const brushHeight = width * 0.2 - margin.top - margin.bottom;
        
        getData(`http://${process.env.DB_HOST}/api/movies/replenish-flim-year-chart`)
            .then((res) => {
                setFilmYearBrush(
                    <AllFilmTearBrush 
                        bodyWidth={bodyWidth} 
                        data={res.chartDatas} 
                        width={width} 
                        height={brushHeight} 
                        margin={brushMargin} 
                        chartBrushExtent={chartBrushExtent}
                        handleBrusToChartExtent={handleBrusToChartExtent}
                    />
                )
            });
    }

    useEffect(() => {
        GenerateFilmYearLineChart()
        GenerateFilmYearBrush()
    }, [bodyWidth]);

    useEffect(() => {
        if (!brushToChartExtent)
            GenerateFilmYearBrush()
    }, [chartBrushExtent]);

    useEffect(() => {
        if (!chartBrushExtent)
            GenerateFilmYearLineChart()
    }, [brushToChartExtent])

    return (
        <div className="flex justify-evenly p-4 bg-gray-500">
            <div className="grid grid-cols-1 gap-4 w-full justify-center">
                <div className="flex justify-center filmYeartChartTitle">
                    <p className="text-2xl font-medium text-gray-200">串流平台-電影年份統計-2</p>
                </div>
                <div className="filmYearLineChart relative">
                    {filmYearLineChart}
                </div>
                <div className="filmYearBrush relative flex justify-center">
                    {filmYearBrush}
                </div>


            </div>
        </div>
    );
}
