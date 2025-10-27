import * as THREE from 'https://unpkg.com/three@0.150.0/build/three.module.js';

const scene: THREE.Scene = new THREE.Scene();

const skyGradient: string[] = [
  "#001f3f", "#003366", "#004d99", "#0066cc",
  "#0080ff", "#1a8cff", "#3399ff", "#4da6ff",
  "#66b3ff", "#80c0ff", "#99ccff", "#b3d9ff",
  "#cce6ff", "#e0f0ff", "#f0f7ff", "#f5fbff"
];

const canvas: HTMLCanvasElement = document.createElement('canvas');
const ctx = canvas.getContext('2d')!;
canvas.width = 2;
canvas.height = 512;

const gradient: CanvasGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
for (let i = 0; i < skyGradient.length; i++) {
  gradient.addColorStop(i / (skyGradient.length - 1), skyGradient[i]);
}
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

const texture: THREE.CanvasTexture = new THREE.CanvasTexture(canvas);
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;

const skyGeometry: THREE.SphereGeometry = new THREE.SphereGeometry(128, 32, 32);
const skyMaterial: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.BackSide
});
const skyDome: THREE.Mesh = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skyDome);

const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 64);

const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container')!.appendChild(renderer.domElement);

const bluePalette: THREE.Color[] = [];
for (let i = 0; i < 256; i++) {
  const t = i / 255;
  const minLightness = 0.15;
  const maxLightness = 1.0;
  const lightness = minLightness + t * (maxLightness - minLightness);
  const color: THREE.Color = new THREE.Color().setHSL(0.6, 1.0, lightness);
  bluePalette.push(color);
}

const geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(256, 256, 256, 256);
geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Array(geometry.attributes.position.count * 3), 3));

const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });
const sea: THREE.Mesh = new THREE.Mesh(geometry, material);
sea.rotation.x = -Math.PI / 2;
scene.add(sea);

function animate(): void {
  requestAnimationFrame(animate);
  const time: number = performance.now() * 0.001;
  const pos = geometry.attributes.position as THREE.BufferAttribute;
  const col = geometry.attributes.color as THREE.BufferAttribute;

  for (let i = 0; i < pos.count; i++) {
    const x: number = pos.getX(i);
    const y: number = pos.getY(i);
    const wave1: number = Math.sin(x * 0.3 + time * 1.2);
    const wave2: number = Math.cos(y * 0.4 + time * 0.8);
    const wave3: number = Math.sin((x + y) * 0.2 + time * 1.5);
    const wave4: number = Math.sin(x * 0.1 - y * 0.1 + time * 2.0);
    const z: number = (wave1 + wave2 + wave3 + wave4) * 0.5;
    pos.setZ(i, z);

    const normalized: number = (z + 2) / 4;
    const index: number = Math.max(0, Math.min(255, Math.floor(normalized * 255)));
    const color: THREE.Color = bluePalette[index];
    col.setXYZ(i, color.r, color.g, color.b);
  }

  pos.needsUpdate = true;
  col.needsUpdate = true;

  camera.position.x = Math.sin(time * 0.2) * 5;
  camera.position.y = 5 + Math.sin(time * 0.1) * 0.5;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
