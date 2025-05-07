// FaceSmile3D.jsx
import { useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader'
import { ExtrudeGeometry, MeshStandardMaterial } from 'three'

export default function FaceSmile3D({ url, color = '#4B5563', depth = 2, ...props }) {
  // charge le SVG (tu peux exporter l’icône Heroicons en .svg dans /public)
  const { paths } = useLoader(SVGLoader, url)

  // transforme chaque chemin en shape, prêt pour l’extrusion
  const shapes = useMemo(
    () =>
      paths.flatMap((path) =>
        path.toShapes(true).map((shape) =>
          new ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: false,
          })
        )
      ),
    [paths, depth]
  )

  // un matériau simple
  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.1,
      }),
    [color]
  )

  return (
    <group {...props}>
      {shapes.map((geom, i) => (
        <mesh key={i} geometry={geom} material={material} />
      ))}
    </group>
  )
}
