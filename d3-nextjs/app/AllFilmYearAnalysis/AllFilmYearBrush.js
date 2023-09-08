'use client'

import { useEffect, useState } from "react"
import * as d3 from 'd3'

export default function AllFilmTearBrush({ bodyWidth, data, width, height, margin, chartBrushExtent, handleBrusToChartExtent }) {
    const pathColor = '#ADD8E6', pathFocusColor = '#66FFE6'
    const focusMargin = 10
    const borderPath = [{ x: 0, y: 0 }, { x: width, y: 0 }, { x: width, y: height }, { x: 0, y: height }, { x: 0, y: 0 }]

    const xData = data.map((i) => new Date(i.year));
    const yData = data.map((d) => d.amount);

    const xScale =
        d3.scaleTime()
            .domain(d3.extent(xData))
            .range([0, width]);

    const yScale =
        d3.scaleLinear()
            .domain([0, d3.max(yData) * 1.1])
            .range([height, 0])
            .nice();

    const areaPath = d3.area()
        .x((d) => xScale(new Date(d.year)))
        .y0((d) => yScale(parseInt(d.amount)))
        .y1(height)

    const linePath = d3.line()
        .x((d) => d.x)
        .y((d) => d.y)

    const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on('end', updateChart)

    const createSvg = () => {

        d3.select(".filmYearBrush svg").remove();

        d3.select(".filmYearBrush")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    }

    const reSizeSvg = () => {

        d3.select(".filmYearBrush svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    };

    const drawChart = () => {

        const svg = d3.select(".filmYearBrush svg g");

        svg.select('.area-chart').remove()

        const clip = svg.append('defs')
            .append('clipPath')
            .attr('id', 'brushClip')
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)

        const areaChart = svg.append('g')
            .attr('clip-path', 'url(#brushClip)')
            .attr('class', 'area-chart border-2')

        areaChart
            .append('path')
            .attr('class', 'area')
            .attr('fill', pathColor)
            .attr('stroke', pathColor)
            .attr('d', areaPath(data))

        areaChart
            .append('path')
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', 'white')
            .attr('stroke-width', 1.5)
            .attr('d', linePath(borderPath))

        areaChart
            .append('g')
            .append('circle')
            .attr('class', 'brush-focus-circle')
            .style('fill', 'none')
            .style('stroke', pathFocusColor)
            .attr('r', 4)
            .style('opacity', 0)

        areaChart
            .append('g')
            .attr('class', 'brush-brush')
            .style('pointer-events', 'all')
            .style('cursor', 'pointer')
            .call(brush)

    }

    function updateChart(e) {
        handleBrusToChartExtent(e)
    }

    function handleChartEvent(brushExtent) {

        if (brushExtent) {
            d3.select('.brush-brush')
                .call(d3.brushX().move,
                    [xScale(brushExtent[0]), xScale(brushExtent[1])]
                )
        }
    }

    useEffect(() => {
        createSvg()
    }, [])

    useEffect(() => {
        reSizeSvg()
        drawChart()
    }, [bodyWidth])

    useEffect(() => {
        handleChartEvent(chartBrushExtent)
    }, [chartBrushExtent])

    return (
        <>

        </>
    )
}