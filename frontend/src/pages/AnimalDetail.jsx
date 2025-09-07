import React, {useEffect, useState, useRef} from 'react'
import { useParams } from 'react-router-dom'
import { Box, Typography, Card, CardContent } from '@mui/material'
import axios from 'axios'

function ThreePreview({modelUrl}){
  const ref = useRef()
  useEffect(()=>{
    // lightweight Three.js via CDN if available
    const load = async ()=>{
      if(!window.THREE){
        const s = document.createElement('script')
        s.src = 'https://cdn.jsdelivr.net/npm/three@0.152.0/build/three.min.js'
        document.head.appendChild(s)
        await new Promise(res=>s.onload = res)
      }
      const THREE = window.THREE
      const el = ref.current
      if(!el) return
      const w = el.clientWidth, h = 400
      const renderer = new THREE.WebGLRenderer({antialias:true})
      renderer.setSize(w,h)
      el.innerHTML = ''
      el.appendChild(renderer.domElement)
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 1000)
      camera.position.set(0,0,5)
      const light = new THREE.DirectionalLight(0xffffff,1)
      light.position.set(5,10,7.5)
      scene.add(light)
      // simple placeholder geometry (sphere) to represent an animal model
      const geometry = new THREE.SphereGeometry(1, 32, 32)
      const material = new THREE.MeshStandardMaterial({color:0x8dbf67})
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      function animate(){
        mesh.rotation.y += 0.01
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
      }
      animate()
      // cleanup
      return ()=>{
        renderer.dispose()
        el.innerHTML = ''
      }
    }
    load()
  }, [modelUrl])
  return <div ref={ref} style={{width:'100%', height:400}} />
}

export default function AnimalDetail(){
  const [animal, setAnimal] = useState(null)
  const { id } = useParams()
  useEffect(()=>{
    if(!id) return
    axios.get(`/api/animals/${id}`).then(r=>setAnimal(r.data)).catch(e=>console.error(e))
  }, [id])

  if(!animal) return <Typography>Loading...</Typography>

  return (
    <Box sx={{mt:4}}>
      <Card>
        <CardContent>
          <Typography variant="h4">{animal.name}</Typography>
          <Typography color="text.secondary">{animal.species}</Typography>
          <Typography sx={{mt:2}}>{animal.description}</Typography>
        </CardContent>
      </Card>
      <Box sx={{mt:3}}>
        <Typography variant="h6">3D Preview</Typography>
        <ThreePreview modelUrl={animal.model_url} />
      </Box>
    </Box>
  )
}
