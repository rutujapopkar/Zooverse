import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Simple mapping from slug to data distilled from extra images (can be expanded later)
const programData = {
  'tiger-health-milestone': {
    title:'Tiger Health Milestone',
    img:'/extra images/Tiger Health Milestone.jpeg',
    description:'Detailed update on the wellness tracking milestone achieved for the tiger population including veterinary metrics and enrichment outcomes.'
  },
  'conservation-talk-series': {
    title:'Conservation Talk Series',
    img:'/extra images/Conservation Talk Series.jpeg',
    description:'Expert-led discussions focusing on adaptive management in fragmented habitats and collaborative conservation models.'
  },
  'night-safari-pilot': {
    title:'Night Safari Pilot',
    img:'/extra images/Night Safari Pilot.jpeg',
    description:'Pilot exploration of nocturnal animal behavior, visitor engagement methodology, and sensory ecology interpretation.'
  },
  'vet-q-a-session': {
    title:'Vet Q&A Session',
    img:'/extra images/Vet Q&A Session.jpeg',
    description:'Interactive veterinary session addressing animal care practices, diagnostics technology, and preventive health protocols.'
  },
  'enrichment-workshop': {
    title:'Enrichment Workshop',
    img:'/extra images/Enrichment Workshop.jpeg',
    description:'Hands-on design and evaluation of cognitive and environmental enrichment cycles across diverse taxa.'
  },
  'monsoon-wetland-walk': {
    title:'Monsoon Wetland Walk',
    img:'/extra images/Monsoon Wetland Walk.jpeg',
    description:'Guided interpretive walk examining seasonal hydrology, invertebrate emergence, and amphibian habitat value.'
  },
  'big-cat-awareness-week': {
    title:'Big Cat Awareness Week',
    img:'/extra images/Big Cat Awareness Week.jpeg',
    description:'Week-long engagement spotlighting apex predator conservation strategies and conflict mitigation approaches.'
  },
  'sustainable-safari-initiative': {
    title:'Sustainable Safari Initiative',
    img:'/extra images/Sustainable Safari Initiative.jpeg',
    description:'Operational transition project focused on energy efficiency, waste reduction, and low-impact visitor mobility.'
  },
  'new-giraffe-enclosure-opens': {
    title:'New Giraffe Enclosure Opens',
    img:'/extra images/New Giraffe Enclosure Opens.jpeg',
    description:'Expansion featuring elevated browse structures, thermal comfort zones, and enhanced mixed-species sightlines.'
  },
  'kids-conservation-quiz': {
    title:'Kids Conservation Quiz',
    img:'/extra images/Kids Conservation Quiz.jpeg',
    description:'Interactive youth knowledge challenge fostering ecological literacy and curiosity-driven discovery.'
  }
}

export default function ProgramDetail(){
  const { slug } = useParams()
  const nav = useNavigate()
  const data = programData[slug]
  if(!data){
    return (
      <main className="site" style={{padding:'4rem 1rem'}}>
        <div className="container" style={{textAlign:'center'}}>
          <h1 className="h2" style={{marginBottom:'1rem'}}>Program Not Found</h1>
          <p className="muted" style={{marginBottom:'1.5rem'}}>The program you are looking for may have been archived.</p>
          <button className="btn btn-outline" onClick={()=>nav('/')}>Return Home</button>
        </div>
      </main>
    )
  }
  return (
    <main className="site" style={{padding:'3.5rem 1rem 4.5rem'}}>
      <div className="container" style={{maxWidth:'960px'}}>
        <button className="btn btn-outline small" style={{marginBottom:'1.25rem'}} onClick={()=>nav(-1)}>← Back</button>
        <div style={{border:'1px solid var(--color-border)', borderRadius:'var(--radius-xl)', overflow:'hidden', background:'rgba(20,27,24,.78)'}}>
          <div style={{position:'relative', aspectRatio:'16/9', overflow:'hidden'}}>
            <img src={data.img} alt={`${data.title} promotional visual`} style={{width:'100%', height:'100%', objectFit:'cover'}} />
            <span className="badge" style={{left:'auto', right:'.55rem'}}>PROGRAM</span>
          </div>
          <div style={{padding:'1.5rem 1.25rem 2rem'}}>
            <h1 className="h2" style={{fontSize:'1.9rem', marginBottom:'.85rem'}}>{data.title}</h1>
            <p className="muted" style={{fontSize:'.8rem', lineHeight:1.45, maxWidth:'68ch'}}>{data.description}</p>
          </div>
        </div>
      </div>
    </main>
  )
}