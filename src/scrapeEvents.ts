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

interface PageData {
	events: EventAttributes[];
	totalResults?: number;
}

export async function scrapeEventPage(page: number, includeMetadata = false): Promise<PageData> {
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

	const events = await Promise.all(eventPromises);
	const result: PageData = { events };

	if (includeMetadata) {
		const resultText = $('.views-exposed-form__results').text();
		const numResultsMatch = /\d+/.exec(resultText);
		if (numResultsMatch) {
			result.totalResults = Number(numResultsMatch[0]);
		}
	}

	return result;
}

const EVENTS_PER_PAGE = 5;

export async function scrapeEvents() {
	const firstPageResult = await scrapeEventPage(0, true);

	if (!firstPageResult.totalResults) {
		return firstPageResult.events;
	}

	const totalPages = Math.ceil(firstPageResult.totalResults / EVENTS_PER_PAGE);
	const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 1);

	const remainingResults = await Promise.all(remainingPages.map((page) => scrapeEventPage(page)));
	const allEvents = [...firstPageResult.events, ...remainingResults.flatMap((result) => result.events)].filter(
		(event, index, self) => index === self.findIndex((e) => e.url === event.url)
	);

	db.run('DELETE FROM cache');
	for (const event of allEvents) {
		db.run(`INSERT INTO cache (key, value) VALUES (?, ?)`, [event.url!, JSON.stringify(event)]);
	}

	return allEvents;
}
