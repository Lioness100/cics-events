# cics-events

To install dependencies:

```bash
bun install
```

To run:

```bash
bun start
```

Serves an API to get upcoming events at
https://www.cics.umass.edu/events in ICS format. You can input this URL into
your calendar app of choice. To backfill events since September, run:

```bash
bun populate
```
