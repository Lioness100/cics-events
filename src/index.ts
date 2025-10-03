import { createEvents } from 'ics';
import { scrapeEvents } from './scraper';

const server = Bun.serve({
	async fetch() {
		const eventAttrs = await scrapeEvents();
		const events = createEvents(eventAttrs, { calName: 'CICS Events' });
		return new Response(events.value, {
			headers: {
				'Content-Type': 'text/calendar',
				'Content-Disposition': 'attachment; filename="events.ics"'
			}
		});
	}
});

console.log(`Server running on http://localhost:${server.port}`);
