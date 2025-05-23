Project Overview: MonaFarms Website (Current Version)
Purpose: A web-based user interface for "MonaFarms," a blockchain farming simulation game intended to run on the Monad testnet. The current version uses an older, proof-of-concept set of smart contracts.
Core Technologies:
Frontend: React (using functional components and hooks).
Build Tool: Vite.
Blockchain Interaction: wagmi library for React hooks, ConnectKit for wallet connections.
Styling: Likely Tailwind CSS or a similar utility-first CSS framework, inferred from class names like flex, items-center, shadow-md, btn, etc.
Application Structure (src/ directory):
main.jsx: Entry point of the React application. Sets up the Web3Provider.
App.jsx: The main application component.
Manages the overall layout: a persistent navbar, a conditional sidebar (visible when the wallet is connected), and a central content area.
Implements tab-based navigation for different game sections.
Includes visual elements like a DayNightCycle animation and a LoadingScreen.
Integrates a NotificationProvider for in-app messages and AchievementNotifications.
Uses useAccount from wagmi to manage wallet connection state.
Web3Provider.jsx: Configures and provides the Wagmi/ConnectKit setup for wallet interactions.
components/: Contains various UI components.
Core Game Sections (Tabs):
farm/FarmManagerWrapper.jsx: Handles the primary farming interface. Interacts with an old FarmManager contract. Displays farm tiles, inventory (currently limited to a few seed types, water, fertilizer), and allows actions like planting, watering, fertilizing, and harvesting. Calculates and shows crop growth progress.
ShopManagerComponent.jsx: (Assumed based on App.jsx imports) For the shop interface, likely interacting with an old ShopManager contract.
CropsTokenComponent.jsx: (Assumed) For displaying $CROPS token information, likely interacting with an old CropsToken contract.
PlayerRegistryComponent.jsx: (Assumed) For player registration and profile display, likely interacting with an old PlayerRegistry contract.
LeaderboardComponent.jsx: (Assumed) For displaying the leaderboard, likely interacting with an old Leaderboard contract.
UI & Utility: Sidebar.jsx, notifications/NotificationSystem.jsx, ui/LoadingScreen.jsx, animations/DayNightCycle.jsx, etc.
context/:
ProgressContext.js: Manages progress-related state, including level-up animations/rewards.
Other contexts like DragDropContext (from App.jsx).
services/:
AchievementManager.js: A client-side system for tracking and displaying achievements based on player statistics stored in localStorage. This is separate from any on-chain achievement or tier system of the old contracts.
assets/, art/, styles/: For static assets (images, icons) and stylesheets.
Smart Contract Interaction (Current State):
Contracts Used: The frontend interacts with an old set of smart contracts located in the contracts/ directory at the root of the project. ABIs for these are in contracts/abis/.
Interaction Method: Uses wagmi hooks (useReadContract, useWriteContract) for reading data from and sending transactions to the smart contracts.
Contract Addresses: Currently, contract addresses appear to be hardcoded within the components that use them (e.g., in FarmManagerWrapper.jsx).
ABIs: JSON ABI files are imported directly into components.
Key Characteristics & Points for New Agent:
Proof-of-Concept State: The user has indicated that the current implementation is based on older, demo-level contracts and that some UI elements are purely cosmetic or mock.
Primary Goal: The main task is to integrate a new, more comprehensive set of smart contracts (located in contracts-new/) and overhaul the UI/UX to match the expanded game mechanics.
Working Wallet Integration: The project has a functional wallet connection setup using ConnectKit and Wagmi.
Modular Components: The UI is broken down into React components, which should aid in targeted refactoring.
Frontend-Heavy Logic: Game state related to UI (like selected tiles, growth percentages) is managed within React components. Some game logic (like achievement tracking via AchievementManager.js) is purely client-side.