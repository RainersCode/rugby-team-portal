'use client';

import { Box } from '@chakra-ui/react';
import { useColorModeValue } from '@chakra-ui/hooks';
import { useEffect, useRef } from 'react';

interface DataPoint {
  name: string;
  value: number;
}

interface LineGraphProps {
  data: DataPoint[];
}

export default function LineGraph({ data }: LineGraphProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const lineColor = useColorModeValue('#3182CE', '#63B3ED');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');
  const textColor = useColorModeValue('#2D3748', '#E2E8F0');

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Clear any existing content
    chartRef.current.innerHTML = '';

    // Get container dimensions
    const width = chartRef.current.clientWidth;
    const height = chartRef.current.clientHeight;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find min and max values
    const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // Add 10% padding

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width.toString());
    svg.setAttribute('height', height.toString());
    chartRef.current.appendChild(svg);

    // Create chart group with padding
    const chart = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chart.setAttribute('transform', `translate(${padding.left},${padding.top})`);
    svg.appendChild(chart);

    // Create x scale
    const xScale = (i: number) => i * (chartWidth / (data.length - 1));

    // Create y scale
    const yScale = (value: number) => chartHeight - (value / maxValue) * chartHeight;

    // Draw grid lines
    for (let i = 0; i <= 5; i++) {
      const y = yScale((maxValue / 5) * i);
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', '0');
      gridLine.setAttribute('y1', y.toString());
      gridLine.setAttribute('x2', chartWidth.toString());
      gridLine.setAttribute('y2', y.toString());
      gridLine.setAttribute('stroke', gridColor);
      gridLine.setAttribute('stroke-width', '0.5');
      gridLine.setAttribute('stroke-dasharray', '5,5');
      chart.appendChild(gridLine);

      // Add y-axis labels
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', '-5');
      label.setAttribute('y', y.toString());
      label.setAttribute('text-anchor', 'end');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('fill', textColor);
      label.setAttribute('font-size', '12');
      label.textContent = Math.round((maxValue / 5) * (5 - i)).toString();
      chart.appendChild(label);
    }

    // Draw x-axis
    const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    xAxis.setAttribute('x1', '0');
    xAxis.setAttribute('y1', chartHeight.toString());
    xAxis.setAttribute('x2', chartWidth.toString());
    xAxis.setAttribute('y2', chartHeight.toString());
    xAxis.setAttribute('stroke', textColor);
    xAxis.setAttribute('stroke-width', '1');
    chart.appendChild(xAxis);

    // Draw y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('y1', '0');
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y2', chartHeight.toString());
    yAxis.setAttribute('stroke', textColor);
    yAxis.setAttribute('stroke-width', '1');
    chart.appendChild(yAxis);

    // Draw x-axis labels
    data.forEach((point, i) => {
      if (i % 2 === 0 || data.length <= 6) { // Skip some labels if too many
        const x = xScale(i);
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', x.toString());
        label.setAttribute('y', (chartHeight + 20).toString());
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', textColor);
        label.setAttribute('font-size', '12');
        
        // Rotate labels if they might overlap
        if (data.length > 6) {
          label.setAttribute('transform', `rotate(45, ${x}, ${chartHeight + 20})`);
          label.setAttribute('text-anchor', 'start');
        }
        
        label.textContent = point.name;
        chart.appendChild(label);
      }
    });

    // Create line path
    let pathD = '';
    data.forEach((point, i) => {
      const x = xScale(i);
      const y = yScale(point.value);
      if (i === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathD);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', lineColor);
    path.setAttribute('stroke-width', '3');
    chart.appendChild(path);

    // Add dots for each data point
    data.forEach((point, i) => {
      const x = xScale(i);
      const y = yScale(point.value);
      
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x.toString());
      dot.setAttribute('cy', y.toString());
      dot.setAttribute('r', '4');
      dot.setAttribute('fill', lineColor);
      chart.appendChild(dot);
      
      // Create tooltip for hover
      const tooltip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      tooltip.setAttribute('opacity', '0');
      chart.appendChild(tooltip);
      
      const tooltipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      tooltipRect.setAttribute('x', (x - 40).toString());
      tooltipRect.setAttribute('y', (y - 40).toString());
      tooltipRect.setAttribute('width', '80');
      tooltipRect.setAttribute('height', '30');
      tooltipRect.setAttribute('fill', 'white');
      tooltipRect.setAttribute('stroke', lineColor);
      tooltipRect.setAttribute('rx', '5');
      tooltip.appendChild(tooltipRect);
      
      const tooltipText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      tooltipText.setAttribute('x', x.toString());
      tooltipText.setAttribute('y', (y - 20).toString());
      tooltipText.setAttribute('text-anchor', 'middle');
      tooltipText.setAttribute('fill', '#2D3748');
      tooltipText.setAttribute('font-size', '12');
      tooltipText.textContent = `Value: ${point.value}`;
      tooltip.appendChild(tooltipText);
      
      // Add hover effects
      dot.addEventListener('mouseenter', () => {
        dot.setAttribute('r', '6');
        tooltip.setAttribute('opacity', '1');
      });
      
      dot.addEventListener('mouseleave', () => {
        dot.setAttribute('r', '4');
        tooltip.setAttribute('opacity', '0');
      });
    });

  }, [data, lineColor, gridColor, textColor]);

  return (
    <Box 
      ref={chartRef} 
      width="100%" 
      height="100%"
      overflow="hidden"
      position="relative"
    />
  );
} 