# Stella 100: Subtraction with Devin the Otter

A timed 2nd-grade subtraction game. The student gets 100 problems (all numbers 0–19, no negative answers), starting at medium and ending with the hardest (teen facts that cross ten, like 13 − 7), and has 8 minutes 30 seconds to finish.

- Type the answer with the keyboard (or tap the on-screen number pad) and press **Enter**.
- **Skip** sends a problem to the end; when it comes back it can be answered or left blank.
- When time runs out, the student can keep going; answers after that are marked late (⏰).
- No right/wrong feedback during the test. The results page shows the score, every missed problem with the right answer, and all 100 problems. It can be printed.
- Sound effects with a mute button.
- Add it to an iPad or iPhone home screen (Safari > Share > Add to Home Screen) and it runs full screen like an app, with an otter icon and launch screen.
- Works offline after the first visit (`sw.js`). Bump `VERSION` in `sw.js` on every release; iPads pick up changes on the next launch after that.
- If the game is closed mid-test, it reopens where the student left off. The clock pauses whenever the game is not on screen.
- **My Scores** keeps past results on that device (browser storage only, nothing is sent anywhere).

Plain HTML, CSS and JavaScript with no build step and no tracking. Open `index.html` or serve the folder with any static host (GitHub Pages).

Font: [Fredoka](https://github.com/hafontia/Fredoka-One), SIL Open Font License (`fonts/OFL.txt`).
