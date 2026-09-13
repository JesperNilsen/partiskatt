// Placeholder until the data layer exists (S7). `--check` must not fail S0.
const check = process.argv.includes('--check');
console.log(check ? 'data-status: no data layer yet (S0 stub)' : 'data-status: stub');
