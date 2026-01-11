
/**
 * Renders a bar chart into the specified container using D3.js
 */
export const renderWorkloadChart = (containerId, data) => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  // Clear existing
  container.innerHTML = '';

  const margin = { top: 30, right: 20, bottom: 40, left: 40 };
  const width = container.clientWidth - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3.select(`#${containerId}`)
    .append('svg')
    .attr('width', '100%')
    .attr('height', 300)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];

  const x = d3.scaleBand()
    .domain(days)
    .range([0, width])
    .padding(0.3);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data) || 10])
    .nice()
    .range([height, 0]);

  // X Axis
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('class', 'text-slate-500 font-medium');

  // Y Axis
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .selectAll('text')
    .attr('class', 'text-slate-500 font-medium');

  // Bars
  svg.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'fill-indigo-500')
    .attr('x', (_, i) => x(days[i]))
    .attr('y', height)
    .attr('width', x.bandwidth())
    .attr('height', 0)
    .attr('rx', 4)
    .transition()
    .duration(800)
    .attr('y', d => y(d))
    .attr('height', d => height - y(d));

  // Labels
  svg.selectAll('.label')
    .data(data)
    .enter()
    .append('text')
    .text(d => d > 0 ? d : '')
    .attr('x', (_, i) => x(days[i]) + x.bandwidth() / 2)
    .attr('y', d => y(d) - 10)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('fill', '#4338ca');
};
