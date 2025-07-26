/**
 * Basketball.js
 *
 * This module is responsible for creating a realistic 3D basketball. It exports
 * a class that manages the ball's creation, state, and user-controlled movement.
 */

// --- Constants & Dimensions (in meters) ---
const BALL_RADIUS = 0.12;
const SEAM_THICKNESS = 0.0035;
const BALL_COURT_MOVEMENT_SPEED = 0.05;
const COURT_BOUNDARIES = {
    x: 14.8, // A little less than the court half-width to keep the ball in bounds
    z: 7.3   // A little less than the court half-length
};

const MOVEMENT_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's']);
const GRAVITY = -9.8; // m/s^2
const FRAME_RATE = 60; // frames per second
const DT = 1 / FRAME_RATE; // time step in seconds
const BALL_START_POS = { x: 0, y: BALL_RADIUS + 0.1, z: 0 };
const HOOP_X = [15, -15]; // X positions for both hoops (centered on z=0)
const BALL_BOUNCINESS = 0.7; 
const COURT_SURFACE_Y = 0.1; // Court surface is at y=0.1 (court is 0.2 thick, centered at y=0)
const VELOCITY_THRESHOLD = 1; // Increased from 0.05 to 0.5 to stop bouncing sooner
const PHYSICS_SPEED_MULTIPLIER = 0.8; // Slower visual movement 

// Basket detection constants
const BASKET_DETECTION_HEIGHT = 3.05; // Same as rim height
const BASKET_DETECTION_RADIUS = 0.25; // Larger detection area for better scoring
const BASKET_COOLDOWN_TIME = 2000; // 2 seconds cooldown between baskets

export class Basketball {
    /**
     * @param {THREE.Scene} scene - The main scene to add the basketball to.
     */
    constructor(scene) {
        this.mesh = new THREE.Group();
        this.keyState = {};
        this.power = 0.5; // Start at 50%
        this.POWER_STEP = 0.01;
        this.MIN_POWER = 0;
        this.MAX_POWER = 1;
        this.shooting = false;
        this.velocity = { x: 0, y: 0, z: 0 };
        this.scene = scene;
        
        // Basket detection properties
        this.lastBasketTime = 0;
        this.basketDetected = false;
        this.shotResultDetermined = false; // Track if we've already determined the shot result

        // Rotation properties
        this.rotationAxis = new THREE.Vector3(0, 1, 0);
        this.currentRotation = 0;

        this._createVisuals();
        this._resetPosition();
        scene.add(this.mesh);

        // This component is now self-contained and listens for its own events.
        document.addEventListener('keydown', (e) => this._handleKeyDown(e));
        document.addEventListener('keyup', (e) => this._handleKeyUp(e));
    }

    /**
     * Creates the visual components of the basketball (sphere and seams).
     * @private
     */
    _createVisuals() {
        this.mesh.position.set(0, BALL_RADIUS + 0.1, 0);

        const textureLoader = new THREE.TextureLoader();
        const basketballTexture = textureLoader.load('src/assets/textures/basketball_surface.jpg');
        const ballMaterial = new THREE.MeshPhongMaterial({
            map: basketballTexture,
            bumpMap: basketballTexture,
            bumpScale: 0.002,
            shininess: 30
        });
        const seamMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        this._createBallSphere(ballMaterial);
        this._createBallSeams(seamMaterial);
    }

    /** @private */
    _createBallSphere(material) {
        const ballGeometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
        const ball = new THREE.Mesh(ballGeometry, material);
        this.mesh.add(ball);
    }

    /** @private */
    _createBallSeams(material) {
        const seamRadius = BALL_RADIUS + 0.001;
        const seamGeom = new THREE.TorusGeometry(
            seamRadius,
            SEAM_THICKNESS,
            16,
            100,
            Math.PI
        );

        const diagAngles = [ Math.PI/4, 3*Math.PI/4 ];

        diagAngles.forEach(angle => {
            const seam1 = new THREE.Mesh(seamGeom, material);
            seam1.rotation.x = Math.PI / 2;
            seam1.rotation.y = angle;
            this.mesh.add(seam1);

            const seam2 = new THREE.Mesh(seamGeom, material);
            seam2.rotation.x = Math.PI / 2;
            seam2.rotation.y = angle;
            seam2.rotation.z = Math.PI; // Mirror to the other side
            this.mesh.add(seam2);
        });
    }

    _resetPosition() {
        this.mesh.position.set(BALL_START_POS.x, BALL_START_POS.y, BALL_START_POS.z);
        this.velocity = { x: 0, y: 0, z: 0 };
        this.shooting = false;
    }

    /** @private */
    _handleKeyDown(e) {
        if (MOVEMENT_KEYS.has(e.key)) {
            this.keyState[e.key] = true;
        }
        // Power adjustment (lowercase only)
        if (e.key === 'w') {
            this.power = Math.min(this.MAX_POWER, this.power + this.POWER_STEP);
            this.updatePowerBar();
        }
        if (e.key === 's') {
            this.power = Math.max(this.MIN_POWER, this.power - this.POWER_STEP);
            this.updatePowerBar();
        }
        // Spacebar to shoot
        if (e.key === ' ' && !this.shooting) {
            this._shootTowardNearestHoop();
        }
        // R to reset ball position only
        if (e.key === 'r' || e.key === 'R') {
            this._resetPosition();
        }
        // T to reset score only
        if (e.key === 't' || e.key === 'T') {
            import('../ui/Score.js').then(scoreModule => {
                scoreModule.resetScore();
            }).catch(error => {
                console.error('Error resetting score:', error);
            });
        }
    }

    /** @private */
    _handleKeyUp(e) {
        if (MOVEMENT_KEYS.has(e.key)) {
            this.keyState[e.key] = false;
        }
    }

    _shootTowardNearestHoop() {
        // Find nearest hoop (x = 15 or -15)
        const ballX = this.mesh.position.x;
        const ballZ = this.mesh.position.z;
        const targetX = Math.abs(ballX - HOOP_X[0]) < Math.abs(ballX - HOOP_X[1]) ? HOOP_X[0] : HOOP_X[1];
        const targetZ = 0;

        // Direction vector from ball to hoop
        const dx = targetX - ballX;
        const dz = targetZ - ballZ;
        const distXZ = Math.sqrt(dx*dx + dz*dz);

        // Moderate high arc for all shots - ball goes higher but not too much
        let angle;
        if (distXZ < 5) {
            // Close shots - high arc (65-75 degrees)
            angle = Math.PI / 2.5; // About 72 degrees - high arc for close shots
        } else {
            // Medium to long shots - moderate arc (55-65 degrees)
            angle = Math.PI / 2.9; // About 62 degrees - moderate arc for distance shots
        }

        // Adjust velocity based on distance for better feel
        let v;
        if (distXZ < 5) {
            // Close shots - more power needed due to high arc
            v = 6 + this.power * 6; // min 6 m/s, max 12 m/s (increased power)
        } else {
            // Medium to long shots - more power
            v = 6 + this.power * 6; // min 6 m/s, max 12 m/s
        }
        
        // Compensate for slower visual movement to maintain same trajectory
        v *= 1.25; // Increase velocity to compensate for slower visual movement

        // Calculate velocity components
        this.velocity.x = v * Math.cos(angle) * (dx / distXZ);
        this.velocity.z = v * Math.cos(angle) * (dz / distXZ);
        this.velocity.y = v * Math.sin(angle);
        this.shooting = true;
        this.shotResultDetermined = false; // Reset shot result flag for new shot
        
        // Track shot attempt
        import('../ui/Score.js').then(scoreModule => {
            scoreModule.addShotAttempt();
        }).catch(error => {
            console.error('Error tracking shot attempt:', error);
        });
        
        // Store which hoop we're targeting for missed shot detection
        this.targetHoopX = targetX;
    }

    /**
     * Call this to update the power bar UI.
     */
    updatePowerBar() {
        const bar = document.getElementById('power-bar');

        if (bar) {
            bar.style.width = `${Math.round(this.power * 100)}%`;
            bar.textContent = `${Math.round(this.power * 100)}%`;
        }
    }

    /**
     * This method should be called in the main animation loop to update the ball's position.
     */
    update() {
        if (this.shooting) {
            this._updateShootingPhysics();
        } else {
            this._updateMovementOnCourt();

        }
        this._updateRotation();
        this.updatePowerBar();
    }

    /**
     * Updates the ball's physics when shooting (gravity, collisions, bouncing).
     * @private
     */
    _updateShootingPhysics() {
        // Apply velocity and gravity
        this.mesh.position.x += this.velocity.x * DT * PHYSICS_SPEED_MULTIPLIER;
        this.mesh.position.y += this.velocity.y * DT * PHYSICS_SPEED_MULTIPLIER;
        this.mesh.position.z += this.velocity.z * DT * PHYSICS_SPEED_MULTIPLIER;
        this.velocity.y += GRAVITY * DT;

        // Check for collisions and real-time basket detection
        this._checkRimCollision();
        this._checkBasket();
        this._checkGroundCollision();
    }

    /**
     * Updates the ball's rotation based on its velocity.
     * @private
     */
    _updateRotation() {
        const speed = Math.hypot(this.velocity.x, this.velocity.y, this.velocity.z);
      
        const velDir = new THREE.Vector3(this.velocity.x, this.velocity.y, this.velocity.z).normalize();
        const up     = new THREE.Vector3(0, 1, 0);
        this.rotationAxis = new THREE.Vector3()
          .crossVectors(velDir, up)          // perpendicular to ground and vel
          .normalize();
      
      
        const angularSpeed = (speed / BALL_RADIUS) * PHYSICS_SPEED_MULTIPLIER * DT;      // radians per second
      
        this.currentRotation = (this.currentRotation + angularSpeed) 
          % (Math.PI * 2);
      
        // 5) apply via quaternion (Euler.setFromAxisAngle doesn't exist)
        this.mesh.quaternion.setFromAxisAngle(
          this.rotationAxis,
          this.currentRotation
        );
    }

    /**
     * Checks for collision with basketball rims and handles bouncing.
     * @private
     */
    _checkRimCollision() {
        // Disabled rim collision - ball passes through hoops without bouncing
        // This makes shooting much easier and more fun
        return;
    }

    /**
     * Checks if the ball has gone through a hoop and scores a basket.
     * @private
     */
    _checkBasket() {
        const currentTime = Date.now();
        
        // Check if enough time has passed since last basket (cooldown)
        if (currentTime - this.lastBasketTime < BASKET_COOLDOWN_TIME) {
            return;
        }

        for (const hoopX of HOOP_X) {
            const dx = this.mesh.position.x - hoopX;
            const dz = this.mesh.position.z;
            const dy = this.mesh.position.y - BASKET_DETECTION_HEIGHT;
            
            // Check if ball is within the hoop area
            const horizontalDist = Math.sqrt(dx*dx + dz*dz);
            const isWithinHoop = horizontalDist < BASKET_DETECTION_RADIUS;
            const isMovingDown = this.velocity.y < 0;
            const isAtRimLevel = Math.abs(dy) < BALL_RADIUS * 1.2; // Ball is at rim level (balanced precision)
            
            // Basket detected: ball is within hoop, at rim level, and moving downward
            if (isWithinHoop && isAtRimLevel && isMovingDown && !this.basketDetected) {
                this.basketDetected = true;
                this.shotResultDetermined = true; // Mark that we've determined the shot result
                this.lastBasketTime = currentTime;
                
                // Make the ball go through the net area (below the rim)
                // Calculate direction from ball to center of hoop
                const netDirectionX = (hoopX - this.mesh.position.x) * 0.3; // Slight push toward center
                const netDirectionZ = (0 - this.mesh.position.z) * 0.3; // Slight push toward center
                
                // Set velocity to go through the net area
                this.velocity.x = netDirectionX;
                this.velocity.z = netDirectionZ;
                this.velocity.y = -3; // Fall down through the net
                
                // Determine which hoop (home or away) and add score
                const isHomeHoop = hoopX > 0; // Positive X is home hoop
                if (isHomeHoop) {
                    this._addScore('away'); // Away team scores on home hoop
                } else {
                    this._addScore('home'); // Home team scores on away hoop
                }
                
                console.log(`BASKET! ${isHomeHoop ? 'Away' : 'Home'} team scores!`);
            }
        }
        
        // Reset basket detection when ball is no longer near rim
        if (this.mesh.position.y < BASKET_DETECTION_HEIGHT - BALL_RADIUS * 2) {
            this.basketDetected = false;
        }
    }

    /**
     * Adds score for the specified team.
     * @param {string} team - 'home' or 'away'
     * @private
     */
    _addScore(team) {
        // Import the score functions dynamically to avoid circular dependencies
        import('../ui/Score.js').then(scoreModule => {
            if (team === 'home') {
                scoreModule.addHomeScore(2);
            } else if (team === 'away') {
                scoreModule.addAwayScore(2);
            }
        }).catch(error => {
            console.error('Error updating score:', error);
        });
    }



    /**
     * Shows missed shot feedback.
     * @private
     */
    _showMissedShot() {
        // Only show missed shot if we haven't determined the result yet
        if (!this.shotResultDetermined) {
            this.shotResultDetermined = true; // Mark that we've determined the shot result
            import('../ui/Score.js').then(scoreModule => {
                scoreModule.showShotMissed();
            }).catch(error => {
                console.error('Error showing missed shot:', error);
            });
        }
    }

    /**
     * Checks for collision with the ground and handles bouncing/stopping.
     * @private
     */
    _checkGroundCollision() {
        if (this.mesh.position.y <= COURT_SURFACE_Y + BALL_RADIUS + 0.01) {
            this.mesh.position.y = COURT_SURFACE_Y + BALL_RADIUS;
            
            if (this._isMovingFastEnough()) {
                this._bounceOffGround();
            } else {
                this._stopBall();
            }
        }
    }

    /**
     * Checks if the ball is moving fast enough to continue bouncing.
     * @private
     * @returns {boolean} True if the ball should continue bouncing.
     */
    _isMovingFastEnough() {
        return Math.abs(this.velocity.y) > VELOCITY_THRESHOLD || 
               Math.abs(this.velocity.x) > VELOCITY_THRESHOLD || 
               Math.abs(this.velocity.z) > VELOCITY_THRESHOLD;
    }

    /**
     * Handles the ball bouncing off the ground with energy loss.
     * @private
     */
    _bounceOffGround() {
        this.velocity.y = -this.velocity.y * BALL_BOUNCINESS;
        // Apply friction to horizontal velocity
        this.velocity.x *= 0.6;
        this.velocity.z *= 0.6;
    }

    /**
     * Stops the ball's movement and ends shooting state.
     * @private
     */
    _stopBall() {
        this.velocity.y = 0;
        this.velocity.x = 0;
        this.velocity.z = 0;
        this.shooting = false;
        
        // Only show missed shot if we haven't determined the result yet (meaning no basket was made)
        if (!this.shotResultDetermined) {
            this._showMissedShot();
        }
    }

    /**
     * Updates the ball's position based on keyboard input when not shooting.
     * @private
     */
    _updateMovementOnCourt() {
        // Reset velocity at the start
        this.velocity.x = 0;
        this.velocity.z = 0;
        
        // Handle arrow key movement and set velocity
        if (this.keyState['ArrowUp']) {
            this.mesh.position.z -= BALL_COURT_MOVEMENT_SPEED;
            this.velocity.z = -BALL_COURT_MOVEMENT_SPEED;
        }
        if (this.keyState['ArrowDown']) {
            this.mesh.position.z += BALL_COURT_MOVEMENT_SPEED;
            this.velocity.z = BALL_COURT_MOVEMENT_SPEED;
        }
        if (this.keyState['ArrowLeft']) {
            this.mesh.position.x -= BALL_COURT_MOVEMENT_SPEED;
            this.velocity.x = -BALL_COURT_MOVEMENT_SPEED;
        }
        if (this.keyState['ArrowRight']) {
            this.mesh.position.x += BALL_COURT_MOVEMENT_SPEED;
            this.velocity.x = BALL_COURT_MOVEMENT_SPEED;
        }
        
        // Boundary checks
        this.mesh.position.x = Math.max(-COURT_BOUNDARIES.x, Math.min(COURT_BOUNDARIES.x, this.mesh.position.x));
        this.mesh.position.z = Math.max(-COURT_BOUNDARIES.z, Math.min(COURT_BOUNDARIES.z, this.mesh.position.z));
    }
} 