// Hoops.js - Basketball hoops, backboards, rims, nets, and supports
// This file is structured to be modular, with helper functions for each component.

// --- Constants & Dimensions ---
const COURT_LENGTH = 30;
const HOOP_HEIGHT = 3.05; // 10 feet
const BACKBOARD_WIDTH = 1.8;
const BACKBOARD_HEIGHT = 1.05;
const RIM_RADIUS = 0.225;
const RIM_TUBE_THICKNESS = 0.02;
const MAIN_POLE_HEIGHT = 3.85;
const ARM_THICKNESS = 0.08;
const HORIZONTAL_ARM_LENGTH = 0.73;
const BACKBOARD_SUPPORT_HEIGHT = 0.5;

// Main function to create and add both hoops to the scene.
export function createHoops(scene) {
    // Create and add both hoops, one on each side of the court.
    addHoop(scene, 1);  // Right side
    addHoop(scene, -1); // Left side
}

/**
 * Creates a single complete hoop assembly and adds it to the scene.
 * @param {THREE.Scene} scene - The main scene.
 * @param {number} side - Determines the side of the court (-1 for left, 1 for right).
 */
function addHoop(scene, side) {
    const hoopGroup = new THREE.Group();

    // --- Materials ---
    const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x606060, metalness: 0.3, roughness: 0.5 });
    const backboardMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xffa500, metalness: 0.2, roughness: 0.1 });
    const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const markingMaterial = new THREE.LineBasicMaterial({ color: 0x333333, linewidth: 2 });

    // --- Positions ---
    const baselineX = side * (COURT_LENGTH / 2);
    const backboardX = baselineX + 0.02; // Position backboard slightly behind baseline
    const poleX = backboardX + side * HORIZONTAL_ARM_LENGTH;
    const rimX = backboardX - side * (RIM_RADIUS + 0.05);

    // --- Component Creation ---
    createSupport(hoopGroup, supportMaterial, { poleX, backboardX }, side);
    const backboard = createBackboard(hoopGroup, backboardMaterial, { backboardX });
    createBackboardMarkings(hoopGroup, markingMaterial, backboard.position, side);
    createRim(hoopGroup, rimMaterial, { rimX });
    createNet(hoopGroup, netMaterial, { rimX });

    scene.add(hoopGroup);
}

// --- Helper Functions for Hoop Components ---

/**
 * Creates the support structure (pole and arms) for the hoop.
 */
function createSupport(group, material, positions, side) {
    const { poleX, backboardX } = positions;

    // 1. Main Vertical Pole
    const mainPoleGeometry = new THREE.CylinderGeometry(0.08, 0.08, MAIN_POLE_HEIGHT, 32);
    const mainPole = new THREE.Mesh(mainPoleGeometry, material);
    mainPole.position.set(poleX, MAIN_POLE_HEIGHT / 2, 0);
    group.add(mainPole);

    // 2. Horizontal Arm
    const armY = MAIN_POLE_HEIGHT - 0.7;
    const horizontalArmGeometry = new THREE.BoxGeometry(HORIZONTAL_ARM_LENGTH, ARM_THICKNESS, ARM_THICKNESS);
    const horizontalArm = new THREE.Mesh(horizontalArmGeometry, material);
    horizontalArm.position.set(backboardX + side * (HORIZONTAL_ARM_LENGTH / 2), armY, 0);
    group.add(horizontalArm);

    // 3. Backboard Support
    const backboardSupportGeometry = new THREE.BoxGeometry(ARM_THICKNESS, BACKBOARD_SUPPORT_HEIGHT, ARM_THICKNESS);
    const backboardSupport = new THREE.Mesh(backboardSupportGeometry, material);
    backboardSupport.position.set(backboardX, armY - (BACKBOARD_SUPPORT_HEIGHT / 2), 0);
    group.add(backboardSupport);
}

/**
 * Creates the backboard.
 * @returns {THREE.Mesh} The created backboard mesh.
 */
function createBackboard(group, material, positions) {
    const { backboardX } = positions;
    const armY = MAIN_POLE_HEIGHT - 0.7;

    const backboardGeometry = new THREE.BoxGeometry(0.1, BACKBOARD_HEIGHT, BACKBOARD_WIDTH);
    const backboard = new THREE.Mesh(backboardGeometry, material);
    backboard.position.set(backboardX, armY - (BACKBOARD_SUPPORT_HEIGHT / 2) + 0.2, 0);
    group.add(backboard);
    return backboard;
}

/**
 * Creates the markings on the backboard (inner rectangle).
 */
function createBackboardMarkings(group, material, backboardPosition, side) {
    const lineX = backboardPosition.x - side * 0.06; // Place lines just in front of the board
    const lineY = backboardPosition.y;
    const lineZ = backboardPosition.z;

    const innerWidth = 0.7;
    const innerHeight = 0.45;
    const points = [
        new THREE.Vector3(lineX, lineY - innerHeight / 2, lineZ - innerWidth / 2),
        new THREE.Vector3(lineX, lineY - innerHeight / 2, lineZ + innerWidth / 2),
        new THREE.Vector3(lineX, lineY + innerHeight / 2, lineZ + innerWidth / 2),
        new THREE.Vector3(lineX, lineY + innerHeight / 2, lineZ - innerWidth / 2),
        new THREE.Vector3(lineX, lineY - innerHeight / 2, lineZ - innerWidth / 2)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    group.add(line);
}

/**
 * Creates the basketball rim.
 */
function createRim(group, material, positions) {
    const { rimX } = positions;
    const rimGeometry = new THREE.TorusGeometry(RIM_RADIUS, RIM_TUBE_THICKNESS, 16, 100);
    const rim = new THREE.Mesh(rimGeometry, material);
    rim.position.set(rimX, HOOP_HEIGHT, 0);
    rim.rotation.x = Math.PI / 2;
    group.add(rim);
}

/**
 * Creates the "puffy" basketball net.
 */
function createNet(group, material, positions) {
    const { rimX } = positions;
    const netSegments = 12;
    const netRows = 8;
    const netBottomRadius = RIM_RADIUS * 0.6;
    const netHeightReal = 0.45;
    const netPuffiness = 0.02;

    const ringYs = [];
    const ringRadii = [];
    for (let row = 0; row <= netRows; row++) {
        const t = row / netRows;
        ringYs.push(HOOP_HEIGHT - t * netHeightReal);
        const baseRadius = RIM_RADIUS + (netBottomRadius - RIM_RADIUS) * t;
        const puff = netPuffiness * Math.sin(Math.PI * t);
        ringRadii.push(baseRadius + puff);
    }

    // Vertical lines
    for (let i = 0; i < netSegments; i++) {
        const angle = (i / netSegments) * Math.PI * 2;
        const points = [];
        for (let row = 0; row <= netRows; row++) {
            const x = rimX + Math.cos(angle) * ringRadii[row];
            const z = Math.sin(angle) * ringRadii[row];
            const y = ringYs[row];
            points.push(new THREE.Vector3(x, y, z));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const netLine = new THREE.Line(geometry, material);
        group.add(netLine);
    }

    // Horizontal rings
    for (let row = 1; row < netRows; row++) {
        const points = [];
        for (let i = 0; i <= netSegments; i++) {
            const angle = (i / netSegments) * Math.PI * 2;
            const x = rimX + Math.cos(angle) * ringRadii[row];
            const z = Math.sin(angle) * ringRadii[row];
            const y = ringYs[row];
            points.push(new THREE.Vector3(x, y, z));
        }
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const ringLine = new THREE.Line(geometry, material);
        group.add(ringLine);
    }

    // Diagonal lines
    for (let row = 0; row < netRows; row++) {
        for (let i = 0; i < netSegments; i++) {
            const angle1 = (i / netSegments) * Math.PI * 2;
            const angle2 = ((i + 1) % netSegments / netSegments) * Math.PI * 2;
            const x1 = rimX + Math.cos(angle1) * ringRadii[row];
            const z1 = Math.sin(angle1) * ringRadii[row];
            const y1 = ringYs[row];
            const x2 = rimX + Math.cos(angle2) * ringRadii[row + 1];
            const z2 = Math.sin(angle2) * ringRadii[row + 1];
            const y2 = ringYs[row + 1];
            const geometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(x1, y1, z1),
                new THREE.Vector3(x2, y2, z2)
            ]);
            const diagLine = new THREE.Line(geometry, material);
            group.add(diagLine);
        }
    }
}
