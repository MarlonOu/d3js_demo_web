'use client'

import { useEffect, useState } from "react"
import * as d3 from 'd3'

export default function FilmPlatformBarChart({ bodyWidth, data, width, height, margin }) {

    const innerRadius = Math.min(width, height) * .3,
        outerRadius = Math.min(width, height) / 2;

    const stackData = d3.stack()
        .keys(d3.union(data.map(d => d.platform)))
        .value(([, D], key) => D.get(key).amount)
        (d3.index(data, d => d.year, d => d.platform));

    const x = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, 2 * Math.PI])
        .align(0)

    const y = d3.scaleRadial()
        .domain([0, d3.max(stackData, d => d3.max(d, d => d[1]))])
        .range([innerRadius, outerRadius])

    const initY = d3.scaleRadial()
        .domain([0, 0])
        .range([innerRadius, outerRadius])

    const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

    const arc = d3.arc()
        .innerRadius(d => y(d[0]))
        .outerRadius(d => y(d[1]))
        .startAngle(d => x(d.data[0]))
        .endAngle(d => x(d.data[0]) + x.bandwidth())
        .padAngle(1.5 / innerRadius)
        .padRadius(innerRadius)

    const initArc = d3.arc()
        .innerRadius(d => y(d[0]))
        .outerRadius(innerRadius)
        .startAngle(d => x(d.data[0]))
        .endAngle(d => x(d.data[0]) + x.bandwidth())
        .padAngle(1.5 / innerRadius)
        .padRadius(innerRadius)

    const color = {
        'Prime Video': "#fbb4ae",
        'Disney+': "#b3cde3",
        'Netflix': "#ccebc5",
        'Hulu': "#decbe4"
    };

    const createSvg = () => {

        d3.select(".filmPlatformBarChart svg").remove();

        d3.select(".filmPlatformBarChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);
    }

    const reSizeSvg = () => {

        d3.select(".filmPlatformBarChart svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
    };

    const drawChart = () => {

        const svg = d3.select(".filmPlatformBarChart svg g");

        svg.selectAll('.x-axis').remove()
        svg.selectAll('.y-axis').remove()
        svg.selectAll('.barChartText').remove()

        svg
            .attr('transform', `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`);

        const barChart = svg
            .selectAll('g')
            .data(stackData, d => d.key)
            .join('g')
            .attr('class', 'bar-chart')
            .attr("fill", d => color[d.key])
            .selectAll("path")
            .data(D => D.map(d => (d.keys = D.key, d)))
            .join(
                enter => enter.append('path')
                    .transition()
                    .duration(500)
                    .attr("d", arc),

                update => update
                    .transition()
                    .duration(500)
                    .attr("d", arc),

                exit => exit
                    .transition()
                    .duration(300)
                    .attr('d', initArc)
                    .remove()
            )
            .append("title")
            .text(d => `${d.data[0]} ${d.keys}\n${formatValue(d.data[1].get(d.keys).amount)}`)

        const xAxis = svg.append("g")
            .classed('x-axis', true)
            .attr("text-anchor", "middle")
            .selectAll()
            .data(x.domain())
            .join("g")
            .attr("transform", d => `
                rotate(${((x(d) + x.bandwidth() / 2) * 180 / Math.PI - 90)})
                translate(${innerRadius},0)
            `)
            .call(g => g.append("line")
                .transition()
                .duration(500)
                .attr("x2", -5)
                .attr("stroke", "#000"))
            .call(g => g.append("text")
                .attr("transform", d => (x(d) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI
                    ? "rotate(90)translate(0,25)"
                    : "rotate(-90)translate(0,-15)")
                .text(d => {
                    if (d % 10 == 0)
                        return d
                }));

        const yAxis = svg.append('g')
            .classed('y-axis', true)
            .attr("text-anchor", "middle")

        yAxis
            .append("text")
            .attr("y", d => -y(y.ticks(5).pop()))
            .attr("dy", "-1em")
            .text("部/年")

        yAxis
            .selectAll("g")
            .data(y.ticks(5).slice(1))
            .join(
                enter => enter.append('g')
                    .attr('class', 'y-axis-g')
                    .attr("fill", "none")
                    .append("circle")
                    .transition()
                    .duration(500)
                    .attr("stroke", "#DEDEDE")
                    .attr("stroke-opacity", 0.5)
                    .attr("r", y),

                update => update
                .transition()
                .duration(500)
                .attr("r", y),

                exit => exit
                .transition()
                .duration(500)
                .attr("r", initY)
            )
        
        d3.selectAll('.y-axis-g')
            .append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .attr("stroke", "#fff")
            .attr("stroke-width", 5)
            .text(y.tickFormat(5, "s"))
        
        d3.selectAll('.y-axis-g')
            .append("text")
            .attr("y", d => -y(d))
            .attr("dy", "0.35em")
            .attr("stroke", "none")
            .attr("stroke-width", 5)
            .attr("fill", "#000")
            .text(y.tickFormat(5, "s"))
            .attr("fill", "#000")
            
            

        const barChartText = svg.append("g")
            .classed('barChartText', true)
            .selectAll()
            .data(stackData)
            .join("g")
            .attr("transform", (d, i, nodes) => `translate(-40,${(nodes.length / 2 - i - 1) * 20})`)
            .call(g => g.append("rect")
                .transition()
                .duration(200)
                .attr("width", 18)
                .attr("height", 18)
                .attr("fill", d => color[d.key]))
            .call(g => g.append("text")
                .transition()
                .duration(200)
                .attr("x", 24)
                .attr("y", 9)
                .attr("dy", "0.35em")
                .text(d => d.key));

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