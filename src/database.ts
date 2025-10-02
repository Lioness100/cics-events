/* eslint-disable import/no-unresolved */
import { Database } from 'bun:sqlite';
import type { EventAttributes } from './types';

const db = new Database('history.db');

db.run(`
  CREATE TABLE IF NOT EXISTS history (
    key TEXT PRIMARY KEY,
    event TEXT NOT NULL
  )
`);

export function getEventKey(event: { start: number; url: string }) {
	return `${event.url}:${event.start}`;
}

export function isEventCached(key: string) {
	const result = db
		.query<{ count: number }, [string]>(`SELECT COUNT(*) as count FROM history WHERE key = ?`)
		.get(key)!;

	return result.count > 0;
}

export function getAllPastEvents() {
	return db
		.query<{ event: string }, []>(`SELECT event FROM history`)
		.all()
		.map((row) => JSON.parse(row.event) as EventAttributes);
}

export function saveEvents(events: EventAttributes[]) {
	const insert = db.query(`INSERT OR REPLACE INTO history (key, event) VALUES (?, ?)`);
	const transaction = db.transaction((events: EventAttributes[]) => {
		for (const event of events) {
			insert.run(getEventKey(event), JSON.stringify(event));
		}
	});

	transaction(events);
}
