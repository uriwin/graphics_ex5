import {OrbitControls} from './utils/OrbitControls.js'
import {createCourtLines} from './components/CourtLines.js'
import {createHoops} from './components/Hoops.js'
import { Basketball } from './components/Basketball.js'
import {updateScoreDisplay} from './ui/Score.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// Set background color
scene.background = new THREE.Color(0x000000);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

// --- Court Creation ---
/**
 * Creates the main basketball court floor and adds its line markings.
 */
function createBasketballCourt() {
  // Load wood texture for the court floor
  const textureLoader = new THREE.TextureLoader();
  const woodTexture = textureLoader.load('src/assets/textures/wood_floor.jpg');
  woodTexture.wrapS = THREE.RepeatWrapping;
  woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 4); // Adjust tiling for better appearance

  // Court floor - now with a realistic texture
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({ 
    map: woodTexture,
    shininess: 50
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
  
  createCourtLines(scene);
  createHoops(scene);
}

// --- Scene Assembly ---
createBasketballCourt();
const basketball = new Basketball(scene);

// Set camera position for better view
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// --- UI Framework ---
const controlsElement = document.getElementById('controls-display');

// This function updates the controls UI based on the current state.
function updateControlsDisplay() {
    if (controlsElement) {
        controlsElement.innerHTML = `
          <h3>Controls:</h3>
          <p>Arrows - Move | Space - Shoot | W/S - Power</p>
          <p>R - Reset Ball | T - Reset Score | O - Camera</p>
        `;
    }
}

/**
 * Handles keyboard input for toggling camera controls.
 * @param {KeyboardEvent} e - The keyboard event.
 */
function handleKeyDown(e) {
    if (e.key.toLowerCase() === "o") {
        isOrbitEnabled = !isOrbitEnabled;
        updateControlsDisplay();
    }
}
document.addEventListener('keydown', handleKeyDown);

// Initialize the UI on load
updateControlsDisplay();
updateScoreDisplay();

// Animation function
function animate() {
  requestAnimationFrame(animate);
  
  // Update controls
  controls.enabled = isOrbitEnabled;
  basketball.update();
  controls.update();
  
  renderer.render(scene, camera);
}

animate();

