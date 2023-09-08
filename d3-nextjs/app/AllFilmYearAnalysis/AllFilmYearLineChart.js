'use client'

import { useEffect, useState } from "react"
import * as d3 from 'd3'

export default function AllFilmYearLineChart({ bodyWidth, data, width, height, margin, handleChartBrushExtent, brushToChartExtent, brushDoubleClick }) {
    const pathColor = '#ADD8E6', pathFocusColor = '#66FFE6'
    const focusMargin = 10
    // console.log(brushExtent)

    const filterData = data.filter((d) => d.amount > 0)
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

    const linePath = d3.line()
        .x((d) => xScale(new Date(d.year)))
        .y((d) => yScale(parseInt(d.amount)))
        .curve(d3.curveLinear)
        .defined((d) => d.amount > 0)

    const brush = d3.brushX()
        .extent([[0, 0], [width, height]])
        .on('end', updateChart)

    const createSvg = () => {

        d3.select(".filmYearLineChart svg").remove();

        d3.select(".filmYearLineChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    }

    const reSizeSvg = () => {

        d3.select(".filmYearLineChart svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    };

    const drawChart = () => {

        const svg = d3.select(".filmYearLineChart svg g");

        svg.select('defs').remove()
        svg.select('.line-chart').remove()
        svg.select('.yAxis-label').remove()
        d3.select('.focus-text').remove()

        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeYear.every(5))
            // .tickValues(xScale.ticks().concat(d3.extent(xData)))
            .tickFormat((d) => d3.timeFormat('%Y')(d) + '年')

        svg.selectAll('.x-axis')
            .data([null])
            .join("g")
            .classed('x-axis', true)
            .attr("transform", `translate(0, ${height})`)
            .transition()
            .duration(500)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(0, 0)rotate(-30)")
            .style("text-anchor", "end")
            .style('font-size', '13px')
            .attr('fill', 'white')

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

        const clip = svg.append('defs')
            .append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)

        const lineChart = svg.append('g')
            .attr('clip-path', 'url(#clip)')
            .attr('class', 'line-chart')

        lineChart
            .append('path')
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', pathColor)
            .attr('stroke-width', 1.5)
            .attr('d', d => linePath(data))

        lineChart
            .append('path')
            .attr('class', 'dash-line')
            .attr('fill', 'none')
            .attr('stroke', pathColor)
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', 4.4)
            .attr('d', d => linePath(filterData))

        const focusCircle = lineChart
            .append('g')
            .append('circle')
            .attr('class', 'focus-circle')
            .style('fill', 'none')
            .style('stroke', pathFocusColor)
            .attr('r', 6)
            .style('opacity', 0)

        const focusText = d3.select(".filmYearLineChart")
            .append('div')
            .attr('class', 'focus-text')
            .classed('bg-gray-100/75', true)
            .style('position', 'absolute')
            .style('display', 'none')

        lineChart
            .append('g')
            .attr('class', 'brush')
            .style('pointer-events', 'all')
            .style('cursor', 'pointer')
            .call(brush)
            .on('mouseover', handleMouseOver)
            .on('mousemove', handleMouseMove)
            .on('mouseout', handleMouseOut)

        svg.on('dblclick', handleDoubleClick)

    }

    function updateChart(e) {
        const svg = d3.select(".filmYearLineChart svg g");
        const lineChart = d3.select('.line-chart')
        const bisect = d3.bisector(d => d.year).left

        if (e && e.selection) {
            const extent = e.selection
            const extent0Data = data[bisect(data, (xScale.invert(extent[0]).getYear() + 1900).toString())]
            const extent1Data = data[bisect(data, (xScale.invert(extent[1]).getYear() + 1900).toString())]
            const extent0DataIndex = data.indexOf(extent0Data)
            const extent1DataIndex = data.indexOf(extent1Data)

            const x1Data = new Date(extent0Data.year)
            const x2Data = new Date(extent1Data.year)

            handleChartBrushExtent([x1Data, x2Data])

            const xAxis = d3.axisBottom(xScale)
                .tickFormat((d) => d3.timeFormat('%Y')(d) + '年')

            if (extent1DataIndex - extent0DataIndex >= (data.length * 0.3))
                xAxis.ticks(d3.timeYear.every(5))
            else if (extent1DataIndex - extent0DataIndex >= (data.length * 0.15))
                xAxis.ticks(d3.timeYear.every(2))
            else
                xAxis.ticks(d3.timeYear.every(1))

            xScale.domain([x1Data, x2Data])

            svg
                .selectAll('.x-axis')
                .transition()
                .duration(500)
                .ease(d3.easeQuadOut)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "translate(0, 0)rotate(-30)")
                .style("text-anchor", "end")
                .style('font-size', '13px')
                .attr('fill', 'white')

            const yData = data.filter((value, index) => {
                if (index >= extent0DataIndex && index <= extent1DataIndex)
                    return value
            }).map((d) => d.amount)

            const yAxis = d3.axisLeft(yScale)

            yScale.domain([d3.min(yData) * 0.995, d3.max(yData) * 1.1]).nice()

            svg
                .selectAll('.y-axis')
                .transition()
                .duration(500)
                .ease(d3.easeQuadOut)
                .call(yAxis)
                .selectAll('text')
                .style('font-size', '13px')
                .attr('fill', 'white')

            lineChart.select('.brush').call(brush.move, null)

            lineChart
                .selectAll('.line')
                .transition()
                .duration(500)
                .ease(d3.easeQuadOut)
                .attr('d', d => linePath(data))

            lineChart
                .selectAll('.dash-line')
                .transition()
                .duration(500)
                .ease(d3.easeQuadOut)
                .attr('d', d => linePath(filterData))
        }
    }

    function handleMouseOver() {
        d3.select('.focus-circle').style('opacity', 1)
        d3.select('.focus-text').style('display', 'block')
    }

    function handleMouseMove(e) {

        d3.select('.dashed-x').remove()
        d3.select('.dashed-y').remove()

        const svg = d3.select(".filmYearLineChart svg g");

        const x = (xScale.invert(d3.pointer(e, this)[0] + focusMargin).getYear() + 1900).toString() //Date轉成西元年

        const bisect = d3.bisector(d => d.year).left

        const focusCircleData = data[bisect(data, x)]

        if (focusCircleData && focusCircleData.amount != 0) {
            d3.select('.focus-circle').style('opacity', 1)

            const y = focusCircleData.amount

            d3.select('.focus-circle')
                .attr('cx', xScale(new Date(x)))
                .attr('cy', yScale(y))

            d3.select('.focus-text')
                .style('display', 'block')
                .style('left', xScale(new Date(x)) + 50 + 'px')
                .style('top', yScale(y) + 'px')
                .text(`
                    ${x}年,
                    ${y}部
                `)

            svg.append('line')
                .attr('class', 'dashed-x')
                .attr('x1', xScale(new Date(x)))
                .attr('y1', height)
                .attr('x2', xScale(new Date(x)))
                .attr('y2', yScale(y))
                .style('stroke', 'white')
                .style('stroke-width', '2px')
                .style('stroke-dasharray', '5')

            svg.append('line')
                .attr('class', 'dashed-y')
                .attr('x1', 0)
                .attr('y1', yScale(y))
                .attr('x2', xScale(new Date(x)))
                .attr('y2', yScale(y))
                .style('stroke', 'white')
                .style('stroke-width', '2px')
                .style('stroke-dasharray', '5')

        } else {
            d3.select('.focus-circle').style('opacity', 0)
            d3.select('.focus-text').style('display', 'none')
        }
    }

    function handleMouseOut() {
        d3.select('.focus-circle').style('opacity', 0)
        d3.select('.focus-text').style('display', 'none')
        d3.select('.dashed-x').remove()
        d3.select('.dashed-y').remove()
    }

    function handleDoubleClick() {
        const svg = d3.select(".filmYearLineChart svg g");

        const lineChart = d3.select('.line-chart')

        xScale.domain(d3.extent(xData))

        const xAxis = d3.axisBottom(xScale)
            .ticks(d3.timeYear.every(5))
            .tickFormat((d) => d3.timeFormat('%Y')(d) + '年')

        yScale.domain([0, d3.max(yData) * 1.1]).nice()

        const yAxis = d3.axisLeft(yScale)

        svg
            .selectAll('.x-axis')
            .transition()
            .duration(500)
            .ease(d3.easeQuadOut)
            .call(xAxis)
            .selectAll("text")
            .attr("transform", "translate(0, 0)rotate(-30)")
            .style("text-anchor", "end")
            .style('font-size', '13px')
            .attr('fill', 'white')

        svg
            .selectAll('.y-axis')
            .transition()
            .duration(500)
            .ease(d3.easeQuadOut)
            .call(yAxis)
            .selectAll('text')
            .style('font-size', '13px')
            .attr('fill', 'white')

        lineChart
            .selectAll('.line')
            .transition()
            .duration(500)
            .ease(d3.easeQuadOut)
            .attr('d', linePath(data))

        lineChart
            .select('.dash-line')
            .transition()
            .duration(500)
            .ease(d3.easeQuadOut)
            .attr('d', linePath(filterData))

        handleChartBrushExtent([0, width])
    }

    function handleBrushToChartExtent(e) {
        const svg = d3.select(".filmYearLineChart svg g");
        const lineChart = d3.select('.line-chart')
        const bisect = d3.bisector(d => d.year).left

        if (e && e.selection) {
            const extent = e.selection
            const extent0Data = data[bisect(data, (xScale.invert(extent[0]).getYear() + 1900).toString())]
            const extent1Data = data[bisect(data, (xScale.invert(extent[1]).getYear() + 1900).toString())]
            const extent0DataIndex = data.indexOf(extent0Data)
            const extent1DataIndex = data.indexOf(extent1Data)

            const x1Data = new Date(extent0Data.year)
            const x2Data = new Date(extent1Data.year)

            const xAxis = d3.axisBottom(xScale)
                .tickFormat((d) => d3.timeFormat('%Y')(d) + '年')

            if (extent1DataIndex - extent0DataIndex >= (data.length * 0.3))
                xAxis.ticks(d3.timeYear.every(5))
            else if (extent1DataIndex - extent0DataIndex >= (data.length * 0.15))
                xAxis.ticks(d3.timeYear.every(2))
            else
                xAxis.ticks(d3.timeYear.every(1))

            xScale.domain([x1Data, x2Data])

            svg
                .selectAll('.x-axis')
                .transition()
                .duration(500)
                .ease(d3.easeQuadOut)
                .call(xAxis)
                .selectAll("text")
                .attr("transform", "translate(0, 0)rotate(-30)")
                .style("text-anchor", "end")
                .style('font-size', '13px')
                .attr('fill', 'white')

            const yData = data.filter((value, index) => {
                if (index >= extent0DataIndex && index <= extent1DataIndex)
                    return value
            }).map((d) => d.amount)

            const yAxis = d3.axisLeft(yScale)

            yScale.domain([d3.min(yData) * 0.995, d3.max(yData) * 1.1]).nice()

            svg
                .selectAll('.y-axis')
                .transition()
                .duration(500)
                .ease(d3.easeQuadOut)
                .call(yAxis)
                .selectAll('text')
                .style('font-size', '13px')
                .attr('fill', 'white')

            lineChart.select('.brush').call(brush.move, null)

            lineChart
                .selectAll('.line')
                .transition()
                .duration(500)
                .ease(d3.easeQuadOut)
                .attr('d', d => linePath(data))

            lineChart
                .selectAll('.dash-line')
                .transition()
                .duration(500)
                .ease(d3.easeQuadOut)
                .attr('d', d => linePath(filterData))
        }
    }

    useEffect(() => {
        createSvg()
    }, [])

    useEffect(() => {
        reSizeSvg()
        drawChart()
    }, [data, bodyWidth])

    useEffect(() => {
        handleBrushToChartExtent(brushToChartExtent)
    }, [brushToChartExtent])

    return (
        <>

        </>
    )
}