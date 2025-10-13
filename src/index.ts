/* eslint-disable @typescript-eslint/naming-convention */
import { createEvents } from 'ics';
import { scrapeEvents } from './scraper';

async function generateCalendar() {
	const eventAttrs = await scrapeEvents();
	const events = createEvents(eventAttrs, { calName: 'CICS Events' });
	await Bun.write('events.ics', events.value!);
	console.log('Successfully generated events.ics');
}

if (import.meta.main) {
	await generateCalendar();
}
