/**
 * Basketball.js
 *
 * This module is responsible for creating a realistic 3D basketball,
 * complete with a textured surface and seams. It exports a single function
 * that creates the ball and adds it to the scene.
 */

// --- Constants & Dimensions (in meters) ---
const BALL_RADIUS = 0.12; // Standard NBA ball radius is ~12cm
const SEAM_THICKNESS = 0.0035;

/**
 * Main function to create the basketball and add it to the scene.
 * @param {THREE.Scene} scene - The main scene.
 */
export function createBasketball(scene) {
    const basketballGroup = new THREE.Group();
    basketballGroup.position.set(0, BALL_RADIUS + 0.1, 0); // Place it on the floor

    // --- Texture Loading ---
    const textureLoader = new THREE.TextureLoader();
    const basketballTexture = textureLoader.load('src/assets/textures/basketball_surface.jpg');

    // --- Materials ---
    const ballMaterial = new THREE.MeshPhongMaterial({
        map: basketballTexture,       // Use the image for the color
        bumpMap: basketballTexture,   // Use the same image to create the bumpy surface
        bumpScale: 0.002,             // A very small value for a subtle bumpy effect
        shininess: 30
    });
    const seamMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // --- Assemble Components ---
    createBallSphere(basketballGroup, ballMaterial);
    createBallSeams(basketballGroup, seamMaterial);

    scene.add(basketballGroup);
}

// --- Helper Functions for Basketball Components ---

/**
 * Creates the main sphere of the basketball.
 * @param {THREE.Group} group - The group to add the sphere to.
 * @param {THREE.Material} material - The textured material for the sphere.
 */
function createBallSphere(group, material) {
    const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const ball = new THREE.Mesh(ballGeometry, material);
    group.add(ball);
}

/**
 * Creates the seams on the basketball's surface.
 * A standard basketball has a pattern of three intersecting great circles.
 * This is created by adding three perpendicular torus geometries.
 * @param {THREE.Group} group - The group to add the seams to.
 * @param {THREE.Material} material - The material for the seams.
 */
function createBallSeams(group, material) {
    const seamRadius = BALL_RADIUS + 0.001; // Place seams just above the surface

    // Seam 1: Horizontal Equator (in the XZ plane)
    const equatorGeom = new THREE.TorusGeometry(seamRadius, SEAM_THICKNESS, 16, 100);
    const equator = new THREE.Mesh(equatorGeom, material);
    equator.rotation.x = Math.PI / 2;
    group.add(equator);

    // Seam 2: Vertical Seam (in the XY plane)
    const verticalGeom1 = new THREE.TorusGeometry(seamRadius, SEAM_THICKNESS, 16, 100);
    const verticalSeam1 = new THREE.Mesh(verticalGeom1, material);
    group.add(verticalSeam1);

    // Seam 3: Perpendicular Vertical Seam (in the YZ plane)
    const verticalGeom2 = new THREE.TorusGeometry(seamRadius, SEAM_THICKNESS, 16, 100);
    const verticalSeam2 = new THREE.Mesh(verticalGeom2, material);
    verticalSeam2.rotation.y = Math.PI / 2;
    group.add(verticalSeam2);
} 