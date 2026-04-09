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
    characters, worldRules, chapters,
    selectCharacter, selectWorldRule, selectChapter,
    showCharacterNodes, showWorldNodes, showChapterNodes,
  } = useStore()

  useEffect(() => {
    const graphNodes: GraphNode[] = []
    const graphLinks: GraphLink[] = []
    if (showCharacterNodes) {
      characters.forEach((char) => {
        graphNodes.push({ id: `char-${char.id}`, label: char.name, type: 'character', group: char.affiliations[0] || 'Unknown', color: '#00f0ff', size: 8, data: char })
        char.affiliations.forEach((aff) => {
          graphLinks.push({ source: `char-${char.id}`, target: `aff-${aff}`, type: 'affiliation' })
          if (!graphNodes.find((n) => n.id === `aff-${aff}`)) {
            graphNodes.push({ id: `aff-${aff}`, label: aff, type: 'world', color: '#b300ff', size: 12, data: { name: aff } })
          }
        })
      })
    }
    if (showWorldNodes) {
      worldRules.forEach((rule) => {
        graphNodes.push({ id: `world-${rule.id}`, label: rule.name, type: 'world', color: '#39ff14', size: 10, data: rule })
      })
    }
    if (showChapterNodes) {
      chapters.forEach((chapter) => {
        graphNodes.push({ id: `ch-${chapter.id}`, label: chapter.title, type: 'chapter', color: '#ff00ff', size: 6, data: chapter })
      })
    }
    setNodes(graphNodes)
    setLinks(graphLinks)
  }, [characters, worldRules, chapters, showCharacterNodes, showWorldNodes, showChapterNodes])

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return
    const width = containerRef.current?.clientWidth || 800
    const height = containerRef.current?.clientHeight || 600
    d3.select(svgRef.current).selectAll('*').remove()
    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height)
    svg.append('rect').attr('width', width).attr('height', height).attr('fill', '#0a0e27')
      .on('click', () => { selectCharacter(null); selectWorldRule(null); selectChapter(null) })
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id((d) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20))
    const g = svg.append('g')
    const link = g.selectAll('line').data(links).enter().append('line')
      .attr('stroke', '#00f0ff').attr('stroke-opacity', 0.2).attr('stroke-width', 1)
    const node = g.selectAll('circle').data(nodes).enter().append('circle')
      .attr('r', (d) => d.size).attr('fill', (d) => d.color).attr('opacity', 0.8).attr('cursor', 'pointer')
      .on('click', (e, d) => {
        e.stopPropagation()
        if (d.type === 'character') selectCharacter(d.data.id)
        else if (d.type === 'world') selectWorldRule(d.data.id)
        else if (d.type === 'chapter') selectChapter(d.data.id)
      })
      .on('mouseenter', function (e, d) {
        d3.select(this).transition().duration(200).attr('r', (d as GraphNode) => (d.size || 8) * 2).attr('opacity', 1).attr('filter', `drop-shadow(0 0 10px ${d.color})`)
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(200).attr('r', (d) => (d as GraphNode).size).attr('opacity', 0.8).attr('filter', 'none')
      })
      .call(d3.drag<SVGCircleElement, GraphNode>()
        .on('start', (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y })
        .on('end', (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null })
      )
    const labels = g.selectAll('text').data(nodes).enter().append('text')
      .attr('x', 0).attr('y', 0).attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('font-size', '10px').attr('fill', '#fff').attr('pointer-events', 'none')
      .text((d) => d.label.substring(0, 15))
    const zoom = d3.zoom<SVGSVGElement, unknown>().on('zoom', (e) => { g.attr('transform', e.transform) })
    svg.call(zoom)
    simulation.on('tick', () => {
      link.attr('x1', (d) => (d.source as any).x).attr('y1', (d) => (d.source as any).y)
        .attr('x2', (d) => (d.target as any).x).attr('y2', (d) => (d.target as any).y)
      node.attr('cx', (d) => d.x || 0).attr('cy', (d) => d.y || 0)
      labels.attr('x', (d) => d.x || 0).attr('y', (d) => d.y || 0)
    })
    return () => { simulation.stop() }
  }, [nodes, links])

  const handleZoom = (direction: number) => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    const currentTransform = d3.zoomTransform(svg.node() as SVGSVGElement)
    svg.transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().transform as any, currentTransform.scale(currentTransform.k * (1 + direction * 0.2)))
  }

  const handleResetView = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().duration(750).call(d3.zoom<SVGSVGElement, unknown>().transform as any, d3.zoomIdentity.translate((containerRef.current?.clientWidth || 800) / 2, (containerRef.current?.clientHeight || 600) / 2))
  }

  return (
    <div ref={containerRef} className="flex-1 bg-dark-bg relative overflow-hidden border-r border-neon-cyan/20">
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <button onClick={() => handleZoom(1)} className="p-2 bg-dark-surface border border-neon-cyan/50 rounded-lg hover:bg-dark-elevated transition-colors" title="Zoom In">
          <ZoomIn className="w-5 h-5 text-neon-cyan" />
        </button>
        <button onClick={() => handleZoom(-1)} className="p-2 bg-dark-surface border border-neon-cyan/50 rounded-lg hover:bg-dark-elevated transition-colors" title="Zoom Out">
          <ZoomOut className="w-5 h-5 text-neon-cyan" />
        </button>
        <button onClick={handleResetView} className="p-2 bg-dark-surface border border-neon-cyan/50 rounded-lg hover:bg-dark-elevated transition-colors" title="Reset View">
          <Maximize2 className="w-5 h-5 text-neon-cyan" />
        </button>
      </div>
      <div className="absolute top-6 left-6 bg-dark-surface/80 backdrop-blur border border-neon-cyan/30 rounded-lg p-3">
        <p className="text-xs text-gray-400">Nodes: {nodes.length} | Links: {links.length}</p>
      </div>
    </div>
  )
}
