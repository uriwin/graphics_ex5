/**
 * Score.js
 *
 * This module manages the state of the game's score.
 * It is kept simple and does not handle key presses directly, only data management.
 */

let homeScore = 0;
let awayScore = 0;
let totalShotsAttempted = 0;
let totalShotsMade = 0;

/**
 * Updates the score display in the HTML based on the current score variables.
 */
export function updateScoreDisplay() {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
        const totalScore = homeScore + awayScore;
        const shootingPercentage = totalShotsAttempted > 0 ? ((totalShotsMade / totalShotsAttempted) * 100).toFixed(1) : '0.0';
        scoreElement.innerHTML = `
            <div class="score-main">SCORE: ${homeScore} - ${awayScore}</div>
            <div class="score-stats">
                <div class="stat-row">
                    <span>Total Score: ${totalScore}</span>
                    <span>Shot Attempts: ${totalShotsAttempted}</span>
                </div>
                <div class="stat-row">
                    <span>Shots Made: ${totalShotsMade}</span>
                    <span>Shooting %: ${shootingPercentage}%</span>
                </div>
            </div>
        `;
    }
}

/**
 * Increments the shot attempt counter.
 */
export function addShotAttempt() {
    totalShotsAttempted++;
    updateScoreDisplay();
}

/**
 * Increments the shot made counter.
 */
export function addShotMade() {
    totalShotsMade++;
    updateScoreDisplay();
}

/**
 * Shows a shot feedback message.
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'miss'
 */
export function showShotFeedback(message, type = 'success') {
    // Remove any existing feedback message
    const existingFeedback = document.getElementById('shot-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Create new feedback element
    const feedbackElement = document.createElement('div');
    feedbackElement.id = 'shot-feedback';
    feedbackElement.textContent = message;
    feedbackElement.className = `shot-feedback ${type}`;
    
    // Add to the UI container
    const uiContainer = document.getElementById('ui-container');
    if (uiContainer) {
        uiContainer.appendChild(feedbackElement);
    }

    // Remove the message after 2 seconds
    setTimeout(() => {
        if (feedbackElement.parentNode) {
            feedbackElement.remove();
        }
    }, 2000);
}

/**
 * Shows a successful shot message.
 */
export function showShotMade() {
    showShotFeedback('SHOT MADE!', 'success');
}

/**
 * Shows a missed shot message.
 */
export function showShotMissed() {
    showShotFeedback('MISSED SHOT', 'miss');
}

/**
 * Increments the home team score by the specified number of points.
 * @param {number} points - Number of points to add (default: 2)
 */
export function addHomeScore(points = 2) {
    homeScore += points;
    addShotMade(); // Increment shots made
    showShotMade(); // Show success message
}

/**
 * Increments the away team score by the specified number of points.
 * @param {number} points - Number of points to add (default: 2)
 */
export function addAwayScore(points = 2) {
    awayScore += points;
    addShotMade(); // Increment shots made
    showShotMade(); // Show success message
}

/**
 * Resets both scores to zero.
 */
export function resetScore() {
    homeScore = 0;
    awayScore = 0;
    totalShotsAttempted = 0;
    totalShotsMade = 0;
    updateScoreDisplay();
}

/**
 * Gets the current home score.
 * @returns {number} The home team's current score
 */
export function getHomeScore() {
    return homeScore;
}

/**
 * Gets the current away score.
 * @returns {number} The away team's current score
 */
export function getAwayScore() {
    return awayScore;
}

/**
 * Gets the total shots attempted.
 * @returns {number} Total shots attempted
 */
export function getTotalShotsAttempted() {
    return totalShotsAttempted;
}

/**
 * Gets the total shots made.
 * @returns {number} Total shots made
 */
export function getTotalShotsMade() {
    return totalShotsMade;
}

/**
 * Gets the shot accuracy percentage.
 * @returns {string} Accuracy percentage as a string
 */
export function getShotAccuracy() {
    return totalShotsAttempted > 0 ? ((totalShotsMade / totalShotsAttempted) * 100).toFixed(1) : '0.0';
}

