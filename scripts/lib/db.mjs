/**
 * Minimal MySQL access with no npm dependencies.
 *
 * Two deliberate choices:
 *
 *  1. Every text column is pulled through HEX() and decoded in JS. That makes the
 *     export immune to client/connection charset behaviour, which is exactly what
 *     corrupted this content once already. Hex output also contains no tabs or
 *     newlines, so TSV parsing is safe for multi-paragraph article bodies.
 *
 *  2. By default we import data/source/50_States.sql into a throwaway database and
 *     export from that, rather than reading a long-lived dev database. The export
 *     is then reproducible from the committed dump alone, and every run
 *     re-validates that the dump still imports.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const CANDIDATE_CLIENTS = [
  '/Applications/MAMP/Library/bin/mysql80/bin/mysql',
  '/Applications/MAMP/Library/bin/mysql/bin/mysql',
  '/opt/homebrew/bin/mysql',
  '/usr/local/bin/mysql',
  'mysql',
];

const CANDIDATE_SOCKETS = [
  '/Applications/MAMP/tmp/mysql/mysql.sock',
  '/tmp/mysql.sock',
];

export function findClient() {
  const fromEnv = process.env.MYSQL_CLIENT;
  if (fromEnv) return fromEnv;
  for (const c of CANDIDATE_CLIENTS) {
    if (c === 'mysql' || existsSync(c)) return c;
  }
  throw new Error('No mysql client found. Set MYSQL_CLIENT.');
}

function findSocket() {
  const fromEnv = process.env.MYSQL_SOCKET;
  if (fromEnv) return fromEnv;
  for (const s of CANDIDATE_SOCKETS) if (existsSync(s)) return s;
  return null;
}

/**
 * MAMP's MySQL runs with skip-networking, so nothing listens on TCP 3306 and the
 * socket is the only way in. The old app only worked because it used host
 * 'localhost', which mysqli special-cases to the socket.
 */
function baseArgs() {
  const args = [
    `-u${process.env.MYSQL_USER || 'root'}`,
    `-p${process.env.MYSQL_PASSWORD || 'root'}`,
  ];
  const sock = findSocket();
  if (sock) args.push(`--socket=${sock}`);
  else args.push(`--host=${process.env.MYSQL_HOST || '127.0.0.1'}`);
  return args;
}

function run(args, input) {
  return execFileSync(findClient(), args, {
    input,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

export function exec(sql, database) {
  const args = [...baseArgs()];
  if (database) args.push(database);
  args.push('-e', sql);
  return run(args);
}

/** Run a query and return rows as arrays of raw strings (tab separated, no header). */
export function query(database, sql) {
  const args = [...baseArgs(), database, '-N', '--batch', '--raw',
                '--default-character-set=binary', '-e', sql];
  const out = run(args);
  if (!out.trim()) return [];
  return out.replace(/\n$/, '').split('\n').map((line) => line.split('\t'));
}

/** Decode a HEX() column back to a string. 'NULL' and '' both mean empty. */
export function hex(v) {
  if (v == null || v === 'NULL' || v === '') return '';
  return Buffer.from(v, 'hex').toString('utf8');
}

/** Numeric helper - the schema stores lat/long and dimensions as varchar. */
export function num(v) {
  if (v == null || v === 'NULL' || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Import the dump so the resulting bytes match what the old site actually served.
 *
 * This is subtle and got it wrong once. The dump carries NO `SET NAMES`, so MySQL
 * falls back to the client default - which on MAMP is `latin1`. MySQL's "latin1"
 * is really Windows-1252, where byte 0x83 maps to U+0192 (f-hook). Importing that
 * way silently adds an extra encoding layer: an e-acute that was already
 * double-encoded in the dump comes out TRIPLE-encoded (C383C692C382C2A9 instead of
 * C383C2A9), and no downstream repair can distinguish that from real content.
 *
 * Forcing utf8mb3 reads the dump's bytes as the UTF-8 they already are, and
 * reproduces the live database byte-for-byte. Verified across all 2596 text values
 * by scripts/verify-against-live.mjs.
 */
const IMPORT_CHARSET = 'utf8mb3';

export function importDump(database, dumpPath) {
  exec(`DROP DATABASE IF EXISTS \`${database}\`; CREATE DATABASE \`${database}\`;`);
  const args = [...baseArgs(), `--default-character-set=${IMPORT_CHARSET}`, database];
  run(args, readFileSync(dumpPath, 'utf8'));
}

export function dropDatabase(database) {
  exec(`DROP DATABASE IF EXISTS \`${database}\`;`);
}
