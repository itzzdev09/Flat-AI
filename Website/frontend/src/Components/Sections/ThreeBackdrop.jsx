import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackdrop = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return undefined;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf8fafc, 10, 26);

    const camera = new THREE.PerspectiveCamera(45, mountNode.clientWidth / mountNode.clientHeight, 0.1, 100);
    camera.position.set(0, 0.45, 6.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mountNode.clientWidth, mountNode.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountNode.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const coreGeometry = new THREE.IcosahedronGeometry(1.45, 2);
    const coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e40af,
      emissive: 0x0f172a,
      metalness: 0.28,
      roughness: 0.34,
      transparent: true,
      opacity: 0.96,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const ringGeometry = new THREE.TorusGeometry(2.25, 0.06, 16, 120);
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.68,
      roughness: 0.28,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2.2;
    group.add(ring);

    const haloGeometry = new THREE.TorusKnotGeometry(1.1, 0.18, 120, 16);
    const haloMaterial = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.45,
      roughness: 0.18,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.y = 0.6;
    group.add(halo);

    const lightA = new THREE.DirectionalLight(0xffffff, 1.7);
    lightA.position.set(3, 5, 4);
    scene.add(lightA);

    const lightB = new THREE.DirectionalLight(0x1e40af, 0.75);
    lightB.position.set(-4, -1, 3);
    scene.add(lightB);

    const ambient = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambient);

    const particles = new THREE.BufferGeometry();
    const particleCount = 140;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.035,
      transparent: true,
      opacity: 0.55,
    });
    const cloud = new THREE.Points(particles, particleMaterial);
    scene.add(cloud);

    let rafId;
    const animate = () => {
      rafId = window.requestAnimationFrame(animate);
      group.rotation.y += 0.0035;
      group.rotation.x = Math.sin(Date.now() * 0.00045) * 0.08;
      halo.rotation.z += 0.002;
      cloud.rotation.y -= 0.0008;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const { clientWidth, clientHeight } = mountNode;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) window.cancelAnimationFrame(rafId);
      coreGeometry.dispose();
      coreMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      haloGeometry.dispose();
      haloMaterial.dispose();
      particles.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="three-backdrop" aria-hidden="true" />;
};

export default ThreeBackdrop;

