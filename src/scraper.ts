import { load, type CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import type { EventAttributes } from './types';
import { timeStringsToDate, dedupeEvents } from './utils';
import { getAllEvents, getEventKey, saveEventsAndCleanOrphans } from './database';

const EVENTS_PER_PAGE = 5;

export async function scrapeEventPage($: CheerioAPI, el: Element, baseURL: URL, cache: Set<string>, offset?: Date) {
	const href = $('.event-teaser__title a', el).attr('href')!;

	const startTimeDisplay = $('.event-teaser__time', el).text();
	const day = Number($('.event-teaser__day', el).text());
	const monthStr = $('.event-teaser__month', el).text();
	const month = new Date(`${monthStr} 1`).getMonth();
	const start = timeStringsToDate(month, day, startTimeDisplay, offset).getTime();

	const url = new URL(href, baseURL).toString();
	const key = getEventKey({ start, url });

	if (cache.has(key)) {
		return;
	}

	const eventPageData = await fetch(url).then((res) => res.text());
	const $event = load(eventPageData);

	const summary = $('.event-teaser__summary', el).text().trim();
	const building = $event('.page-header__location').text();
	const room = $event('.page-header__campus_specific_location').text();
	const title = $event('.page-header__title-value').text();
	const end = Date.parse($event('time').eq(1).attr('datetime')!) || undefined;

	const description = `${summary}\n\n${url}`;
	const location = `${room} ${building}`.trim() || undefined;
	return { start, end, title, description, location, url };
}

export async function scrapeCalendarPage(page: number, startDate: string, cachedKeys: Set<string>) {
	const url = new URL('https://www.cics.umass.edu/events');
	url.searchParams.set('page', page.toString());
	url.searchParams.set('field_event__date_value', startDate);

	const data = await fetch(url).then((res) => res.text());
	const $ = load(data);

	const offset = startDate === 'Today' ? undefined : new Date(startDate);
	const eventPromises = $('article .event')
		.map(async (_, el) => scrapeEventPage($, el, url, cachedKeys, offset))
		.get();

	const events = await Promise.all(eventPromises);
	const resultText = $('.views-exposed-form__results').text();
	const totalResults = Number(/\d+/.exec(resultText)![0]);

	return { events: events.filter(Boolean) as EventAttributes[], totalResults };
}

export async function scrapeEvents(startDate = 'Today') {
	const allEvents = getAllEvents();
	const cachedKeys = new Set(allEvents.map(({ key }) => key));

	const firstPageResult = await scrapeCalendarPage(0, startDate, cachedKeys);
	const totalPages = Math.ceil(firstPageResult.totalResults / EVENTS_PER_PAGE);
	const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 1);

	const remainingResults = await Promise.all(
		remainingPages.map((page) => scrapeCalendarPage(page, startDate, cachedKeys))
	);

	const scrapedEvents = dedupeEvents([
		...firstPageResult.events,
		...remainingResults.flatMap((result) => result.events)
	]);

	const scrapedEventKeys = new Set(scrapedEvents.map((event) => getEventKey(event)));
	const cachedEvents = saveEventsAndCleanOrphans(scrapedEvents, scrapedEventKeys, allEvents);

	return [...cachedEvents, ...scrapedEvents];
}
