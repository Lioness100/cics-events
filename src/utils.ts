import type { EventAttributes } from './types';

export function timeStringsToDate(month: number, day: number, timeStr: string, offset = new Date()) {
	const [time, modifier] = timeStr.split(' ');
	let [hours, minutes] = time.split(':').map(Number);
	if (modifier.toLowerCase() === 'pm' && hours < 12) {
		hours += 12;
	} else if (modifier.toLowerCase() === 'am' && hours === 12) {
		hours = 0;
	}

	let year = offset.getFullYear();
	if (month < offset.getMonth() || (month === offset.getMonth() && day < offset.getDate())) {
		year += 1;
	}

	return new Date(year, month, day, hours, minutes);
}

export function dedupeEvents(events: EventAttributes[]) {
	return events.filter(
		(event, index, self) => index === self.findIndex((e) => e.url === event.url && e.start === event.start)
	);
}
