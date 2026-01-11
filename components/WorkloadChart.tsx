
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface WorkloadChartProps {
  data: number[];
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

    const x = d3.scaleBand()
      .domain(days)
      .range([0, width])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data) || 10])
      .nice()
      .range([height, 0]);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('class', 'text-slate-500 font-medium');

    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text')
      .attr('class', 'text-slate-500 font-medium');

    g.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'fill-indigo-500 hover:fill-indigo-600 transition-colors duration-200 cursor-pointer')
      .attr('x', (_, i) => x(days[i]) || 0)
      .attr('y', height)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('rx', 4)
      .transition()
      .duration(800)
      .attr('y', d => y(d))
      .attr('height', d => height - y(d));

    // Tooltips or values on top
    g.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .text(d => d)
      .attr('x', (_, i) => (x(days[i]) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d) - 5)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs font-bold fill-indigo-800');

  }, [data]);

  return (
    <div className="w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wider">Mật độ tiết giảng theo thứ</h3>
      <svg ref={svgRef} className="w-full h-[300px]"></svg>
    </div>
  );
};

export default WorkloadChart;
