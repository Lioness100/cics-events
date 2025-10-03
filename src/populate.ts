import { scrapeEvents } from './scraper';
import { getAllPastEvents } from './database';

const START_DATE = '09/02/25';

async function populateHistoricalEvents() {
	console.log('Starting historical event population from September 2, 2025…');
	const oldEvents = getAllPastEvents();
	const events = await scrapeEvents(START_DATE);
	const newEvents = events.length - oldEvents.length;

	console.log(`Fetched ${events.length} events, ${newEvents} new.`);
}

if (import.meta.main) {
	await populateHistoricalEvents();
}
