# **App Name**: QuickPoll

## Core Features:

- Poll Creation: Form to create a new poll with questions and options.
- Poll Creation API: API endpoint (/create) to handle poll creation and generate a unique poll ID.
- Voting Interface: Page to display poll questions and options for voting using the poll ID (/vote/:id).
- Vote Handling API: API endpoint (/vote/:id) to handle voting submissions.
- Results Display: Page to display real-time poll results with simple charts or graphs (/results/:id).
- In-Memory Cache: In-memory cache to store polls and their results. Implement TTL for auto-cleaning after 30 minutes.
- Automated Sentiment Analysis: A tool for automated sentiment analysis of free text responses in polls, if they are enabled. Use a tool to surface potential issues to moderators.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to inspire trust.
- Background color: Very light blue (#F0F4F9) for a clean interface.
- Accent color: Orange (#FF9800) to draw attention to key actions, such as voting buttons.
- Clear and readable sans-serif fonts for all text elements.
- Simple and consistent icons for poll options and actions.
- Clean, responsive layout optimized for both desktop and mobile devices.
- Subtle transitions and animations to provide feedback and enhance user experience.