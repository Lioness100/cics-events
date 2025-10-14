# cics-events

![Demo](https://github.com/user-attachments/assets/baeeef9d-d3ec-4896-bebc-407c0815a381)

Aggregates upcoming events from [UMass CICS events
page](https://www.cics.umass.edu/events) and provides them in ICS format for
easy calendar subscription. Events will be scraped every 24 hours by a GitHub
action and then uploaded to Github Pages.

To install:

```bash
bun install
```

To backfill events since 09/02/2025 run:

```bash
bun populate
```

For everyday updates, to add/correct future events, run:

```bash
bun start
```
