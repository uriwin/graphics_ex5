# Computer Graphics - Exercise 6 - WebGL Basketball Court

## Group Members

- Uri Winkowski - 314874207
- Guy Gal - 207687419

## How to Run Your Implementation

### Prerequisites
- Node.js installed on your system
- Modern web browser with WebGL support

### Setup Instructions
1. Clone this repository to your local machine
2. Start the local web server: `node index.js`
3. Open your browser and go to http://localhost:8000

## Complete List of Implemented Controls

### Ball Movement
- **Arrow Keys**: Move the basketball around the court
  - `↑` (ArrowUp): Move forward
  - `↓` (ArrowDown): Move backward  
  - `←` (ArrowLeft): Move left
  - `→` (ArrowRight): Move right

### Shooting Controls
- **Spacebar**: Shoot the ball toward the nearest hoop
- **W/S Keys**: Adjust shot power
  - `W`: Increase shot power (hold to max)
  - `S`: Decrease shot power (hold to min)

### Game Management
- **R Key**: Reset ball position to center of court
- **T Key**: Reset all scores and statistics
- **O Key**: Toggle camera controls (orbit around the court)

### Power System
- Visual power bar shows current shot power (0-100%)
- Power affects shot velocity and distance
- Default power starts at 50%

## Description of Physics System Implementation

### Core Physics Engine
- **Gravity**: Implemented with `GRAVITY = -9.8 m/s²`
- **Time Stepping**: Fixed time step of `DT = 1/60 seconds` for consistent physics
- **Velocity Integration**: Position updated using `position += velocity * DT`
- **Frame Rate**: 60 FPS for smooth physics simulation

### Ball Physics
- **Bouncing**: Ball bounces off ground with energy loss (`BALL_BOUNCINESS = 0.7`)
- **Friction**: Horizontal velocity reduced by 40% on each bounce
- **Stopping**: Ball stops when velocity drops below threshold (`VELOCITY_THRESHOLD = 1 m/s`)
- **Rotation**: Ball rotates based on velocity direction and speed

### Shooting Physics
- **Trajectory Calculation**: Uses projectile motion equations
- **Angle Adjustment**: Different angles for close vs. long shots
  - Close shots: 72° (high arc)
  - Distance shots: 62° (moderate arc)
- **Power Scaling**: Velocity ranges from 6-12 m/s based on power setting
- **Visual Speed**: `PHYSICS_SPEED_MULTIPLIER = 0.8` for slower visual movement

### Collision Detection
- **Ground Collision**: Detects when ball hits court surface (y = 0.1m)
- **Basket Detection**: Custom algorithm for scoring
  - Horizontal distance check within `BASKET_DETECTION_RADIUS = 0.25m`
  - Height detection at rim level (`BASKET_DETECTION_HEIGHT = 3.05m`)
  - Downward velocity requirement
  - Cooldown system to prevent multiple scores

### Court Boundaries
- **X-axis**: ±14.8m (prevents ball from going off court)
- **Z-axis**: ±7.3m (prevents ball from going off court)

## Additional Features Implemented

### Comprehensive Scoring System
- **Real-time Score Tracking**: Home vs. Away team scores
- **Shot Statistics**: 
  - Total Score (combined points)
  - Shot Attempts counter
  - Shots Made counter
  - Shooting Percentage calculation
- **Visual Feedback**: Success/miss messages with animations

### Enhanced User Interface
- **Power Bar**: Real-time visual indicator of shot power
- **Controls Display**: Minimal, concise keyboard shortcuts
- **Statistics Panel**: Multi-line display with all game metrics
- **Shot Feedback**: Animated messages for successful and missed shots

### Advanced Ball Behavior
- **Smart Trajectory**: Ball arcs higher for close shots, moderate for distance
- **Net Effect**: Ball falls straight down after scoring (no rim bouncing)
- **Shot Result Tracking**: Prevents duplicate feedback messages
- **Automatic Reset**: Ball returns to center after scoring

### Visual Enhancements
- **Textured Basketball**: Realistic basketball surface texture
- **3D Court**: Complete basketball court with proper dimensions
- **Lighting System**: Directional lighting for realistic shadows
- **Camera Controls**: Orbital camera for different viewing angles

## Known Issues and Limitations

### Physics Limitations
- **Simplified Collision**: No complex collision detection with court objects
- **Fixed Time Step**: May cause issues on very slow/fast systems
- **No Air Resistance**: Ball trajectory doesn't account for air drag
- **Limited Bounce Physics**: Simple energy loss model

### Gameplay Limitations
- **Single Ball**: Only one ball can be in play at a time
- **No Multiplayer**: Single-player only
- **Fixed Hoop Positions**: Hoops cannot be moved or adjusted
- **No Sound**: No audio feedback for shots or scoring

### Technical Limitations
- **Browser Dependency**: Requires WebGL-capable browser
- **Performance**: May lag on older devices with complex scenes
- **No Mobile Support**: Touch controls not implemented
- **Fixed Resolution**: No responsive design for different screen sizes

## Sources of External Assets Used

### Textures
- **Basketball Surface**: `src/assets/textures/basketball_surface.jpg`
  - Source: Custom basketball texture for realistic ball appearance
- **Wood Floor**: `src/assets/textures/wood_floor.jpg`
  - Source: Wood texture for court surface

### Libraries and Dependencies
- **THREE.js**: 3D graphics library for WebGL rendering
  - Version: Latest stable release
  - Source: https://threejs.org/
- **Node.js**: JavaScript runtime for local server
  - Source: https://nodejs.org/

### Development Tools
- **npm**: Package manager for Node.js dependencies
- **WebGL**: Hardware-accelerated 3D graphics API

## Complete Instructions
**All detailed instructions, requirements, and specifications can be found in:**
`basketball_exercise_instructions.html`
