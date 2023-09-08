"use client";

import { useEffect, useState } from "react";
import Loading from "../Loading";
import * as d3 from 'd3'
import FilmPlatformPieChart from "./FilmPlatformPieChart";
import FilmPlatformBarChart from "./FilmPlatformBarChart";

export default function FilmPlatformAnalysis({ bodyWidth }) {
    const margin = { top: 40, left: 40, bottom: 40, right: 40 };
    const [filmPlatformPieChart, setFilmPlatformPieChart] = useState(<Loading />)
    const [filmPlatformBarChart, setFilmPlatformBarChart] = useState(<Loading />)
    const [focusPlatformName, setFocusPlatformName] = useState('none movie')

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

    const getDataWithPost = async (url, focusPlatformName) => {
        return (
            await fetch(url+`/${[focusPlatformName]}`, {
                method: 'GET'
            })
                .then((res) => res.json())
                .then((data) => {
                    return data
                })
        )
    }

    function GenerateFilmPlatformPieChart() {
        const width = parseInt(d3.select(".filmPlatformPieChart").style("width")) - margin.left - margin.right
        const height = width - margin.top - margin.bottom;

        getData(`http://${process.env.DB_HOST}/api/movies/platform-flim-year-pie-chart`)
            .then((res) => {
                setFilmPlatformPieChart(
                    <FilmPlatformPieChart
                        bodyWidth={bodyWidth}
                        data={res}
                        width={width}
                        height={height}
                        margin={margin}
                        handlePieChartFocusSlice={handlePieChartFocusSlice}
                    />
                )
            });
    }

    function GenerateFilmPlatformBarChart() {
        const width = parseInt(d3.select(".filmPlatformBarChart").style("width")) - margin.left - margin.right
        const height = width - margin.top - margin.bottom;

        getDataWithPost(`http://${process.env.DB_HOST}/api/movies/platform-flim-year-bar-chart`, focusPlatformName)
            .then((res) => {
                setFilmPlatformBarChart(
                    <FilmPlatformBarChart
                        bodyWidth={bodyWidth}
                        data={res}
                        width={width}
                        height={height}
                        margin={margin}
                    />
                )
            });
    }

    const handlePieChartFocusSlice = (platformName) => {
        console.log(platformName)
        setFocusPlatformName(platformName)
    }

    useEffect(() => {
        GenerateFilmPlatformBarChart()
    }, [focusPlatformName])

    useEffect(() => {
        GenerateFilmPlatformPieChart()
        GenerateFilmPlatformBarChart()
    }, [bodyWidth]);

    return (
        <div className="flex justify-evenly p-4 bg-gray-500">
            <div className="grid grid-cols-1 gap-4 w-full justify-center">
                <div className="flex justify-center filmYeartChartTitle">
                    <p className="text-2xl font-medium text-gray-200">串流平台-電影年份統計-3</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="filmPlatformPieChart relative border-double border-4 border-yellow-100 rounded-lg">
                        {filmPlatformPieChart}
                    </div>
                    <div className="filmPlatformBarChart relative border-double border-4 border-yellow-100 rounded-lg">
                        {filmPlatformBarChart}
                    </div>
                </div>
            </div>
        </div>
    );
}
