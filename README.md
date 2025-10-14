# cics-events

![Demo](https://github.com/user-attachments/assets/baeeef9d-d3ec-4896-bebc-407c0815a381)

Aggregates upcoming events from [UMass CICS events page](https://www.cics.umass.edu/events) and provides them in ICS format for easy calendar subscription.

## 🌐 Live Site

Visit [https://lioness100.github.io/cics-events/](https://lioness100.github.io/cics-events/) to:

- View all CICS events
- Download the ICS file
- Subscribe to the calendar in Google Calendar or any calendar app

## 📅 Calendar URL

Subscribe to the calendar in your favorite calendar app using:

```
webcal://lioness100.github.io/cics-events/events.ics
```

Or download directly:

```
https://lioness100.github.io/cics-events/events.ics
```

## 🔄 How It Works

A daily GitHub Action scrapes the CICS events page at 6 AM UTC, generates a fresh `events.ics` file with all upcoming events, and deploys it to GitHub Pages at a static URL. No server maintenance required and resilient to temporary downtime.

## 🚀 Setup

### Using GitHub Actions (Recommended)

1. **Fork this repository**

2. **Enable GitHub Pages:**
    - Go to repository Settings → Pages
    - Under "Build and deployment", set Source to "GitHub Actions"

3. **Enable GitHub Actions:**
    - Go to the Actions tab and enable workflows
    - The workflow will run automatically daily and on any push to main

4. **Manual trigger (optional):**

    ```bash
    # Trigger the workflow manually from the Actions tab
    # or push to main branch
    ```

5. **Your calendar will be available at:**
    ```
    https://<your-username>.github.io/cics-events/events.ics
    ```

### Using a Custom Domain (Optional)

To use your own domain (e.g., `cics.jsiegel.dev`) with GitHub Pages:

1. **Add DNS CNAME record:**

    ```
    CNAME: cics → lioness100.github.io
    ```

2. **Configure in GitHub:**
    - Settings → Pages → Custom domain: `cics.jsiegel.dev`
    - Enable "Enforce HTTPS"

3. **Wait for DNS propagation** (5-60 minutes)

Your calendar will be available at both URLs.

## 🛠️ Scripts

- `bun run generate` - Generate the ICS file (used by GitHub Actions)
- `bun run populate` - Backfill events since September

## 🏗️ Architecture

The GitHub Actions workflow:

1. Runs daily at 6 AM UTC (and on pushes to main)
2. Scrapes events from the CICS website
3. Generates an ICS file using cached historical data
4. Deploys to GitHub Pages

This ensures:

- ✅ No single point of failure
- ✅ Automatic daily updates
- ✅ Free hosting via GitHub Pages
- ✅ Historical event data is preserved
- ✅ Works even if the scraper temporarily fails

## 📝 License

MIT
