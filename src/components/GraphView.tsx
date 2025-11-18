import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { LayerNode, WeightStat } from '@/types/model';
import { LayerDetail } from './LayerDetail';

interface GraphViewProps {
  layers: LayerNode[];
  weightStats: WeightStat[];
  selectedLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  layer_type: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  source: string | D3Node;
  target: string | D3Node;
}

export function GraphView({ layers, weightStats, selectedLayerId, onLayerSelect }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || layers.length === 0) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g');

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const nodes: D3Node[] = layers.map(layer => ({
      id: layer.id,
      name: layer.name,
      layer_type: layer.layer_type,
    }));

    const links: D3Link[] = [];
    layers.forEach(layer => {
      layer.outbound_nodes.forEach(outbound => {
        const targetLayer = layers.find(l => l.name === outbound);
        if (targetLayer) {
          links.push({
            source: layer.id,
            target: targetLayer.id,
          });
        }
      });
    });

    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', 'oklch(0.85 0.01 250)')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)');

    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 25)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', 'oklch(0.85 0.01 250)');

    node.append('rect')
      .attr('width', 140)
      .attr('height', 60)
      .attr('x', -70)
      .attr('y', -30)
      .attr('rx', 8)
      .attr('fill', d => d.id === selectedLayerId ? 'oklch(0.65 0.15 190)' : 'oklch(1 0 0)')
      .attr('stroke', d => d.id === selectedLayerId ? 'oklch(0.65 0.15 190)' : 'oklch(0.85 0.01 250)')
      .attr('stroke-width', d => d.id === selectedLayerId ? 3 : 1.5);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('fill', d => d.id === selectedLayerId ? 'oklch(0.15 0.02 250)' : 'oklch(0.15 0.02 250)')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name);

    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1em')
      .attr('font-size', '10px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', d => d.id === selectedLayerId ? 'oklch(0.15 0.02 250)' : 'oklch(0.45 0.02 250)')
      .text(d => {
        const typeName = d.layer_type.split('.').pop() || d.layer_type;
        return typeName.length > 20 ? typeName.substring(0, 20) + '...' : typeName;
      });

    node.on('click', (event, d) => {
      event.stopPropagation();
      onLayerSelect(d.id);
    });

    node.on('mouseenter', function() {
      d3.select(this).select('rect')
        .transition()
        .duration(200)
        .attr('filter', 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))');
    });

    node.on('mouseleave', function() {
      d3.select(this).select('rect')
        .transition()
        .duration(200)
        .attr('filter', 'none');
    });

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as D3Node).x || 0)
        .attr('y1', d => (d.source as D3Node).y || 0)
        .attr('x2', d => (d.target as D3Node).x || 0)
        .attr('y2', d => (d.target as D3Node).y || 0);

      node.attr('transform', d => `translate(${d.x || 0},${d.y || 0})`);
    });

    function dragstarted(event: any, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: D3Node) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: D3Node) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      svg.attr('width', newWidth).attr('height', newHeight);
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      simulation.stop();
    };
  }, [layers, selectedLayerId, onLayerSelect]);

  const selectedLayer = layers.find(l => l.id === selectedLayerId);
  const layerWeightStats = weightStats.filter(ws => ws.layer_node_id === selectedLayerId);

  return (
    <div className="flex h-full">
      <div ref={containerRef} className="flex-1 bg-background">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
      
      <div className="w-96 border-l border-border overflow-auto">
        {selectedLayer ? (
          <LayerDetail layer={selectedLayer} weightStats={layerWeightStats} />
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            <p className="text-sm">Select a node to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
