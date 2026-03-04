# Architecture and Algorithms Workflow

This document provides a comprehensive overview of the system architecture and the pathfinding algorithms utilized in the Pokémon Pathfinder application.

## 1. System Architecture

The application is built on a decoupled, client-server architecture, utilizing modern web frameworks and a containerized deployment model.

### 1.1 Backend (FastAPI)
The backend acts as the core logic and calculation engine for the application.

- **Initialization & Graph Building**: On startup, the `lifespan` event reads local JSON data sources (`map.json` and `_annotations.coco.json`). These define a 28×20 grid, including terrain types, cities, landmarks, and Pokémon spawns. The backend merges these datasets into an in-memory weighted grid graph. 
- **API Layer**: Exposes robust REST endpoints under `/api/v1/` to serve map metadata (cities, spawns) and calculate routes.
- **Algorithm Engine**: Handles all heavy computational lifting, isolating specific algorithm implementations into separate modules within `app/core/algorithms/`.

### 1.2 Frontend (Next.js)
The frontend serves as the interactive visualization layer.

- **3D Rendering Ecosystem**: Uses **Three.js** via **React Three Fiber (@react-three/drei)** to render the Pokémon map realistically and dynamically.
- **User Interface**: Built with **React 18** and styled using **Tailwind CSS**. Components like dropdowns and dialogs are powered by **Radix UI** for accessibility.
- **Animation System**: Utilizes **Framer Motion** and **GSAP** for smooth UI transitions and timeline-based drawing of the pathfinding routes overlaid on the 3D map.

### 1.3 Communication Flow
1. **Load Map**: The frontend boots up and fetches grid metadata from the backend (cities, dimensions).
2. **User Input**: The user selects a defined start and destination via the UI, and chooses a specific pathfinding algorithm.
3. **API Request**: The frontend constructs a `POST /api/v1/find-path` request with the start/end coordinates.
4. **Execution**: The backend parses the request, instantiates the selected algorithm routine, and calculates the optimal path across the weighted grid map. Performance metrics (time, expanded nodes) are logged.
5. **Response & Visualization**: The frontend receives the coordinate array and metrics, initiating a step-by-step 3D animation to draw the calculated path and displaying stat overlays.

---

## 2. Pathfinding Algorithms

The core of the application lies in its dynamic route-planning capabilities. Because the Kanto map features diverse terrain (routes, water, grass), transitions between grid cells carry varying weight costs. Finding a path is thus a weighted graph traversal problem.

The backend implements multiple algorithms to allow users to compare speed vs. accuracy.

### 2.1 A* (A-Star) Search
- **How it works**: A* combines the actual cost measured from the start node (`g(n)`) and a heuristic estimate of the cost to the destination (`h(n)`). It prioritizes exploring nodes with the lowest total estimated cost `f(n) = g(n) + h(n)`.
- **Use Case**: The most practical and balanced algorithm for this app. It efficiently guarantees the shortest path on a weighted grid by directly aiming towards the target instead of blindly exploring.

### 2.2 Dijkstra's Algorithm
- **How it works**: Explores the graph layer by layer, prioritizing nodes with the lowest absolute travel cost from the starting point. It does not use a heuristic to guide the search direction.
- **Use Case**: Guarantees the shortest path just like A*, but often requires expanding considerably more nodes because it searches uniformly in all directions. Excellent for establishing a baseline for accuracy.

### 2.3 Breadth-First Search (BFS)
- **How it works**: A blind search algorithm that explores all neighbor nodes at the present depth prior to moving on to the nodes at the next depth level.
- **Use Case**: BFS ignores edge weights, treating all moves as a cost of 1. It is implemented for comparative and educational purposes to show how routing fails or behaves when ignoring terrain difficulties.

### 2.4 Greedy Best-First Search
- **How it works**: Works similarly to A* but relies *only* on the heuristic (`f(n) = h(n)`). It entirely ignores the cost of the path accumulated so far.
- **Use Case**: Extemely fast at finding a path, but the path is not guaranteed to be the shortest. It often gets trapped by obstacles and takes suboptimal detours. Good for illustrating the importance of `g(n)` in A*.

### 2.5 Bellman-Ford
- **How it works**: Computes shortest paths from a single source vertex to all other vertices. It iterates over all edges `V-1` times, applying edge relaxation.
- **Use Case**: Overkill for a standard grid where all weights are non-negative. However, it is an essential graph algorithm implemented for completeness; it is the only one capable of handling negative edge weights (if any terrain features were to provide speed boosts).

### 2.6 Kruskal's Algorithm (Minimum Spanning Tree)
- **How it works**: A greedy algorithm that finds a Minimum Spanning Tree (MST) for a connected weighted graph. It sorts all edges by weight, then adds them to the MST as long as they don't form a cycle.
- **Use Case**: Displayed purely via the `/api/v1/mst` endpoint rather than standard point-to-point pathfinding. It visualizes the absolute most efficient way to continuously connect every single reachable cell in the map.
