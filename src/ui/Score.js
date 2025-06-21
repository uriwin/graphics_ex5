/**
 * Score.js
 *
 * This module manages the state of the game's score.
 * It is kept simple and does not handle key presses directly, only data management.
 */

let homeScore = 0;
let awayScore = 0;

/**
 * Updates the score display in the HTML based on the current score variables.
 */
export function updateScoreDisplay() {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
        scoreElement.innerHTML = `SCORE: ${homeScore} - ${awayScore}`;
    }
}

