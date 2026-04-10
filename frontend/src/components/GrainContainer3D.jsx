import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { getTemperatureColor, getStorageStatus, getGlowIntensity } from '../utils/colorMapper';
import './GrainContainer3D.css';

/**
 * Storage Room/Warehouse Environment with Grid
 * Creates a transparent grid room to simulate a storage facility
 */
function StorageRoom() {
  const gridRef = useRef();
  
  // Animate grid for subtle effect
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  return (
    <group>
      {/* Floor Grid - Golden */}
      <gridHelper 
        args={[12, 12, '#fbbf24', '#f59e0b']} 
        position={[0, 0, 0]}
      />
      
      {/* Warehouse Walls - Transparent Grid Structure with Golden Edges */}
      {/* Back Wall */}
      <mesh position={[0, 3.5, -5]} rotation={[0, 0, 0]}>
        <planeGeometry args={[12, 7]} />
        <meshBasicMaterial 
          color="#fbbf24"
          wireframe
          transparent
          opacity={0.5}
        />
      </mesh>
      
      {/* Left Wall */}
      <mesh position={[-6, 3.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 7]} />
        <meshBasicMaterial 
          color="#f59e0b"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Right Wall */}
      <mesh position={[6, 3.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 7]} />
        <meshBasicMaterial 
          color="#f59e0b"
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Ceiling Grid - Golden */}
      <mesh ref={gridRef} position={[0, 7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshBasicMaterial 
          color="#fbbf24"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
      
      {/* Corner Support Beams - Golden with glow */}
      {[
        [-5.5, 3.5, -4.5], [5.5, 3.5, -4.5],
        [-5.5, 3.5, 4.5], [5.5, 3.5, 4.5]
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.08, 0.08, 7, 8]} />
          <meshStandardMaterial 
            color="#fbbf24"
            metalness={0.9}
            roughness={0.1}
            emissive="#f59e0b"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {/* Frame edges for more definition - Golden */}
      {/* Top frame */}
      {[
        [0, 7, -5], [0, 7, 5],
        [-6, 7, 0], [6, 7, 0]
      ].map((pos, i) => (
        <mesh key={`top-${i}`} position={pos} rotation={i < 2 ? [0, 0, Math.PI / 2] : [0, Math.PI / 2, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, i < 2 ? 12 : 10, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}
      
      {/* Floating Data Points - Golden glow for IoT sensors */}
      {[
        [-4, 2.5, -3], [4, 2.5, -3],
        [-4, 5, 3], [4, 5, 3]
      ].map((pos, i) => (
        <group key={`sensor-${i}`}>
          <mesh position={pos}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial 
              color="#fbbf24"
              transparent
              opacity={0.8}
            />
          </mesh>
          {/* Sensor glow */}
          <pointLight position={pos} color="#fbbf24" intensity={0.4} distance={1.5} />
        </group>
      ))}
      
      {/* Warehouse Information Markers - Golden */}
      <Text
        position={[0, 6.5, -4.9]}
        fontSize={0.3}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
      >
        STORAGE FACILITY - ZONE A
      </Text>
      
      <Text
        position={[-5.9, 3.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.25}
        color="#f59e0b"
        anchorX="center"
        anchorY="middle"
      >
        IoT MONITORING
      </Text>
    </group>
  );
}

/**
 * Particle System for Steam/Vapor Effect
 */
function SteamParticles({ temperature, position }) {
  const particlesRef = useRef();
  const particleCount = 50;
  
  // Only show steam if temperature is high (>30°C)
  const showSteam = temperature > 30;
  const intensity = Math.min((temperature - 30) / 10, 1); // 30-40°C = 0-1
  
  // Create particle positions
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1.5; // x
      positions[i * 3 + 1] = Math.random() * 2; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1; // z
    }
    return positions;
  }, []);
  
  useFrame((state) => {
    if (particlesRef.current && showSteam) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        // Move particles upward
        positions[i * 3 + 1] += 0.01 * intensity;
        
        // Reset if too high
        if (positions[i * 3 + 1] > 4) {
          positions[i * 3 + 1] = 3;
        }
        
        // Slight horizontal drift
        positions[i * 3] += Math.sin(state.clock.elapsedTime + i) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  if (!showSteam) return null;
  
  return (
    <points ref={particlesRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6 * intensity}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Water Droplets for High Humidity
 */
function WaterDroplets({ humidity, position }) {
  const dropletsRef = useRef();
  const dropletCount = 30;
  
  const showDroplets = humidity > 60;
  const intensity = Math.min((humidity - 60) / 30, 1);
  
  const droplets = useMemo(() => {
    const positions = new Float32Array(dropletCount * 3);
    for (let i = 0; i < dropletCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2; // x
      positions[i * 3 + 1] = Math.random() * 3 + 1; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1.5; // z
    }
    return positions;
  }, []);
  
  useFrame(() => {
    if (dropletsRef.current && showDroplets) {
      const positions = dropletsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < dropletCount; i++) {
        // Droplets fall down
        positions[i * 3 + 1] -= 0.02 * intensity;
        
        // Reset if too low
        if (positions[i * 3 + 1] < 0.5) {
          positions[i * 3 + 1] = 4;
        }
      }
      dropletsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  if (!showDroplets) return null;
  
  return (
    <points ref={dropletsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={dropletCount}
          array={droplets}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#60a5fa"
        transparent
        opacity={0.7 * intensity}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Critical Alert Glow - Pulsing red glow for entire scene
 */
function CriticalAlertGlow({ temperature, humidity }) {
  const glowRef = useRef();
  const isCritical = temperature > 35 || humidity > 70;
  
  useFrame((state) => {
    if (glowRef.current && isCritical) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
      glowRef.current.material.opacity = pulse * 0.15;
      glowRef.current.scale.set(1 + pulse * 0.1, 1 + pulse * 0.1, 1 + pulse * 0.1);
    }
  });
  
  if (!isCritical) return null;
  
  return (
    <mesh ref={glowRef} position={[0, 3.5, 0]}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshBasicMaterial
        color="#ff0000"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/**
 * Motion Trail Effect - Ripples when motion detected
 */
function MotionRipples({ motion, position }) {
  const ripple1Ref = useRef();
  const ripple2Ref = useRef();
  const ripple3Ref = useRef();
  
  useFrame((state) => {
    if (motion) {
      const time = state.clock.elapsedTime;
      
      // Expanding ripples
      if (ripple1Ref.current) {
        const scale1 = (Math.sin(time * 2) * 0.5 + 0.5) * 2 + 1;
        ripple1Ref.current.scale.set(scale1, 1, scale1);
        ripple1Ref.current.material.opacity = 0.4 - (scale1 - 1) * 0.2;
      }
      
      if (ripple2Ref.current) {
        const scale2 = (Math.sin(time * 2 + 1) * 0.5 + 0.5) * 2 + 1;
        ripple2Ref.current.scale.set(scale2, 1, scale2);
        ripple2Ref.current.material.opacity = 0.4 - (scale2 - 1) * 0.2;
      }
      
      if (ripple3Ref.current) {
        const scale3 = (Math.sin(time * 2 + 2) * 0.5 + 0.5) * 2 + 1;
        ripple3Ref.current.scale.set(scale3, 1, scale3);
        ripple3Ref.current.material.opacity = 0.4 - (scale3 - 1) * 0.2;
      }
    }
  });
  
  if (!motion) return null;
  
  return (
    <group position={position}>
      {/* Ripple 1 */}
      <mesh ref={ripple1Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.4} />
      </mesh>
      
      {/* Ripple 2 */}
      <mesh ref={ripple2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#ff4444" transparent opacity={0.3} />
      </mesh>
      
      {/* Ripple 3 */}
      <mesh ref={ripple3Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial color="#ff6666" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Holographic Temperature Ring
 * Floating ring around container that fills based on temperature
 */
function TemperatureHologram({ temperature, position }) {
  const ringRef = useRef();
  const glowRef = useRef();
  
  // Normalize temperature to 0-100 scale (0°C to 50°C range)
  const normalizedTemp = Math.min(Math.max((temperature / 50) * 100, 0), 100);
  const fillAngle = (normalizedTemp / 100) * Math.PI * 2;
  
  // Use the same color mapper as the container
  const tempColor = useMemo(() => getTemperatureColor(temperature), [temperature]);
  
  useFrame((state) => {
    // Rotation animation only
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
    
    // Pulsing glow for critical temperature
    if (glowRef.current && temperature > 35) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
      glowRef.current.material.opacity = pulse * 0.3;
    }
  });
  
  return (
    <group position={position}>
      {/* Background Ring (Empty) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.05, 16, 64]} />
        <meshBasicMaterial
          color="#1e293b"
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Filled Ring (Temperature Level) */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <torusGeometry args={[1.2, 0.07, 16, 64, fillAngle]} />
        <meshBasicMaterial
          color={tempColor}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Glow Effect for Critical Temperature */}
      {temperature > 35 && (
        <mesh ref={glowRef} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
          <torusGeometry args={[1.2, 0.1, 16, 64, fillAngle]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
      
      {/* Holographic Lines (Decorative) */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 1.2;
        const z = Math.sin(rad) * 1.2;
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, -rad, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.02]} />
            <meshBasicMaterial color={tempColor} transparent opacity={0.6} />
          </mesh>
        );
      })}
      
      {/* Center Temperature Display - Above the ring */}
      <group position={[0, 0.7, 0]}>
        <Text
          fontSize={0.28}
          color={tempColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {temperature.toFixed(1)}°C
        </Text>
        <Text
          position={[0, -0.25, 0]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          TEMPERATURE
        </Text>
      </group>
      
      {/* Floating Particles around ring for effect */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 1.4;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle + Date.now() * 0.001) * radius,
              Math.sin(Date.now() * 0.001 + i) * 0.08,
              Math.sin(angle + Date.now() * 0.001) * radius
            ]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={tempColor} transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Holographic Humidity Ring
 * Floating ring around container that fills based on humidity
 */
function HumidityHologram({ humidity, position }) {
  const ringRef = useRef();
  const textRef = useRef();
  const glowRef = useRef();
  
  // Get color based on humidity level
  const getHumidityColor = (h) => {
    if (h < 30) return '#9ca3af'; // Gray - dry
    if (h < 50) return '#60a5fa'; // Light blue - normal
    if (h < 70) return '#0446afff'; // Blue - humid
    return '#ef4444'; // Red - critical
  };
  
  const humidityColor = useMemo(() => getHumidityColor(humidity), [humidity]);
  const fillAngle = (humidity / 100) * Math.PI * 2; // 0-360 degrees
  
  useFrame((state) => {
    // Rotation animation only
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
    
    // Pulsing glow for critical humidity
    if (glowRef.current && humidity > 70) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.5 + 0.5;
      glowRef.current.material.opacity = pulse * 0.3;
    }
  });
  
  return (
    <group position={position}>
      {/* Background Ring (Empty) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.2, 0.05, 16, 64]} />
        <meshBasicMaterial
          color="#1e293b"
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Filled Ring (Humidity Level) */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
        <torusGeometry args={[1.2, 0.07, 16, 64, fillAngle]} />
        <meshBasicMaterial
          color={humidityColor}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Glow Effect for Critical Humidity */}
      {humidity > 70 && (
        <mesh ref={glowRef} rotation={[Math.PI / 2, 0, -Math.PI / 2]}>
          <torusGeometry args={[1.2, 0.1, 16, 64, fillAngle]} />
          <meshBasicMaterial
            color="#ef4444"
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
      
      {/* Holographic Lines (Decorative) */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 1.2;
        const z = Math.sin(rad) * 1.2;
        return (
          <mesh key={i} position={[x, 0, z]} rotation={[0, -rad, 0]}>
            <boxGeometry args={[0.02, 0.2, 0.02]} />
            <meshBasicMaterial color={humidityColor} transparent opacity={0.6} />
          </mesh>
        );
      })}
      
      {/* Center Humidity Display - Above the ring */}
      <group position={[0, 0.7, 0]}>
        <Text
          fontSize={0.28}
          color={humidityColor}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {humidity.toFixed(0)}%
        </Text>
        <Text
          position={[0, -0.25, 0]}
          fontSize={0.13}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          HUMIDITY
        </Text>
      </group>
      
      {/* Floating Particles around ring for effect */}
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const radius = 1.4;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle + Date.now() * 0.001) * radius,
              Math.sin(Date.now() * 0.001 + i) * 0.08,
              Math.sin(angle + Date.now() * 0.001) * radius
            ]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color={humidityColor} transparent opacity={0.7} />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Status Badge Component with Smooth Color Transitions
 */
function StatusBadge({ status, position }) {
  const badgeRef = useRef();
  const currentBadgeColorRef = useRef(new THREE.Color(status.color));
  const targetBadgeColorRef = useRef(new THREE.Color(status.color));
  
  // Update target when status changes
  useMemo(() => {
    targetBadgeColorRef.current.set(status.color);
  }, [status.color]);
  
  // Smooth color transition
  useFrame((state, delta) => {
    if (badgeRef.current) {
      currentBadgeColorRef.current.lerp(targetBadgeColorRef.current, delta * 0.5);
      badgeRef.current.material.color.copy(currentBadgeColorRef.current);
    }
  });
  
  return (
    <group position={position}>
      <mesh ref={badgeRef}>
        <planeGeometry args={[1.8, 0.5]} />
        <meshBasicMaterial 
          transparent 
          opacity={0.9} 
          side={THREE.DoubleSide}
        />
      </mesh>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.015}
        outlineColor="#000000"
      >
        {status.emoji} {status.label}
      </Text>
    </group>
  );
}

/**
 * 3D Grain Storage Container Component
 * Displays a cuboid container with color based on temperature
 */
function Container({ temperature, humidity, motion }) {
  const meshRef = useRef();
  const glowRef = useRef();
  
  // State to track current color for smooth transitions
  const currentColorRef = useRef(new THREE.Color(getTemperatureColor(temperature)));
  const targetColorRef = useRef(new THREE.Color(getTemperatureColor(temperature)));
  
  // Get color and status based on temperature
  const targetColor = useMemo(() => getTemperatureColor(temperature), [temperature]);
  const status = useMemo(() => getStorageStatus(temperature, humidity), [temperature, humidity]);
  const glowIntensity = useMemo(() => getGlowIntensity(temperature), [temperature]);
  
  // Update target color when temperature changes
  useMemo(() => {
    targetColorRef.current.set(targetColor);
  }, [targetColor]);
  
  // Animate smooth color transitions and effects
  useFrame((state, delta) => {
    
    if (meshRef.current) {
      // Smooth color interpolation (lerp) - transitions over ~2 seconds
      currentColorRef.current.lerp(targetColorRef.current, delta * 0.5);
      meshRef.current.material.color.copy(currentColorRef.current);
      
      // Update emissive color for motion detection
      if (motion) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 0.5;
        meshRef.current.material.emissive.setHex(0xff0000);
        meshRef.current.material.emissiveIntensity = pulse * 0.5;
        
        // Pulse scale effect
        const scale = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.03;
        meshRef.current.scale.set(scale, scale, scale);
      } else {
        // Smoothly return to normal
        meshRef.current.material.emissive.copy(currentColorRef.current);
        meshRef.current.material.emissiveIntensity = 0.15;
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), delta * 2);
      }
    }
    
    // Animate glow effect for critical temperatures
    if (glowRef.current && glowIntensity > 0) {
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 0.7;
      glowRef.current.material.opacity = glowIntensity * pulse * 0.3;
    }
  });

  return (
    <group>
      {/* Main Container with Thermal Heat Map Effect */}
      <mesh ref={meshRef} position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[2, 3, 1.5]} />
        <meshStandardMaterial 
          metalness={0.4}
          roughness={0.6}
          envMapIntensity={1.2}
        />
      </mesh>
      
      {/* Thermal Gradient Overlay - Creates heat map effect */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[2.05, 3.05, 1.55]} />
        <meshBasicMaterial 
          color={currentColorRef.current}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Thermal Contour Lines (Hot Zones) */}
      {temperature > 25 && (
        <>
          <mesh position={[0, 2.5, 0]}>
            <boxGeometry args={[2.1, 0.05, 1.6]} />
            <meshBasicMaterial 
              color={temperature > 30 ? '#ff6600' : '#ffaa00'}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <boxGeometry args={[2.1, 0.05, 1.6]} />
            <meshBasicMaterial 
              color={temperature > 32 ? '#ff3300' : '#ff6600'}
              transparent
              opacity={0.6}
            />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[2.1, 0.05, 1.6]} />
            <meshBasicMaterial 
              color={temperature > 35 ? '#ff0000' : '#ff6600'}
              transparent
              opacity={0.4}
            />
          </mesh>
        </>
      )}
      
      {/* Holographic Rings - Side by Side at proper height */}
      <TemperatureHologram temperature={temperature} position={[-2.2, 3.5, 0]} />
      <HumidityHologram humidity={humidity} position={[2.2, 3.5, 0]} />

      {/* Motion Trail Ripples */}
      <MotionRipples motion={motion} position={[0, 0, 0]} />

      {/* Glow Effect for High Temperature */}
      {glowIntensity > 0 && (
        <mesh ref={glowRef} position={[0, 1.5, 0]}>
          <boxGeometry args={[2.2, 3.2, 1.7]} />
          <meshBasicMaterial 
            color="#ff0000"
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Container Lid/Top */}
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[2.2, 0.2, 1.7]} />
        <meshStandardMaterial color="#6b5b3d" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Base Platform */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[2.4, 0.2, 1.9]} />
        <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Support Legs */}
      {[[-0.9, -0.7], [0.9, -0.7], [-0.9, 0.7], [0.9, 0.7]].map((pos, i) => (
        <mesh key={i} position={[pos[0], -0.3, pos[1]]}>
          <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          <meshStandardMaterial color="#1a202c" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Status Badge - Centered above rings */}
      <StatusBadge status={status} position={[0, 4.8, 0]} />

      {/* Grid Helper (optional - for reference) */}
      <gridHelper args={[8, 8, '#4a5568', '#2d3748']} position={[0, -0.5, 0]} />
    </group>
  );
}

/**
 * Main GrainContainer3D Component
 */
function GrainContainer3D({ data }) {
  const temperature = data?.temperature || 25;
  const humidity = data?.humidity || 50;
  const motion = data?.motion || false;

  return (
    <div className="grain-container-3d">
      <Canvas 
        shadows 
        camera={{ position: [4, 3, 6], fov: 50 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          {/* Enhanced Lighting Setup */}
          <ambientLight intensity={0.3} />
          
          {/* Main spotlight for dramatic effect */}
          <spotLight
            position={[5, 8, 5]}
            angle={0.3}
            penumbra={1}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          
          {/* Fill lights */}
          <directionalLight position={[-5, 5, -5]} intensity={0.4} />
          <pointLight position={[0, 6, 0]} intensity={0.5} color="#ffffff" />
          
          {/* Rim lighting for container edges */}
          <pointLight position={[3, 1, 3]} intensity={0.8} color="#4a90e2" />
          <pointLight position={[-3, 1, -3]} intensity={0.6} color="#f39c12" />
          
          {/* Environment for realistic reflections */}
          <Environment preset="sunset" />
          
          {/* Storage Room/Warehouse Environment */}
          <StorageRoom />
          
          {/* Particle Effects */}
          <SteamParticles temperature={temperature} position={[0, 3, 0]} />
          <WaterDroplets humidity={humidity} position={[2.5, 0, 0]} />
          
          {/* Critical Alert Glow */}
          <CriticalAlertGlow temperature={temperature} humidity={humidity} />
          
          {/* 3D Container */}
          <Container 
            temperature={temperature}
            humidity={humidity}
            motion={motion}
          />
          
          {/* Camera Controls - Centered zoom on container */}
          <OrbitControls
            target={[0, 2.5, 0]}
            enableZoom={true}
            enableRotate={true}
            enablePan={false}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Suspense>
      </Canvas>

      {/* Info Panel */}
      <div className="container-info">
        <div className="info-item">
          <span className="info-label">🌡️ Temperature:</span>
          <span className="info-value">{temperature.toFixed(1)}°C</span>
        </div>
        <div className="info-item">
          <span className="info-label">💧 Humidity:</span>
          <span className="info-value">{humidity.toFixed(1)}%</span>
        </div>
        <div className="info-item">
          <span className="info-label">👁️ Motion:</span>
          <span className="info-value">{motion ? 'Detected' : 'Clear'}</span>
        </div>
      </div>

      {/* Color Legend */}
      <div className="color-legend">
        <div className="legend-title">Temperature Guide</div>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#3b82f6' }}></div>
            <span>&lt; 15°C Cold</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#10b981' }}></div>
            <span>15-25°C Optimal</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#fbbf24' }}></div>
            <span>25-30°C Warm</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#f97316' }}></div>
            <span>30-35°C Hot</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ background: '#ef4444' }}></div>
            <span>&gt; 35°C Critical</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GrainContainer3D;
