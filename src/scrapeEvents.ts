/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/naming-convention */
import { load } from 'cheerio';
import { Database } from 'bun:sqlite';
import type { EventAttributes } from 'ics';

const db = new Database('cache.db');

db.run(`
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);

export async function scrapeEventPage(page: number) {
	const url = new URL('https://www.cics.umass.edu/events?field_event__date_value=Today');
	url.searchParams.set('page', page.toString());

	const data = await fetch(url).then((res) => res.text());
	const $ = load(data);

	const eventPromises = $('article .event')
		.map(async (_, el) => {
			const href = $('.event-teaser__title a', el).attr('href')!;
			const eventURL = new URL(href, url);
			const cached = db
				.query<{ value: string }, string>(`SELECT value FROM cache WHERE key = ?`)
				.get(eventURL.toString());

			if (cached) {
				return JSON.parse(cached.value) as EventAttributes;
			}

			const eventPageData = await fetch(eventURL).then((res) => res.text());
			const $event = load(eventPageData);
			const summary = $('.event-teaser__summary', el).text().trim();
			const room = $event('.page-header__campus_specific_location').text();
			const building = $event('.page-header__location').text();
			const [start, end] = $event('time')
				.map((_, el) => Date.parse($event(el).attr('datetime')!))
				.get();

			return {
				start,
				end,
				title: $event('.page-header__title-value').text(),
				description: `${summary}\n\n${eventURL}`,
				location: `${room} ${building}`,
				url: eventURL.toString()
			};
		})
		.get();

	return Promise.all(eventPromises);
}

export async function scrapeEvents() {
	const pages = [0, 1];
	const events = (await Promise.all(pages.map((page) => scrapeEventPage(page)))).flat();

	db.run('DELETE FROM cache');
	for (const event of events) {
		db.run(`INSERT INTO cache (key, value) VALUES (?, ?)`, [event.url!, JSON.stringify(event)]);
	}

	return events;
}
