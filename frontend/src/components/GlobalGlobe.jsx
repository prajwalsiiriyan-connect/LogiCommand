
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import world from 'world-atlas/countries-110m.json';
import { feature } from 'topojson-client';

const HUBS = [
  { name: 'Mumbai', lat: 19.076, lng: 72.878 },
  { name: 'Chennai', lat: 13.082, lng: 80.270 },
  { name: 'Delhi', lat: 28.614, lng: 77.209 },
  { name: 'Kochi', lat: 9.931, lng: 76.267 },
  { name: 'Colombo', lat: 6.927, lng: 79.862 },
  { name: 'Dubai', lat: 25.204, lng: 55.271 },
  { name: 'Jeddah', lat: 21.485, lng: 39.192 },
  { name: 'Singapore', lat: 1.352, lng: 103.820 },
  { name: 'Kuala Lumpur', lat: 3.139, lng: 101.687 },
  { name: 'Bangkok', lat: 13.756, lng: 100.502 },
  { name: 'Jakarta', lat: -6.208, lng: 106.845 },
  { name: 'Hong Kong', lat: 22.319, lng: 114.169 },
  { name: 'Shanghai', lat: 31.230, lng: 121.474 },
  { name: 'Shenzhen', lat: 22.543, lng: 114.058 },
  { name: 'Busan', lat: 35.180, lng: 129.075 },
  { name: 'Tokyo', lat: 35.676, lng: 139.650 },
  { name: 'Osaka', lat: 34.694, lng: 135.502 },
  { name: 'Manila', lat: 14.599, lng: 120.984 },
  { name: 'Sydney', lat: -33.869, lng: 151.209 },
  { name: 'Melbourne', lat: -37.814, lng: 144.963 },
  { name: 'Auckland', lat: -36.851, lng: 174.764 },
  { name: 'Rotterdam', lat: 51.924, lng: 4.478 },
  { name: 'London', lat: 51.507, lng: -0.128 },
  { name: 'Hamburg', lat: 53.551, lng: 9.993 },
  { name: 'Antwerp', lat: 51.219, lng: 4.402 },
  { name: 'Marseille', lat: 43.296, lng: 5.369 },
  { name: 'Barcelona', lat: 41.385, lng: 2.173 },
  { name: 'Istanbul', lat: 41.008, lng: 28.978 },
  { name: 'Athens', lat: 37.984, lng: 23.727 },
  { name: 'Lisbon', lat: 38.722, lng: -9.139 },
  { name: 'Cape Town', lat: -33.925, lng: 18.424 },
  { name: 'Lagos', lat: 6.524, lng: 3.379 },
  { name: 'Mombasa', lat: -4.043, lng: 39.668 },
  { name: 'New York', lat: 40.713, lng: -74.006 },
  { name: 'Los Angeles', lat: 33.749, lng: -118.244 },
  { name: 'Vancouver', lat: 49.283, lng: -123.121 },
  { name: 'Toronto', lat: 43.653, lng: -79.383 },
  { name: 'Miami', lat: 25.762, lng: -80.192 },
  { name: 'Santos', lat: -23.961, lng: -46.333 },
  { name: 'Panama City', lat: 8.983, lng: -79.519 },
  { name: 'Buenos Aires', lat: -34.604, lng: -58.382 },
  { name: 'Rio de Janeiro', lat: -22.907, lng: -43.173 }
];

const ROUTES = [
  ['Mumbai','Dubai'], ['Mumbai','Singapore'], ['Mumbai','Jeddah'],
  ['Mumbai','Rotterdam'], ['Mumbai','Colombo'], ['Mumbai','Chennai'],
  ['Mumbai','Delhi'], ['Chennai','Singapore'], ['Chennai','Kuala Lumpur'],
  ['Kochi','Colombo'], ['Kochi','Dubai'], ['Colombo','Singapore'],
  ['Dubai','Rotterdam'], ['Dubai','Istanbul'], ['Dubai','Cape Town'],
  ['Dubai','Jeddah'], ['Jeddah','Mombasa'], ['Singapore','Bangkok'],
  ['Singapore','Jakarta'], ['Singapore','Hong Kong'], ['Singapore','Shanghai'],
  ['Singapore','Tokyo'], ['Singapore','Sydney'], ['Singapore','Manila'],
  ['Singapore','Cape Town'], ['Kuala Lumpur','Jakarta'],
  ['Bangkok','Hong Kong'], ['Bangkok','Shanghai'], ['Jakarta','Sydney'],
  ['Hong Kong','Shenzhen'], ['Hong Kong','Shanghai'], ['Hong Kong','Manila'],
  ['Shanghai','Tokyo'], ['Shanghai','Busan'], ['Shanghai','Los Angeles'],
  ['Shenzhen','Busan'], ['Busan','Tokyo'], ['Busan','Vancouver'],
  ['Tokyo','Osaka'], ['Tokyo','Sydney'], ['Tokyo','Los Angeles'],
  ['Manila','Sydney'], ['Sydney','Melbourne'], ['Sydney','Auckland'],
  ['Melbourne','Auckland'], ['Rotterdam','London'], ['Rotterdam','Hamburg'],
  ['Rotterdam','Antwerp'], ['Rotterdam','New York'], ['Rotterdam','Barcelona'],
  ['London','Hamburg'], ['London','Lisbon'], ['London','New York'],
  ['London','Toronto'], ['Hamburg','Antwerp'], ['Antwerp','Marseille'],
  ['Marseille','Barcelona'], ['Barcelona','Lisbon'], ['Istanbul','Athens'],
  ['Istanbul','Mumbai'], ['Athens','Marseille'], ['Lisbon','New York'],
  ['Cape Town','Singapore'], ['Cape Town','Lagos'], ['Cape Town','Santos'],
  ['Lagos','Mombasa'], ['Mombasa','Dubai'], ['New York','Toronto'],
  ['New York','Miami'], ['New York','Santos'], ['New York','Los Angeles'],
  ['Los Angeles','Vancouver'], ['Los Angeles','Sydney'], ['Vancouver','Tokyo'],
  ['Miami','Panama City'], ['Panama City','Santos'], ['Santos','Buenos Aires'],
  ['Santos','Rio de Janeiro'], ['Buenos Aires','Cape Town'],
  ['Rio de Janeiro','Lisbon'], ['Miami','London'], ['Toronto','Hamburg']
];

function latLngToVector(globe, lat, lng, altitude = 0.02) {
  const coords = globe.getCoords(lat, lng, altitude);

  return new THREE.Vector3(
    coords.x,
    coords.y,
    coords.z
  );
}

function createRouteCurve(globe, from, to, baseRadius) {
  const start = latLngToVector(globe, from.lat, from.lng, 0.003);
  const end = latLngToVector(globe, to.lat, to.lng, 0.003);

  const points = [];
  const steps = 80;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const direction = start.clone()
      .lerp(end, t)
      .normalize();

    const height = Math.sin(Math.PI * t) * baseRadius * 0.012;

    points.push(
      direction.multiplyScalar(baseRadius * 1.003 + height)
    );
  }

  return new THREE.CatmullRomCurve3(points);
}

export default function GlobalGlobe() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frameId;
    let disposed = false;
    let resizeObserver;

    const scene = new THREE.Scene();

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Camera with a wide view of the planetary horizon.
    const camera = new THREE.PerspectiveCamera(
      42,
      width / height,
      0.1,
      10000
    );

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(
  Math.min(window.devicePixelRatio || 1, 1.25)
);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // Countries, excluding Antarctica.
    const countries = feature(
      world,
      world.objects.countries
    ).features.filter(
      country => country.properties?.name !== 'Antarctica'
    );

    // Build the real spherical Earth.
    const globe = new ThreeGlobe();

    globe
      .showGlobe(true)
      .showAtmosphere(true)
      .atmosphereColor('#168fff')
      .atmosphereAltitude(0.18)
      .showGraticules(false);

    globe.globeMaterial(
      new THREE.MeshPhongMaterial({
        color: 0x09243c,
        emissive: 0x04172b,
        emissiveIntensity: 0.65,
        shininess: 45,
        specular: new THREE.Color(0x174a70)
      })
    );

    // Read the actual radius provided by ThreeGlobe.
    const baseRadius = globe.getGlobeRadius();

    /*
      LARGE PLANETARY HORIZON

      Scale the Earth according to viewport width.
      Position its centre far below the screen centre.
      This frames the upper surface as a broad curved horizon.
    */

    // TRUE EARTH HORIZON - natural ThreeGlobe radius
const targetEarthRadius = baseRadius * 1.15;

const cameraDistance = targetEarthRadius * 1.43;
const earthCenterY = targetEarthRadius;

camera.position.set(0, 0, cameraDistance);
camera.lookAt(0, 0, 0);

globe.scale.setScalar(targetEarthRadius / baseRadius);
globe.position.set(0, -earthCenterY, 0);

globe.rotation.x = -0.12;
globe.rotation.y = -0.35;

    // Country borders follow the spherical surface.
    globe
      .polygonsData(countries)
      .polygonGeoJsonGeometry('geometry')
      .polygonAltitude(0.006)
      .polygonCapColor(() => 'rgba(10, 65, 105, 0.42)')
      .polygonSideColor(() => 'rgba(5, 25, 45, 0.12)')
      .polygonStrokeColor(() => 'rgba(45, 180, 235, 0.82)')
      .polygonsTransitionDuration(0);

    // Global logistics hubs.
    const hubLookup = Object.fromEntries(
      HUBS.map(hub => [hub.name, hub])
    );

    const hubData = HUBS.map((hub, index) => ({
      ...hub,
      type: index === 0 ? 'main' : 'hub'
    }));

    globe
      .pointsData(hubData)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude(0.012)
      .pointRadius(point =>
        point.type === 'main' ? 0.48 : 0.28
      )
      .pointColor(point =>
        point.type === 'main' ? '#ffffff' : '#61e5ff'
      )
      .pointsMerge(true);

    

    // Add the Earth to the scene.
    scene.add(globe);

    // Permanent routes and moving signals.
    const movingSignals = [];

    ROUTES.forEach(([from, to], routeIndex) => {
      const startHub = hubLookup[from];
      const endHub = hubLookup[to];

      if (!startHub || !endHub) return;

      const curve = createRouteCurve(
        globe,
        startHub,
        endHub,
        baseRadius
      );

      const routeGeometry = new THREE.BufferGeometry()
        .setFromPoints(curve.getPoints(100));

      const routeMaterial = new THREE.LineBasicMaterial({
        color: 0x16a9e8,
        transparent: true,
        opacity: 0.48,
        depthWrite: false
      });

      globe.add(
        new THREE.Line(routeGeometry, routeMaterial)
      );

      // Two moving light signals per route.
      for (let i = 0; i < 1; i++) {
        const signal = new THREE.Mesh(
          new THREE.SphereGeometry(0.85, 8, 8),
          new THREE.MeshBasicMaterial({
            color: i === 0 ? 0xc4f8ff : 0x35dfff
          })
        );

        globe.add(signal);

        movingSignals.push({
          mesh: signal,
          curve,
          progress: (
            i * 0.5 + (routeIndex % 7) / 7
          ) % 1,
          speed: 0.045 + (routeIndex % 5) * 0.003
        });
      }
    });

    // Deep-space background stars.
    const starPositions = [];

    for (let i = 0; i < 350; i++) {
      starPositions.push(
        (Math.random() - 0.5) * targetEarthRadius * 3.5,
        (Math.random() - 0.5) * targetEarthRadius * 2.2,
        -targetEarthRadius * 1.8 - Math.random() * targetEarthRadius
      );
    }

    const starGeometry = new THREE.BufferGeometry();

    starGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0x75caff,
        size: 1.15,
        transparent: true,
        opacity: 0.5
      })
    );

    scene.add(stars);

    // Planet lighting.
    scene.add(
      new THREE.AmbientLight(0x8bbfff, 1.15)
    );

    const sunlight = new THREE.DirectionalLight(
      0x9cddff,
      2.0
    );

    sunlight.position.set(
      -targetEarthRadius * 0.7,
      targetEarthRadius * 0.5,
      targetEarthRadius * 1.3
    );

    scene.add(sunlight);

    const rimLight = new THREE.PointLight(
      0x087fff,
      2.5,
      targetEarthRadius * 3
    );

    rimLight.position.set(
      targetEarthRadius * 0.7,
      -targetEarthRadius * 0.7,
      targetEarthRadius
    );

    scene.add(rimLight);

    // Animation.
    const clock = new THREE.Clock();

   let globeRevealed = false; 
    function animate() {
      if (disposed) return;

      frameId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Slow rotation of the entire Earth and its logistics network.
      globe.rotation.y = -0.35 + elapsed * 0.012;

      movingSignals.forEach(item => {
        item.progress = (
          item.progress + item.speed * 0.012
        ) % 1;

        item.mesh.position.copy(
          item.curve.getPointAt(item.progress)
        );
      });

      stars.rotation.y = elapsed * 0.0008;

      renderer.render(scene, camera);

// Reveal the globe after its first frame is rendered.
if (!globeRevealed) {
  globeRevealed = true;

  requestAnimationFrame(() => {
    if (!disposed) {
      renderer.domElement.classList.add('lc-globe-ready');
    }
  });
}
    }

    animate();

    
    // Responsive renderer sizing
    resizeObserver = new ResizeObserver(() => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      if (!newWidth || !newHeight) return;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(newWidth, newHeight);
    });

    resizeObserver.observe(container);


    
    // Cleanup
    return () => {
      disposed = true;

      cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();

      globe._destructor?.();

      scene.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose();
        }

        if (object.material) {
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach((material) => {
            material.dispose();
          });
        }
      });

      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      className="lc-globe-container"
      ref={containerRef}
      aria-hidden="true"
    />
  );
}

