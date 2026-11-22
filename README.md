# vent. | Campus feedback prototype

A Next.js and Firebase prototype for submitting campus feedback, tracking it with a submission ID, and reviewing it in moderation and analytics dashboards. Built for the NUS community.

> This repository is a prototype, not an official reporting channel or a production service. Use fictional feedback in a separate development Firebase project. The form does not ask for a name, but free text can identify people; do not enter real feedback or personal details.

## What to try

1. Open the home page and submit a fictional example, such as *The study room in this demo could use another reading lamp.*
2. Save the generated ID and use **Tracker** to view the submission status.
3. With a locally configured admin key, open the moderator and admin dashboards to explore the review flow and aggregate scores.

The application shows a submission count, tracks moderation status, and calculates simple relevance and sentiment scores. The checked-in [Vercel configuration](vercel.json) schedules an analytics route; it does not prove that a production deployment is active or that these scores are validated.

## Run locally

Use Node.js 20.9 or newer and pnpm. Clone this repository and run these commands from its root:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Before testing any data-backed route, configure a disposable Firebase project using the [environment setup guide](ENV_SETUP.md). Open http://localhost:3000/ and try the route walkthrough above.

The package manifest defines `dev`, `build`, `start`, and `lint`; it does not define an `npm test` script. [The API harness](tests/api.test.ts) expects a running app and writes demo submissions, so keep it away from any database with real feedback.

## Implementation

- [App routes](app/) serve the form, tracker, dashboards, and APIs.
- [Firebase integration](lib/firebase.ts) connects the app to Firestore.
- [Analytics script](scripts/analytics.py) is a separate Python implementation for batch scoring.
- [Deployment notes](DEPLOYMENT.md) describe the original Vercel setup, not a production readiness assessment.

## License

MIT

## Authors

Built for NUS Community
