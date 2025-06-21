/**
 * CourtLines.js
 *
 * This module is responsible for creating all the line markings on the basketball court,
 * including the center line, center circle, three-point lines, and the free-throw areas.
 * It exports a single function, `createCourtLines`, which orchestrates the drawing of all lines.
 */

/**
 * Creates and adds all court line markings to the scene.
 * This function acts as an orchestrator, calling helper functions to draw each part.
 * @param {THREE.Scene} scene - The main Three.js scene to add the lines to.
 */
export function createCourtLines(scene) {
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 2 // Note: may not be effective on all WebGL renderers
    });

    createCenterLine(scene, lineMaterial);
    createCenterCircle(scene, lineMaterial);

    // Create mirrored lines for both sides of the court
    [-1, 1].forEach(side => {
        createThreePointLine(scene, side, lineMaterial);
        createFreeThrowAreaLines(scene, side, lineMaterial);
    });
}

// --- Helper Functions ---

/**
 * Creates the vertical center line of the court.
 * @param {THREE.Scene} scene - The scene to add the line to.
 * @param {THREE.Material} material - The material for the line.
 */
function createCenterLine(scene, material) {
    const geometry = new THREE.BufferGeometry();
    const points = [
        new THREE.Vector3(0, 0.11, -7.5),  // From one sideline to the other
        new THREE.Vector3(0, 0.11, 7.5)
    ];
    geometry.setFromPoints(points);
    const line = new THREE.Line(geometry, material);
    scene.add(line);
}

/**
 * Creates the center circle of the court.
 * @param {THREE.Scene} scene - The scene to add the circle to.
 * @param {THREE.Material} material - The material for the circle.
 */
function createCenterCircle(scene, material) {
    const points = [];
    const radius = 1.8; // Standard FIBA center circle radius (1.8m)
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        points.push(new THREE.Vector3(x, 0.11, z));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const circle = new THREE.Line(geometry, material);
    scene.add(circle);
}

/**
 * Creates the free-throw lane lines and the semi-circle.
 * @param {THREE.Scene} scene - The scene to add the lines to.
 * @param {number} side - Determines the court side (-1 for left, 1 for right).
 * @param {THREE.Material} material - The material for the lines.
 */
function createFreeThrowAreaLines(scene, side, material) {
    const courtLength = 30;
    const keyWidth = 3.6; // Standard FIBA key width (3.6m)
    const freeThrowLineDistance = 5.8; // Standard FIBA distance from baseline (5.8m)
    const baselineX = side * (courtLength / 2);
    const freeThrowLineX = side * (courtLength / 2 - freeThrowLineDistance);

    // Create the two parallel lines of the key (the lane lines)
    const laneLinePoints1 = [
        new THREE.Vector3(baselineX, 0.11, -keyWidth / 2),
        new THREE.Vector3(freeThrowLineX, 0.11, -keyWidth / 2)
    ];
    const laneLineGeom1 = new THREE.BufferGeometry().setFromPoints(laneLinePoints1);
    const laneLine1 = new THREE.Line(laneLineGeom1, material);
    scene.add(laneLine1);

    const laneLinePoints2 = [
        new THREE.Vector3(baselineX, 0.11, keyWidth / 2),
        new THREE.Vector3(freeThrowLineX, 0.11, keyWidth / 2)
    ];
    const laneLineGeom2 = new THREE.BufferGeometry().setFromPoints(laneLinePoints2);
    const laneLine2 = new THREE.Line(laneLineGeom2, material);
    scene.add(laneLine2);

    // Create the free-throw line connecting the lane lines
    const freeThrowLinePoints = [
        new THREE.Vector3(freeThrowLineX, 0.11, -keyWidth / 2),
        new THREE.Vector3(freeThrowLineX, 0.11, keyWidth / 2)
    ];
    const freeThrowLineGeom = new THREE.BufferGeometry().setFromPoints(freeThrowLinePoints);
    const freeThrowLine = new THREE.Line(freeThrowLineGeom, material);
    scene.add(freeThrowLine);

    // Create the free-throw semi-circle
    const circleRadius = keyWidth / 2; // The semi-circle's radius is half the key width
    const arcPoints = [];
    const segments = 32;

    for (let i = 0; i <= segments; i++) {
        // Creates a 180-degree arc for the semi-circle
        const angle = (i / segments) * Math.PI - Math.PI / 2;
        const x = freeThrowLineX - side * Math.cos(angle) * circleRadius;
        const z = Math.sin(angle) * circleRadius;
        arcPoints.push(new THREE.Vector3(x, 0.11, z));
    }

    const arcGeom = new THREE.BufferGeometry().setFromPoints(arcPoints);
    const freeThrowArc = new THREE.Line(arcGeom, material);
    scene.add(freeThrowArc);
}

/**
 * Creates a three-point line, including the straight and curved sections.
 * @param {THREE.Scene} scene - The scene to add the line to.
 * @param {number} side - Determines the court side (-1 for left, 1 for right).
 * @param {THREE.Material} material - The material for the line.
 */
function createThreePointLine(scene, side, material) {
    const points = [];
    const courtLength = 30;
    const courtWidth = 15;
    const baselineX = side * (courtLength / 2);

    const threePointRadius = 6.75; // FIBA 3-point line radius
    const hoopDistanceFromBaseline = 1.575; // FIBA distance
    const hoopX = side * (courtLength / 2 - hoopDistanceFromBaseline);

    // The straight part of the 3-point line runs parallel to the sideline.
    const threePointLineFromSideline = 1.4;
    const straightLineZ = courtWidth / 2 - threePointLineFromSideline;

    // Calculate the angle where the straight line meets the arc
    const intersectAngle = Math.asin(straightLineZ / threePointRadius);
    const intersectX = hoopX - side * Math.cos(intersectAngle) * threePointRadius;

    // 1. First straight line (from baseline to the start of the arc)
    points.push(new THREE.Vector3(baselineX, 0.11, straightLineZ));
    points.push(new THREE.Vector3(intersectX, 0.11, straightLineZ));

    // 2. The main arc
    const arcSegments = 40;
    const startAngle = intersectAngle;
    const endAngle = -intersectAngle;

    for (let i = 0; i <= arcSegments; i++) {
        const angle = startAngle + (endAngle - startAngle) * (i / arcSegments);
        const x = hoopX - side * Math.cos(angle) * threePointRadius;
        const z = Math.sin(angle) * threePointRadius;
        points.push(new THREE.Vector3(x, 0.11, z));
    }

    // 3. Second straight line (from the end of the arc back to the baseline)
    points.push(new THREE.Vector3(intersectX, 0.11, -straightLineZ));
    points.push(new THREE.Vector3(baselineX, 0.11, -straightLineZ));

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const threePointLine = new THREE.Line(lineGeometry, material);
    scene.add(threePointLine);
}