/* eslint-disable @typescript-eslint/naming-convention */
import { createEvents } from 'ics';
import { scrapeEvents } from './scraper';

export async function generateCalendar(startDate?: string) {
	const eventAttrs = await scrapeEvents(startDate);
	const events = createEvents(eventAttrs, { calName: 'CICS Events' });
	await Bun.write('events.ics', events.value!);
	console.log('Successfully generated events.ics');
}

if (import.meta.main) {
	const startDate = Bun.argv[2];
	if (startDate) {
		console.log(`Starting historical event population from ${startDate}…`);
	}

	await generateCalendar(startDate);
}
