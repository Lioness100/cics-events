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

export function getAllEvents() {
	const rows = db.query<{ event: string; key: string }, []>(`SELECT key, event FROM history`).all();
	return new Map(rows.map((row) => [row.key, JSON.parse(row.event) as EventAttributes]));
}

export function saveEventsAndCleanOrphans(
	events: EventAttributes[],
	currentEventKeys: Set<string>,
	allEvents: ReturnType<typeof getAllEvents>
) {
	const now = Date.now();

	const insertStmt = db.query(`INSERT OR REPLACE INTO history (key, event) VALUES (?, ?)`);
	const deleteStmt = db.query(`DELETE FROM history WHERE key = ?`);

	const parsedEvents: EventAttributes[] = [];

	const transaction = db.transaction(() => {
		for (const [key, event] of allEvents) {
			if (event.start >= now && !currentEventKeys.has(key)) {
				deleteStmt.run(key);
			} else {
				parsedEvents.push(event);
			}
		}

		for (const event of events) {
			insertStmt.run(getEventKey(event), JSON.stringify(event));
		}
	});

	transaction();

	return parsedEvents;
}
