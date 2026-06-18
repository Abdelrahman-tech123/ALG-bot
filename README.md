# ALG-bot

A web-based platform for collecting, managing, and analyzing business data from Google Maps. The project combines automated data extraction with a responsive dashboard that allows users to monitor scraping tasks, explore results, and export collected data for further use.

## Features

### Data Extraction

* Automated browsing and data collection using Playwright.
* Extracts key business information, including:

  * Business name
  * Phone number
  * Website
  * Address
  * Opening hours
  * Business images
* Parses and standardizes in both Arabic and English formats.
* Optimizes scraping performance by blocking unnecessary network resources during page loading.
* Includes an email discovery module that visits business websites and attempts to locate publicly available email addresses.

### Generating Excel files
   * generating excel files for your scraped data to an excel files and even filtering the data with keywords before generating the file

### Dashboard

* Clean and responsive interface with support for both light and dark themes.
* Fast data rendering with filtering and pagination capabilities.
* Monitor scraping progress and manage results from a single interface.

### Authentication & Security

* User authentication and session management with NextAuth.js.
* JWT-based communication between the frontend and backend APIs.
* Protected endpoints to ensure only authorized users can access data.

## Tech Stack

### Frontend

* Next.js 14
* TypeScript
* Tailwind CSS
* NextAuth.js

### Backend

* FastAPI (Python)

### Scraping & Processing

* Playwright
* Regular Expressions (Regex)
* Python Collections

### Data Communication

* Axios
* REST API

## Workflow

1. The user submits a keyword and location through the dashboard.
2. FastAPI triggers the scraping process using Playwright.
3. Business data is collected, cleaned, and enriched with additional information such as emails.
4. Results are displayed in the dashboard and can be filtered, reviewed, or exported.

## Installation

### Backend

```bash id="b1"
pip install -r requirements.txt
python run.py
```

### Frontend

```bash id="b2"
npm install
npm run dev
```

## Technical Notes

* Uses an infinite scrolling strategy to handle dynamically loaded Google Maps results.
* Custom navigation delays and browser configurations help improve scraping stability.
* Built with a modular architecture, making it easier to extend with additional data sources in the future.

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or reproduction of any part of this project is prohibited.
