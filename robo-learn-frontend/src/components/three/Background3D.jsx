import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─────────────────────────────────────────────
   Polygon Network Mesh (Nodes + connecting lines)
   Matches the reference: dark navy, scattered nodes,
   triangulating lines, subtle grid floor
───────────────────────────────────────────── */
const PolygonNetwork = () => {
  const groupRef = useRef();

  const { nodes, lineGeo } = useMemo(() => {
    const count = 120;
    const SPREAD_X = 50;
    const SPREAD_Y = 35;
    const SPREAD_Z = 18;
    const MAX_DIST = 11;

    // Generate evenly-distributed 3D nodes using stratified sampling
    const pts = [];
    const GRID_X = 8;
    const GRID_Y = 6;
    const GRID_Z = 3;
    const CELL_X = SPREAD_X / GRID_X;
    const CELL_Y = SPREAD_Y / GRID_Y;
    const CELL_Z = SPREAD_Z / GRID_Z;
    // Fill grid cells with jittered points for even distribution
    for (let gx = 0; gx < GRID_X; gx++) {
      for (let gy = 0; gy < GRID_Y; gy++) {
        for (let gz = 0; gz < GRID_Z; gz++) {
          if (pts.length >= count) break;
          pts.push(new THREE.Vector3(
            (gx + Math.random()) * CELL_X - SPREAD_X / 2,
            (gy + Math.random()) * CELL_Y - SPREAD_Y / 2,
            (gz + Math.random()) * CELL_Z - SPREAD_Z / 2 - 8
          ));
        }
      }
    }
    // Add remaining random points to reach count
    while (pts.length < count) {
      pts.push(new THREE.Vector3(
        (Math.random() - 0.5) * SPREAD_X,
        (Math.random() - 0.5) * SPREAD_Y,
        (Math.random() - 0.5) * SPREAD_Z - 8
      ));
    }

    // Connect nearby pairs
    const linePositions = [];
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < MAX_DIST) {
          linePositions.push(pts[i].x, pts[i].y, pts[i].z);
          linePositions.push(pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

    // Node positions for point cloud
    const nodePos = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => { nodePos[i*3] = p.x; nodePos[i*3+1] = p.y; nodePos[i*3+2] = p.z; });
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePos, 3));

    return { nodes: { geo: nodeGeo, pts }, lineGeo: geo };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Very slow drift
      groupRef.current.rotation.y += delta * 0.015;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.06) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -10]}>
      {/* Connecting lines */}
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial
          color="#0f4a70"
          transparent
          opacity={0.45}
        />
      </lineSegments>

      {/* Nodes */}
      <points geometry={nodes.geo}>
        <pointsMaterial
          color="#2a90b8"
          size={0.15}
          sizeAttenuation
          transparent
          opacity={0.85}
        />
      </points>
    </group>
  );
};

/* Grid floor like the reference image */
const GridFloor = () => {
  const ref = useRef();
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.z = (ref.current.position.z + delta * 0.4) % 5;
    }
  });
  return (
    <group ref={ref} position={[0, -10, -15]}>
      <gridHelper args={[60, 40, '#071d2e', '#071d2e']} />
    </group>
  );
};

/* A few very subtle bright star dots */
const StarField = () => {
  const geo = useMemo(() => {
    const count = 80;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25 - 12;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  return (
    <points geometry={geo}>
      <pointsMaterial color="#4fc3f7" size={0.06} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
};

const Background3D = () => {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'linear-gradient(180deg, #061220 0%, #081a2e 40%, #061220 100%)' }}
    >
      <Canvas camera={{ position: [0, 0, 20], fov: 55 }}>
        <fog attach="fog" args={['#061220', 30, 65]} />
        <PolygonNetwork />
        <GridFloor />
        <StarField />
      </Canvas>
    </div>
  );
};

export default Background3D;
