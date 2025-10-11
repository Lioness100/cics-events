# cics-events

![Demo](https://github.com/user-attachments/assets/baeeef9d-d3ec-4896-bebc-407c0815a381)

To install dependencies:

```bash
bun install
```

Copy `.env.example` to `.env` and optionally edit the environment variables.

```bash
cp .env.example .env
```

To run:

```bash
bun start
```

Serves an API to get upcoming events at
https://www.cics.umass.edu/events in ICS format. You can input this URL into
your calendar app of choice.

API routes:

- `/events.ics`: Returns upcoming events in ICS format.
- `/subscribe`: Redirects to subscribe to the calendar in Google Calendar.
- `/`: Serves the main HTML page with the embedded calendar.

To backfill events since September, run:

```bash
bun populate
```
