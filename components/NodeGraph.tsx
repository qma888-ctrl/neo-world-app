'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { useStore } from '@/lib/store'
import { GraphNode, GraphLink } from '@/lib/types'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

export function NodeGraph() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [links, setLinks] = useState<GraphLink[]>([])

  const {
    characters,
    worldRules,
    chapters,
    selectCharacter,
    selectWorldRule,
    selectChapter,
    showCharacterNodes,
    showWorldNodes,
    showChapterNodes,
  } = useStore()

  useEffect(() => {
    // Build graph data
    const graphNodes: GraphNode[] = []
    const graphLinks: GraphLink[] = []

    // Add character nodes
    if (showCharacterNodes) {
      characters.forEach((char) => {
        graphNodes.push({
          id: `char-${char.id}`,
          label: char.name,
          type: 'character',
          group: char.affiliations[0] || 'Unknown',
          color: '#00f0ff',
          size: 8,
          data: char,
        })

        // Create affiliation group links
        char.affiliations.forEach((aff) => {
          graphLinks.push({
            source: `char-${char.id}`,
            target: `aff-${aff}`,
            type: 'affiliation',
          })

          // Add affiliation node if not already added
          if (!graphNodes.find((n) => n.id === `aff-${aff}`)) {
            graphNodes.push({
              id: `aff-${aff}`,
              label: aff,
              type: 'world',
              color: '#b300ff',
              size: 12,
              data: { name: aff },
            })
          }
        })
      })
    }

    // Add world rule nodes
    if (showWorldNodes) {
      worldRules.forEach((rule) => {
        graphNodes.push({
          id: `world-${rule.id}`,
          label: rule.name,
          type: 'world',
          color: '#39ff14',
          size: 10,
          data: rule,
        })
      })
    }

    // Add chapter nodes
    if (showChapterNodes) {
      chapters.forEach((chapter) => {
        graphNodes.push({
          id: `ch-${chapter.id}`,
          label: chapter.title,
          type: 'chapter',
          color: '#ff00ff',
          size: 6,
          data: chapter,
        })
      })
    }

    setNodes(graphNodes)
    setLinks(graphLinks)
  }, [characters, worldRules, chapters, showCharacterNodes, showWorldNodes, showChapterNodes])

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return

    const width = containerRef.current?.clientWidth || 800
    const height = containerRef.current?.clientHeight || 600

    // Clear previous
    d3.select(svgRef.current).selectAll('*').remove()

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Transparent background — let brain aesthetic show through
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .on('click', () => {
        selectCharacter(null)
        selectWorldRule(null)
        selectChapter(null)
      })

    // Create simulation — tightened so everything fits in view
    const simulation = d3
      .forceSimulation(nodes as any)
      .force(
        'link',
        d3.forceLink(links as any)
          .id((d: any) => d.id)
          .distance(28)
          .strength(0.9)
      )
      .force('charge', d3.forceManyBody().strength(-45))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.12))
      .force('y', d3.forceY(height / 2).strength(0.12))
      .force('collision', d3.forceCollide().radius(13))

    const g = svg.append('g')

    // Add links
    const link = g
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#00f0ff')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', 1)

    // Add nodes
    const node = g
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => d.size || 8)
      .attr('fill', (d) => d.color || '#fff')
      .attr('opacity', 0.8)
      .attr('cursor', 'pointer')
      .on('click', (e, d) => {
        e.stopPropagation()
        if (d.type === 'character') {
          selectCharacter(d.data.id)
        } else if (d.type === 'world') {
          selectWorldRule(d.data.id)
        } else if (d.type === 'chapter') {
          selectChapter(d.data.id)
        }
      })
      .on('mouseenter', function (e, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d: any) => ((d as GraphNode).size || 8) * 2)
          .attr('opacity', 1)
          .attr('filter', `drop-shadow(0 0 10px ${d.color})`)
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d) => (d as GraphNode).size || 8)
          .attr('opacity', 0.8)
          .attr('filter', 'none')
      })
      .call(
        d3.drag<SVGCircleElement, GraphNode>()
          .on('start', (e, d) => {
            if (!e.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (e, d) => {
            d.fx = e.x
            d.fy = e.y
          })
          .on('end', (e, d) => {
            if (!e.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    // Add labels
    const labels = g
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', '10px')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none')
      .text((d) => d.label.substring(0, 15))

    // Add zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (e) => {
      g.attr('transform', e.transform)
    })
    svg.call(zoom)

    // Function to push d3 positions onto SVG attributes
    const updatePositions = () => {
      link
        .attr('x1', (d: any) => (d.source as any).x || 0)
        .attr('y1', (d: any) => (d.source as any).y || 0)
        .attr('x2', (d: any) => (d.target as any).x || 0)
        .attr('y2', (d: any) => (d.target as any).y || 0)
      node
        .attr('cx', (d: any) => d.x || 0)
        .attr('cy', (d: any) => d.y || 0)
      labels
        .attr('x', (d: any) => d.x || 0)
        .attr('y', (d: any) => d.y || 0)
    }

    // Auto-fit graph into view based on current positions
    const fitToView = () => {
      const padding = 40
      const xs = nodes.map((n: any) => n.x).filter((v) => typeof v === 'number')
      const ys = nodes.map((n: any) => n.y).filter((v) => typeof v === 'number')
      if (xs.length === 0) return
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)
      const w = Math.max(maxX - minX, 1)
      const h = Math.max(maxY - minY, 1)
      const scale = Math.min(
        (width - padding * 2) / w,
        (height - padding * 2) / h,
        1.4
      )
      const tx = width / 2 - ((minX + maxX) / 2) * scale
      const ty = height / 2 - ((minY + maxY) / 2) * scale
      svg
        .transition()
        .duration(600)
        .call(zoom.transform as any, d3.zoomIdentity.translate(tx, ty).scale(scale))
    }

    // Live tick handler for drag interactions
    simulation.on('tick', updatePositions)

    // Run simulation synchronously to settle layout immediately
    simulation.stop()
    for (let i = 0; i < 320; i++) simulation.tick()
    updatePositions()
    fitToView()
    // Restart with low alpha so dragging still works
    simulation.alpha(0).restart()

    return () => {
      simulation.stop()
    }
  }, [nodes, links])

  const handleZoom = (direction: number) => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const currentTransform = d3.zoomTransform(svg.node() as SVGSVGElement)
    svg
      .transition()
      .duration(300)
      .call(
        d3
          .zoom<SVGSVGElement, unknown>()
          .transform as any,
        currentTransform.scale(currentTransform.k * (1 + direction * 0.2))
      )
  }

  const handleResetView = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg
      .transition()
      .duration(750)
      .call(
        d3
          .zoom<SVGSVGElement, unknown>()
          .transform as any,
        d3.zoomIdentity.translate(
          (containerRef.current?.clientWidth || 800) / 2,
          (containerRef.current?.clientHeight || 600) / 2
        )
      )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-dark-bg relative overflow-hidden border-r border-neon-cyan/20"
    >
      <svg ref={svgRef} className="w-full h-full" />

      {/* Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(1)}
          className="p-2 bg-dark-surface border border-neon-cyan/50 rounded-lg hover:bg-dark-elevated transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5 text-neon-cyan" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="p-2 bg-dark-surface border border-neon-cyan/50 rounded-lg hover:bg-dark-elevated transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5 text-neon-cyan" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-dark-surface border border-neon-cyan/50 rounded-lg hover:bg-dark-elevated transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5 text-neon-cyan" />
        </button>
      </div>

      {/* Info */}
      <div className="absolute top-6 left-6 bg-dark-surface/80 backdrop-blur border border-neon-cyan/30 rounded-lg p-3">
        <p className="text-xs text-gray-400">
          Nodes: {nodes.length} | Links: {links.length}
        </p>
      </div>
    </div>
  )
}
