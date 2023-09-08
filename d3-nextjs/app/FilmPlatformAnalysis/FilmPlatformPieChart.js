'use client'

import { useEffect, useState } from "react"
import * as d3 from 'd3'
import './FilmPlatformPieChart.css'

export default function FilmPlatformPieChart({ bodyWidth, data, width, height, margin, handlePieChartFocusSlice }) {

    const focusSliceTranslate = 3,
        focusSliceTransitionTime = 100

    const dataTotal = d3.sum(data, d => d.amount)

    const dataPercentage = data.map(d => Math.round((d.amount / dataTotal) * 100))

    const pieChart = d3.pie()
        .value(d => d.amount)
        .sort(function (a, b) {
            return d3.ascending(a.key, b.key)
        })

    const color = {
        'Prime Video': "#fbb4ae",
        'Disney+': "#b3cde3",
        'Netflix': "#ccebc5",
        'Hulu': "#decbe4"
    };

    const createSvg = () => {

        d3.select(".filmPlatformPieChart svg").remove();

        d3.select(".filmPlatformPieChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    }

    const reSizeSvg = () => {

        d3.select(".filmPlatformPieChart svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    };

    const drawChart = () => {

        const svg = d3.select(".filmPlatformPieChart svg g");

        svg.select('.slices').remove()

        const radius = Math.min(width, height) * .55

        const arc = d3.arc()
            .innerRadius(radius / 2)
            .outerRadius(radius)
            .cornerRadius(radius * .05)
            .padAngle(.05)

        const pieData = pieChart(data)

        const pieSlices = svg.append('g')
            .attr('class', 'slices')
            .attr("transform", `translate(${width / 2}, ${height / 2})`)

        const pie = pieSlices
            .selectAll('g')
            .data(pieData)
            .join(
                enter => enter.append('g')
                    .attr('class', 'arc')
            )

        pie
            .append('path')
            .attr('d', arc)
            .attr('fill', d => color[d.data.platformName])
            .style('opacity', 1)

        const arcText = d3.arc()
            .innerRadius(radius)
            .outerRadius(radius - width / 5)

        const pieText = pie
            .append('text')
            .attr('class', 'font-bold')
            .attr('transform', d => `translate(${arcText.centroid(d)})`)
            .text(d => `
                        ${d.data.platformName}
                        ${dataPercentage[d.index]}%
                    `)

        d3.select(".filmPlatformPieChart .tooltip").remove();
        const tooltip = d3.select('.filmPlatformPieChart')
            .append('div')
            .attr('class', 'tooltip')
            .classed('bg-gray-100/75', true)
            .style('display', 'none')
            .style('position', 'absolute')

        pie
            .on('mouseover', handleMouseOver)
            .on('mousemove', handleMouseMove)
            .on('mouseleave', handleMouseLeave)
            .on('click', handleClick)

        d3.select('.filmPlatformPieChart')
            .on('click', handleSvgClick)

    }

    function handleMouseOver(e) {

        if (!d3.select(this).classed('click-focus-slice')) {
            d3.select(this)
                .classed('focus-slice', true)
                .transition()
                .duration(focusSliceTransitionTime)
                .attr('transform', `translate(${focusSliceTranslate}, -${focusSliceTranslate})`)
                .select('path')
                .attr('class', 'focus-path')

            d3.select(this)
                .select('text')
                .classed('drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.8)]', true)
        }

        d3.select(".filmPlatformPieChart .tooltip")
            .style('display', 'block')

    }

    function handleMouseMove(e) {
        const pt = d3.pointer(e, d3.select('.filmPlatformPieChart svg g').node())

        d3.select(".filmPlatformPieChart .tooltip")
            .style('left', pt[0] + 50 + 'px')
            .style('top', pt[1] + 20 + 'px')
            .text(`
                    ${e.target.__data__.data.amount}部
                `)

    }

    function handleMouseLeave() {

        if (d3.select(this).classed('focus-slice')) {
            d3.select(this)
                .classed('focus-slice', false)
                .transition()
                .duration(focusSliceTransitionTime)
                .attr('transform', `translate(0, 0)`)
                .select('path')
                .attr('class', 'normal-path')

            d3.select(this)
                .select('text')
                .classed('drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.8)]', false)
        }

        d3.select(".filmPlatformPieChart .tooltip")
            .style('display', 'none')

    }

    function handleClick(e) {

        e.stopPropagation();

        const clickFocusSlice = d3.select('.click-focus-slice')._groups[0][0]

        if (clickFocusSlice && clickFocusSlice != this) {
            d3.select('.filmPlatformPieChart .click-focus-slice')
                .classed('click-focus-slice', false)
                .transition()
                .duration(focusSliceTransitionTime)
                .attr('transform', `translate(0, 0)`)
                .select('path')
                .attr('class', 'normal-path')

            d3.select(this)
                .select('text')
                .classed('drop-shadow-[0_1.2px_1.2px_rgba(255,255,255,0.8)]', false)
        }

        if (d3.select(this).classed('click-focus-slice')) {
            d3.select(this)
                .classed('click-focus-slice', false)
                .classed('focus-slice', true)
                .transition()
                .duration(focusSliceTransitionTime)
                .select('path')
                .attr('class', 'focus-path')

            handlePieChartFocusSlice('none movie')

        } else {
            d3.select(this)
                .classed('focus-slice', false)
                .classed('click-focus-slice', true)
                .transition()
                .duration(focusSliceTransitionTime)
                .select('path')
                .attr('class', 'click-focus-path')

            handlePieChartFocusSlice(e.target.__data__.data.platformName)
        }

    }

    function handleSvgClick(e) {

        const clickFocusSlice = d3.select('.click-focus-slice')._groups[0][0]
        if (clickFocusSlice) {
            d3.select('.click-focus-slice').classed('click-focus-slice', false)
                .transition()
                .duration(focusSliceTransitionTime)
                .attr('transform', `translate(0, 0)`);
            d3.select('.click-focus-path').attr('class', 'normal-path');

            handlePieChartFocusSlice('none movie')
        }

    }

    useEffect(() => {
        createSvg()
    }, [])

    useEffect(() => {
        reSizeSvg()
        drawChart()

    }, [data, bodyWidth])

    return (
        <>

        </>
    )
}