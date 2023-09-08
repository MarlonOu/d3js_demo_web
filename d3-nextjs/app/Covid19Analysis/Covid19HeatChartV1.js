'use client'

import { useEffect, useState } from "react"
import * as d3 from 'd3'
import colors from "../ColorList"
import './Covid19HeatChart.css'

export default function Covid19HeatChart({ bodyWidth, data, width, height, margin, dataType, handleDataOfBrushSelected }) {
    let isDragging = false;
    let startX = null;
    let endX = null;
    const yAxisMargin = 15;
    const colorInfoRectSize = 20;

    const xData = Array.from(new Set(data.map(d => d.date)));

    const yData = Array.from(new Set(data.map(d => d.country)));

    const xScale = d3.scaleBand()
        .domain(xData)
        .range([margin.left, width])

    const xAxis = d3.axisBottom(xScale)
        .tickFormat((d) => d.substring(5))

    const yScale = d3.scaleBand()
        .domain(yData)
        .range([height, 0])
        .padding(.01)

    const yAxis = d3.axisLeft(yScale)
        .ticks(width > 720 ? 10 : 5)

    const color = d3.scaleQuantize()
        .domain([1, d3.max(data.map(d => d[dataType]))])
        .range(colors.severityColor)

    const brush = d3.brushX()
        .extent([[margin.left, 0], [width, height]])
        .on('end', updateChart)

    const createSvg = () => {

        d3.selectAll(".covid19-heat-chart svg").remove();

        d3.select(".covid19-heat-chart")
            .append('svg')
            .attr('class', 'color-info')
            .attr("width", width + margin.left + margin.right)
            .attr('height', colorInfoRectSize * 6)

        d3.select(".covid19-heat-chart")
            .append("svg")
            .attr('class', 'heat-chart')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append('rect')
            .attr('class', 'rect-background')
            .attr("width", width - margin.left)
            .attr("height", height)
            .attr('transform', `translate(${margin.left + margin.right}, ${margin.top})`)

        d3.select(".covid19-heat-chart .heat-chart")
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

    }

    const reSizeSvg = () => {

        d3.select(".covid19-heat-chart .heat-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .select('.rect-background')
            .attr("width", width - margin.left)
            .attr("height", height)
    };

    const createColorInfo = () => {
        const colorInfo = d3.select('.color-info');

        colorInfo
            .append('g')
            .attr('class', 'color-info-data-type')
            .attr('transform', `translate(${margin.left * 2 + colorInfoRectSize + 5}, ${margin.top - 5})`)

        colorInfo
            .append('g')
            .attr('class', 'color-info-rect-background')
            .attr('transform', `translate(${margin.left * 2}, ${margin.top})`)

        colorInfo
            .append('g')
            .attr('class', 'color-info-rect')
            .attr('transform', `translate(${margin.left * 2}, ${margin.top})`)

        colorInfo
            .append('g')
            .attr('class', 'color-info-data')
            .attr('transform', `translate(${margin.left * 2 + colorInfoRectSize + 5}, ${margin.top + colorInfoRectSize - 5})`)
    }

    const createFunctionalBlock = () => {
        const svg = d3.select(".covid19-heat-chart .heat-chart g");

        svg
            .selectAll('.heatmap-brush')
            .data([null])
            .join('g')
            .attr('class', 'heatmap-brush z-50')
            .style('pointer-events', 'all')
            .style('cursor', 'pointer')
            .attr('display', 'none')
            .call(brush)

        svg
            .selectAll('.heatmap-drag')
            .data([null])
            .join('g')
            .attr('class', 'heatmap-drag z-50')
            .style('pointer-events', 'all')
            .style('cursor', 'grab')
            .attr('display', 'none')
            .append('rect')
            .attr("width", width - margin.left)
            .attr("height", height)
            .attr('fill', 'none')
            .attr('transform', `translate(${margin.left}, 0)`)
            .on('mousedown', handleMouseDown)
            .on('mousemove', handleDragMouseMove)
            .on('mouseup', handleMouseUp)
    }

    const drawColorInfo = () => {
        const c1 = color.invertExtent(colors.severityColor[0]);
        const c2 = color.invertExtent(colors.severityColor[1]);
        const c3 = color.invertExtent(colors.severityColor[2]);
        const c4 = color.invertExtent(colors.severityColor[3]);

        const colorRange1 = [c1[0], Math.floor(c1[1])];
        const colorRange2 = [Math.ceil(c2[0]), Math.floor(c2[1]) - 1];
        const colorRange3 = [Math.ceil(c3[0]), Math.floor(c3[1]) - 1];
        const colorRange4 = [Math.ceil(c4[0]), Math.floor(c4[1]) - 1];

        const colorRangeData = [colorRange1, colorRange2, colorRange3, colorRange4];

        const colorInfo = d3.select('.color-info');

        colorInfo
            .select('.color-info-data-type')
            .selectAll('text')
            .data([dataType])
            .join(
                enter => enter.append('text')
                    .attr('x', 0)
                    .attr('y', 0)
                    .transition()
                    .duration(250)
                    .attr('opacity', 0)
                    .transition()
                    .duration(250)
                    .attr('fill', 'white')
                    .text(d => `${d}`)
                    .attr('opacity', 1),
                update => update
                    .transition()
                    .duration(250)
                    .attr('opacity', 0)
                    .transition()
                    .duration(500)
                    .text(d => `${d}`)
                    .attr('opacity', 1),
                exit => exit
                    .remove()
            )

        colorInfo
            .select('.color-info-rect-background')
            .selectAll('rect')
            .data(colorRangeData)
            .join('rect')
            .attr('class', 'rect-background')
            .attr('x', 0)
            .attr('y', (d, i) => (colorInfoRectSize * (i)))
            .attr('width', colorInfoRectSize)
            .attr('height', colorInfoRectSize)

        colorInfo
            .select('.color-info-rect')
            .selectAll('rect')
            .data(colorRangeData)
            .join('rect')
            .attr('x', 0)
            .attr('y', (d, i) => (colorInfoRectSize * (i)))
            .attr('width', colorInfoRectSize)
            .attr('height', colorInfoRectSize)
            .attr('fill', d => color(d[0]))

        colorInfo
            .select('.color-info-data')
            .selectAll('text')
            .data(colorRangeData)
            .join(
                enter => enter.append('text')
                    .attr('x', 0)
                    .attr('y', (d, i) => (colorInfoRectSize * (i)))
                    .transition()
                    .duration(250)
                    .attr('opacity', 0)
                    .transition()
                    .duration(250)
                    .attr('fill', 'white')
                    .text(d => `
                    ${d[0]}~${d[1]}
                `).attr('opacity', 1),
                update => update
                    .transition()
                    .duration(250)
                    .attr('opacity', 0)
                    .attr('x', 0)
                    .attr('y', (d, i) => (colorInfoRectSize * (i)))
                    .transition()
                    .duration(250)
                    .text(d => `${d[0]}~${d[1]}`)
                    .attr('opacity', 1),
                exit => exit
                    .remove()
            )

    }

    const drawChart = () => {

        const svg = d3.select(".covid19-heat-chart .heat-chart g");

        d3.selectAll('defs').remove();

        svg.selectAll('.heatmap-rect')
            .on('mouseover', function () { })
            .on('mousemove', function () { })
            .on('mouseleave', function () { })
            .on('dblclick', function () { });

        let x = svg.selectAll('.x-axis')

        if (x.empty()) {
            x = svg.insert("g", "g")
                .classed('x-axis', true)
        }
        x
            .attr("transform", `translate(0, ${height})`)
            .transition()
            .duration(500)
            .call(xAxis)

        x
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style('font-size', '13px')
            .attr('fill', 'white')

        x
            .selectAll("path")
            .attr('stroke', colors.lineColor)

        x
            .selectAll("line")
            .attr('color', colors.lineColor)

        let y = svg.selectAll('.y-axis')

        if (y.empty()) {
            y = svg.insert("g", "g")
                .classed('y-axis', true)
        }

        y
            .attr("transform", `translate(${margin.left}, 0)`)
            .transition()
            .duration(500)
            .call(yAxis)

        y
            .selectAll('text')
            .attr("transform", `translate(0, -${yAxisMargin}) rotate(-30)`)
            .style("text-anchor", "end")
            .style('font-size', '13px')
            .attr('fill', 'white')

        y
            .selectAll("path")
            .attr('stroke', colors.lineColor)

        y
            .selectAll("line")
            .attr('color', colors.lineColor)

        let chart = svg.selectAll('.heatmap-g')

        if (chart.empty()) {
            chart = svg.insert('g', () => d3.select('.heatmap-brush').node())
                .attr('class', 'heatmap-g')
                .attr('clip-path', 'url(#clip)')
        }

        chart
            .selectAll('rect')
            // .data(data)
            // .data(data, d => d.date + ':' + d.country)
            .data(data, function (d) {
                return d.date + ':' + d.country
            })
            .join(
                enter => enter.append('rect')
                    .attr('class', 'heatmap-rect')
                    .attr("x", d => xScale(d.date))
                    .attr("y", d => yScale(d.country))
                    .attr("width", xScale.bandwidth())
                    .attr("height", yScale.bandwidth())
                    // .style("fill", color.lineColor)
                    .transition()
                    .duration(500)
                    .style("fill", d => color(d[dataType]))
                    .on('end', function () {
                        d3.select(this)
                            .on('mouseover', handleMouseOver)
                            .on('mousemove', handleMouseMove)
                            .on('mouseleave', handleMouseLeave)
                            .on('dblclick', handleMouseDoubleClick);
                    }),

                update => update
                    .transition()
                    .duration(500)
                    .attr('x', d => xScale(d.date))
                    .attr('y', d => yScale(d.country))
                    .attr('width', xScale.bandwidth())
                    .attr('height', yScale.bandwidth())
                    .style('fill', d => color(d[dataType]))
                    .on('end', function () {
                        d3.select(this)
                            .on('mouseover', handleMouseOver)
                            .on('mousemove', handleMouseMove)
                            .on('mouseleave', handleMouseLeave)
                            .on('dblclick', handleMouseDoubleClick);
                    }),

                exit => exit
                    .transition(500)
                    .attr('y', height)
                    .attr('height', 0)
                    .remove()
            );

        const clip = svg.append('defs')
            .append('clipPath')
            .attr('id', 'heatmap-clip')
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)

        d3.select(".covid19-heat-chart .tooltip").remove();
        const tooltip = d3.select('.covid19-heat-chart')
            .append('div')
            .attr('class', 'tooltip')
            .classed('bg-gray-100/75', true)
            .style('display', 'none')
            .style('position', 'absolute');

        d3.select(window)
            .on('keydown', handleKeyDown)
            .on('keyup', handleKeyUp);
    }

    function updateChart(e) {
        const selectedExtent = e.selection;

        if (!selectedExtent) {
            return;
        }

        // 使用选择范围来确定筛选后的数据
        const xStartIndex = Math.floor((selectedExtent[0] - margin.left) / xScale.bandwidth());
        const xEndIndex = Math.ceil((selectedExtent[1] - margin.left) / xScale.bandwidth()) - 1;

        // const filteredDates = xData.slice(xStartIndex, xEndIndex + 1);
        const xStart = xData[xStartIndex];
        const xEnd = xData[xEndIndex];
        d3.select(".heatmap-brush").call(brush.move, null);
        handleDataOfBrushSelected(null, [xStart, xEnd]);

    }

    function handleTooltipEvent(e, pt) {
        return (
            d3.select('.covid19-heat-chart .tooltip')
                .style('display', 'block')
                .style('left', pt[0] + 60 + 'px')
                .style('top', pt[1] + 120 + 'px')
                .text(`
                ${e.target.__data__.date},
                ${e.target.__data__.country},
                ${e.target.__data__[dataType]}人
            `)
        )
    }

    function handleMouseOver(e) {
        const pt = d3.pointer(e);

        d3.selectAll('.focus')
            .transition()
            .duration(100)
            .attr('class', 'heatmap-rect')

        d3.select(this)
            .transition()
            .duration(100)
            .attr('class', 'heatmap-rect focus')

        handleTooltipEvent(e, pt);
    }

    function handleMouseMove(e) {
        const pt = d3.pointer(e)

        handleTooltipEvent(e, pt);
    }

    function handleMouseLeave(e) {

        if (d3.select(this).classed('focus') == true) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('class', '')
        }

        d3.select('.covid19-heat-chart .tooltip')
            .style('display', 'none')
    }
    function handleMouseDown(e) {
        d3.select(this)
        .style('cursor', 'grabbing')
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
    }

    function handleDragMouseMove(e, data) {
        if (isDragging) {
            e.preventDefault();
            endX = e.clientX;

            if (startX !== null && endX !== null) {
                console.log(data);
                const deltaX = endX - startX;
                const bandWidth = xScale.bandwidth();
                if (Math.abs(deltaX) >= bandWidth) {
                    const deltaBand = Math.floor(deltaX / bandWidth);
                    console.log([data[0].date, data[xData.length - 1].date]);
                    // handleDataOfBrushSelected(deltaBand, [xData[0], xData[xData.length - 1]]);
                }
            }
        }
    }

    function handleMouseUp(e) {
        d3.select(this)
        .style('cursor', 'grab')
        if (isDragging) {
            isDragging = false;
            startX = null;
            endX = null;
        }
    }

    function handleKeyDown(e) {
        if (e.altKey || e.metaKey) {
            d3.select('.heatmap-brush')
                .attr('display', 'block')
        }
        if (e.shiftKey) {
            d3.select('.heatmap-drag')
                .attr('display', 'block')
        }
    }

    function handleKeyUp() {
        d3.select('.heatmap-brush')
            .attr('display', 'none')

        d3.select('.heatmap-drag')
            .attr('display', 'none')
    }

    function handleMouseDoubleClick() {
        handleDataOfBrushSelected(null, [null, null]);
    }

    useEffect(() => {
        createSvg();
        createColorInfo();
        createFunctionalBlock();
    }, [])

    useEffect(() => {
        reSizeSvg();
        drawColorInfo();
        drawChart();
    }, [data, bodyWidth])

    return (
        <>

        </>
    )
}