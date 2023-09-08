'use client'

import { useEffect, useState } from "react"
import * as d3 from 'd3'

export default function AllFilmYearLineChart({ bodyWidth, data }) {
    const [margin, setMargin] = useState({ top: 40, left: 40, bottom: 40, right: 40 });

    const createSvg = () => {
        const width =
            parseInt(d3.select(".filmYearLineChart").style("width")) - margin.left - margin.right,
            height = width * 0.5 - margin.top - margin.bottom;

        d3.select(".filmYearLineChart svg").remove();

        d3.select(".filmYearLineChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    }

    const reSizeSvg = () => {
        const width =
            parseInt(d3.select(".filmYearLineChart").style("width")) - margin.left - margin.right,
            height = width * 0.5 - margin.top - margin.bottom;

        d3.select(".filmYearLineChart svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)

    };

    const drawChart = () => {
        const width =
            parseInt(d3.select(".filmYearLineChart").style("width")) - margin.left - margin.right,
            height = width * 0.5 - margin.top - margin.bottom;

        const svg = d3.select(".filmYearLineChart svg g");

        const xData = data.map((i) => new Date(i.year))

        const xScale = d3.scaleTime()
            .domain(d3.extent(xData))
            .range([0, width])

        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeYear.every(5))
            // .tickValues(xScale.ticks().concat(d3.extent(xData)))
            .tickFormat((d) => d3.timeFormat('%Y')(d) + '年')

        svg.selectAll('.x-axis')
            .data([null])
            .join("g")
            .classed('x-axis', true)
            .attr("transform", `translate(0, ${height})`)
            .transition().duration(1000)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(0, 0)rotate(-30)")
            .style("text-anchor", "end")
            .style('font-size', '13px')
            .attr('fill', 'white')

        const yData = data.map((i) => Number(i.amount))

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(yData)])
            .range([height, 0])
            .nice()

        const yAxis = d3.axisLeft(yScale)

        svg
            .selectAll('.y-axis')
            .data([null])
            .join('g')
            .classed('y-axis', true)
            .transition()
            .duration(500)
            .call(yAxis)
            .selectAll('text')
            .style('font-size', '13px')
            .attr('fill', 'white')

        svg
            .select('.y-axis')
            .append('text')
            .attr('class', 'yAxis-label')
            .text('部/年')
            .attr('x', 0)
            .attr('y', -15)

        const clip = svg.selectAll('.clip')
            .data([null])
            .join('g')
            .classed('clip', true)
            .attr('id', 'clip')
            .selectAll('rect')
            .data([null])
            .join('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)

        function updateChart(e, d) {
            let extent = e.selection
            if (extent) {
                xScale.domain([xScale.invert(extent[0]), xScale.invert(extent[1])])
                const xAxisTicks = (xScale.invert(extent[1]) - xScale.invert(extent[0])) <= xScale.invert(width) / 3 ? 2 : 5
                xAxis.ticks(d3.timeYear.every(xAxisTicks))
                lineChart.selectAll('.brush').call(brush.move, null)
            }

            svg
                .selectAll('.x-axis')
                .transition(1000)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "translate(0, 0)rotate(-30)")
                .style("text-anchor", "end")
                .style('font-size', '13px')
                .attr('fill', 'white')

            lineChart
                .selectAll('.line')
                .transition(1000)
                .attr('d', linePath(data))
        }

        const brush = d3.brushX()
            .extent([[0, 0], [width, height]])
            .on('end', updateChart)

        const linePath = d3.line()
            .x((d) => xScale(new Date(d.year)))
            .y((d) => yScale(parseInt(d.amount)))
            .curve(d3.curveLinear)

        const lineChart = svg.selectAll('.lineChart')
            .data([null])
            .join('g')
            .classed('lineChart', true)
            .attr('clip-path', 'url(#clip)')

        lineChart
            .selectAll('.line')
            .data(data)
            .join('path')
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-width', 1.5)
            .attr('d', linePath(data))

        lineChart
            .selectAll('.brush')
            .data([null])
            .join('g')
            .classed('brush', true)
            .call(brush)

        svg
            .on('dblclick', function () {
                xScale.domain(d3.extent(xData))

                xAxis.ticks(d3.timeYear.every(5))

                svg
                    .selectAll('.x-axis')
                    .transition(1000)
                    .call(xAxis)
                    .selectAll("text")
                    .attr("transform", "translate(0, 0)rotate(-30)")
                    .style("text-anchor", "end")
                    .style('font-size', '13px')
                    .attr('fill', 'white')

                lineChart
                    .selectAll('.line')
                    .transition(700)
                    .attr('d', linePath(data))
            })

    }

    useEffect(() => {
        createSvg()
    }, [])

    useEffect(() => {
        drawChart()
    }, [data])

    useEffect(() => {
        reSizeSvg()
        drawChart()
    }, [bodyWidth])

    return (
        <>
            <div className="filmYearLineChart relative"></div>
        </>
    )
}