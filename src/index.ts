/* eslint-disable @typescript-eslint/naming-convention */
import { createEvents } from 'ics';
import { scrapeEvents } from './scraper';

const server = Bun.serve({
	routes: {
		'/events.ics': async () => {
			const eventAttrs = await scrapeEvents();
			const events = createEvents(eventAttrs, { calName: 'CICS Events' });
			return new Response(events.value, { headers: { 'Content-Type': 'text/calendar' } });
		},
		'/subscribe': Response.redirect(`https://calendar.google.com/calendar/u/0/r?cid=${process.env.SUBSCRIBE_URL}`),
		'/favicon.png': Bun.file('public/favicon.png'),
		'/': async () => {
			const html = await Bun.file('public/index.html').text();
			const rendered = html.replace('{{CALENDAR_EMBED_URL}}', process.env.EMBED_URL ?? '');
			return new Response(rendered, { headers: { 'Content-Type': 'text/html' } });
		}
	},
	error(error) {
		console.error(error);
		return new Response('Internal Server Error', { status: 500 });
	}
});

console.log(`Server running on ${server.url}`);
