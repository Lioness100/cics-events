/* eslint-disable @typescript-eslint/naming-convention */
import { load } from 'cheerio';
import NodeCache from 'node-cache';
import type { EventAttributes } from 'ics';

const cache = new NodeCache({ stdTTL: 60 * 60 * 73 });

export async function scrapeEventPage(page: number) {
	const url = new URL('https://www.cics.umass.edu/events?field_event__date_value=Today');
	url.searchParams.set('page', page.toString());

	const data = await fetch(url).then((res) => res.text());
	const $ = load(data);

	const events = $('article .event').map(async (_, el) => {
		const link = $('.event-teaser__title a', el).attr('href')!;
		if (cache.has(link)) {
			return cache.get<EventAttributes>(link)!;
		}

		const eventURL = new URL(link, url);
		const data = await fetch(eventURL).then((res) => res.text());
		const $event = load(data);
		const title = $event('.page-header__title-value').text();
		const summary = $('.event-teaser__summary', el).text().trim();
		const room = $event('.page-header__campus_specific_location').text();
		const building = $event('.page-header__location').text();
		const [start, end] = $event('time')
			.map((_, el) => new Date($event(el).attr('datetime')!))
			.get();

		const event: EventAttributes = {
			start: start.getTime(),
			end: end.getTime(),
			title,
			description: summary,
			location: `${room} ${building}`,
			url: eventURL.toString()
		};

		cache.set(link, event);
		return event;
	});

	return Promise.all(events.get());
}

export async function scrapeEvents() {
	const pages = [0, 1];
	const events = await Promise.all(pages.map((page) => scrapeEventPage(page)));
	return events.flat();
}
