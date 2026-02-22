# **App Name**: Impact Vision

## Core Features:

- User Authentication: Secure user login and registration using Firebase Authentication (Email/Google). Protect dashboard routes.
- Decision Input & Parsing: Allow users to enter decisions in plain text. Implement a rule-based parser to extract category, action, amount/duration, frequency, and unit from the input.
- Impact Simulation Engine: Simulate the impact of decisions on health, finance, and career using deterministic formulas. Calculate a risk score based on the combined impacts and generates 3-5 actionable recommendation tips.
- Firestore Integration: Store user data, decisions, and simulation results in Firestore. Structure data models for users, decisions, and simulations.
- Cloud Function for Simulation: Implement a Firebase Cloud Function that validates user authentication, parses the input, runs the simulation, stores the decision and simulation results in Firestore, and returns the results to the frontend.
- Dashboard UI: Provide a user-friendly dashboard with an input box for decisions and a "Simulate" button. Display parsed fields and charts for health, finance, and skill over different time horizons. Show a history list of previous simulations and a detail page for each simulation.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5), evoking trust, intelligence, and foresight, central themes in future-oriented planning.
- Background color: Very light desaturated indigo (#F0F2F9) to create a clean, focused backdrop for decision analysis.
- Accent color: Teal (#4CAF50), to highlight calls to action and key metrics in charts, conveying growth and positive change.
- Body text: 'Inter', sans-serif font, known for its clean, readable design.
- Headlines: 'Space Grotesk' to pair with 'Inter', another sans-serif, for headers and emphasis within the simulator UI.
- Use clear and concise icons from a library like Material Design Icons to represent different categories (health, finance, career) and actions.
- Use a responsive and intuitive layout with clear sections for input, parsed data, simulation results, charts, and history.
- Incorporate subtle animations for transitions and loading states to enhance the user experience.