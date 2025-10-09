const scene = new THREE.Scene();

const skyGradient = [
  "#001f3f", "#003366", "#004d99", "#0066cc",
  "#0080ff", "#1a8cff", "#3399ff", "#4da6ff",
  "#66b3ff", "#80c0ff", "#99ccff", "#b3d9ff",
  "#cce6ff", "#e0f0ff", "#f0f7ff", "#f5fbff"
];

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 2;
canvas.height = 512;

const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
for (let i = 0; i < skyGradient.length; i++) {
  gradient.addColorStop(i / (skyGradient.length - 1), skyGradient[i]);
}
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

const texture = new THREE.CanvasTexture(canvas);
texture.minFilter = THREE.LinearFilter;
texture.magFilter = THREE.LinearFilter;

const skyGeometry = new THREE.SphereGeometry(128, 32, 32);
const skyMaterial = new THREE.MeshBasicMaterial({
  map: texture,
  side: THREE.BackSide
});
const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(skyDome);

const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 64);

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

const bluePalette = [
  "#001f3f", "#003366", "#004080", "#0059b3",
  "#0073e6", "#3399ff", "#66b2ff", "#99ccff",
  "#cce5ff", "#e6f2ff", "#b3d9ff", "#80c1ff",
  "#4da9ff", "#1a91ff", "#007acc", "#005c99"
].map(hex => new THREE.Color(hex));

const geometry = new THREE.PlaneGeometry(256, 256, 128, 128);
geometry.setAttribute('color', new THREE.Float32BufferAttribute(new Array(geometry.attributes.position.count * 3), 3));

const material = new THREE.MeshBasicMaterial({ vertexColors: true });
const sea = new THREE.Mesh(geometry, material);
sea.rotation.x = -Math.PI / 2;
scene.add(sea);

function animate() {
  requestAnimationFrame(animate);
  const time = performance.now() * 0.001;
  const pos = geometry.attributes.position;
  const col = geometry.attributes.color;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const wave1 = Math.sin(x * 0.3 + time * 1.2);
    const wave2 = Math.cos(y * 0.4 + time * 0.8);
    const wave3 = Math.sin((x + y) * 0.2 + time * 1.5);
    const wave4 = Math.sin(x * 0.1 - y * 0.1 + time * 2.0);
    const z = (wave1 + wave2 + wave3 + wave4) * 0.5;
    pos.setZ(i, z);

    const normalized = (z + 2) / 4;
    const index = Math.max(0, Math.min(15, Math.floor(normalized * 15)));
    const color = bluePalette[index];
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
