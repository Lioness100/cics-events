/* eslint-disable import/no-unresolved */
import { rename } from 'node:fs/promises';
import { Database } from 'bun:sqlite';

const OLD_DB_PATH = 'cache.db';
const NEW_DB_PATH = 'history.db';

async function migrateDatabase() {
	const db = new Database(OLD_DB_PATH);

	db.run('ALTER TABLE cache RENAME TO history');
	db.close();

	await rename(OLD_DB_PATH, NEW_DB_PATH);
}

if (import.meta.main) {
	await migrateDatabase();
}
