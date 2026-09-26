/**
 * Prints the operator gate-3 worksheet (docs/gate-3.md): per fixture, what to type into
 * Skatteetaten's skattekalkulator and the engine's expected tax lines, plus each gate-3 rule's
 * current status and why. Everything is computed live from src/.
 *
 *   npm run gate3:sheet            markdown to stdout
 *   npm run gate3:sheet -- --json  the same data as JSON
 */
import { buildGate3Sheet, renderGate3Sheet } from '../src/data/gate3-sheet.ts';

const sheet = buildGate3Sheet();
process.stdout.write(process.argv.includes('--json') ? `${JSON.stringify(sheet, null, 2)}\n` : renderGate3Sheet(sheet));
