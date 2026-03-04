# Pokémon Pathfinder

Pokémon Pathfinder is an interactive web application that allows users to find optimal paths across the Kanto region. Built with a modern 3D frontend and a high-performance backend, it merges a 28×20 tilemap with Roboflow object-detection annotations to create a weighted grid for pathfinding.

## Features
- **Interactive 3D Map**: A stunning, Pokémon-themed 3D visualization of the Kanto region built with React Three Fiber.
- **Multiple Pathfinding Algorithms**: Compare and visualize different routing algorithms (A*, Dijkstra, BFS, Bellman-Ford, Greedy Best-First, and Kruskal's MST).
- **Dynamic Routing**: See the algorithm in action as it navigates around obstacles, terrain types, and Pokémon spawns.
- **Performance Metrics**: View real-time stats like path weight, nodes expanded, and computation time.

## Screenshots

<div align="center">
  <img src="frontend/public/maps/kanto.jpg" alt="Kanto Map View" width="400"/>
  <p><i>The Kanto Region Map</i></p>
</div>

> **Note:** Add your actual app screenshots to the `assets/` or `public/` directory and update this section to showcase the 3D map, the algorithm comparisons, and the pathfinding in action!

## Tech Stack
- **Frontend**: Next.js 14, React 18, Tailwind CSS, Framer Motion, GSAP, Three.js, React Three Fiber/Drei.
- **Backend**: FastAPI, Python 3, Uvicorn, Pydantic.
- **Deployment**: Docker, Docker Compose.

## Setup Instructions

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (Recommended)
- *Or* [Node.js](https://nodejs.org/) (v18+) and [Python 3.9+](https://www.python.org/downloads/) for manual installation.

### Option 1: Running with Docker (Recommended)
The easiest way to get the project running is using Docker Compose. Make sure Docker is running on your machine.

1. Clone the repository and navigate to the project root.
2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```
3. Open the application:
   - **Frontend**: http://localhost:3000
   - **Backend API & Docs**: http://localhost:8000/docs

To stop the application, run:
```bash
docker-compose down
```

### Option 2: Manual Setup

#### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv .venv
   .\.venv\Scripts\activate

   # macOS/Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the API server:
   ```bash
   uvicorn app.main:app --reload
   ```

#### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (Using npm, yarn, or pnpm):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` in your browser.

## Architecture & Algorithms
For a detailed breakdown of the system architecture, data flow, and the specific pathfinding algorithms implemented, please refer to the [ARCHITECTURE.md](ARCHITECTURE.md) file.
