import type { EventAttributes as DefaultEventAttributes } from 'ics';

export type EventAttributes = DefaultEventAttributes & {
	start: number;
	url: string;
};

export interface PageData {
	events: EventAttributes[];
	totalResults?: number;
}
