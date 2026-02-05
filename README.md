# ROEFSMART - Premium Study Planner
[aureliabutton]
## 🚀 Publicatie Handleiding (Deployment)
**Gefeliciteerd met je nieuwe app!** Hier is hoe je ROEFSMART publiceert naar het internet zodat je het op je telefoon kunt gebruiken.
### Stap 1: Publiceren naar Cloudflare
De applicatie is volledig geconfigureerd voor Cloudflare Workers. Voer het volgende commando uit in je terminal:
```bash
bun run deploy
```
Dit commando zal:
1. De applicatie bouwen (optimaliseren voor productie).
2. De code uploaden naar het wereldwijde netwerk van Cloudflare.
3. Je een URL geven (bijv. `https://aurum-study.jouwnaam.workers.dev`) waar je app live staat.
### Stap 2: Installeren op je Telefoon
1. Open de URL op je iPhone of Android toestel.
2. **iPhone (Safari):** Tik op de 'Deel' knop en kies "Zet op beginscherm".
3. **Android (Chrome):** Tik op het menu (3 puntjes) en kies "App installeren" of "Toevoegen aan startscherm".
De app opent nu als een native applicatie zonder browserbalken, volledig in de donkere ROEFSMART stijl.
---
## Technical Documentation
Aurum Study (ROEFSMART) is an ultra-luxury, mobile-first web application designed to bring elegance and focus to academic preparation. It functions as an intelligent study companion that automatically generates disciplined study schedules based on test dates and difficulty levels.
The application features a 'Deep Black' and 'Royal Gold' aesthetic, utilizing glassmorphism, subtle glows, and refined typography to create a distraction-free, premium environment.
### Features
- **Smart Agenda Dashboard**: A timeline-based view of upcoming tests and daily study tasks, presented as high-end cards.
- **The Ritual (Test Creation)**: A sophisticated, multi-step wizard for scheduling new tests. Users select subjects, dates, and 'Difficulty Intensity' (Level 1-5).
- **Study Engine**: An algorithmic core that back-calculates start dates based on difficulty and populates the calendar with daily study sessions.
- **Sanctuary (Profile)**: A progress tracking center showing active streaks, tests mastered, and upcoming challenges.
- **Premium Aesthetic**: Designed with a dark theme, deep charcoal tones, and warm amber accents to reinforce focus and academic control.
- **Cloud Persistence**: Secure, cloud-based data synchronization across devices using Cloudflare Durable Objects.
### Tech Stack
**Frontend:**
- **React 18**: UI Library
- **Vite**: Build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn UI**: Reusable component library
- **Framer Motion**: Animation library for premium interactions
- **Zustand**: State management
- **Lucide React**: Iconography
**Backend:**
- **Cloudflare Workers**: Serverless execution environment
- **Hono**: Ultrafast web framework for the Edge
- **Durable Objects**: Strongly consistent storage for user state
- **TypeScript**: Type safety across the full stack
### Getting Started
#### Prerequisites
- **Bun**: This project uses `bun` as the package manager.
- **Node.js**: Required for some build tools.
- **Wrangler**: The Cloudflare Developer Platform command-line tool.
#### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd aurum-study
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
#### Development
To start the development server:
```bash
bun run dev
```
This command starts the Vite development server. Open your browser and navigate to the local address provided (usually `http://localhost:3000`).
**Note:** The backend logic resides in the `worker/` directory. In development mode, API calls are proxied or mocked depending on the configuration.
### Project Structure
- `src/`: Frontend React application code.
  - `components/`: Reusable UI components (Shadcn UI).
  - `pages/`: Application views (Dashboard, Wizard, Profile).
  - `hooks/`: Custom React hooks.
  - `lib/`: Utilities and API clients.
- `worker/`: Cloudflare Worker and Durable Object code.
  - `index.ts`: Worker entry point.
  - `user-routes.ts`: API route definitions.
  - `entities.ts`: Durable Object entity definitions.
- `shared/`: Types shared between frontend and backend.
### License
This project is licensed under the MIT License.