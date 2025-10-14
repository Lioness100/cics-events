import type { EventAttributes as DefaultEventAttributes } from 'ics';

export type EventAttributes = DefaultEventAttributes & {
	start: number;
	url: string;
};

export type EventCache = Map<string, EventAttributes>;
