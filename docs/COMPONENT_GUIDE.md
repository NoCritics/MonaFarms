# MonaFarms Component Guide

## Overview

This document provides detailed documentation for all components in the MonaFarms application. Use this guide when implementing new features or modifying existing ones to maintain consistency across the application.

## Table of Contents

1. [Core Components](#core-components)
2. [UI Components](#ui-components)
3. [Farm Components](#farm-components)
4. [Shop Components](#shop-components)
5. [Profile Components](#profile-components)
6. [Leaderboard Components](#leaderboard-components)
7. [Effect Components](#effect-components)
8. [Utility Components](#utility-components)
9. [Onboarding Components](#onboarding-components)
10. [Integration Guidelines](#integration-guidelines)

## Core Components

### App (`App.jsx`)

The main application component that serves as the entry point for the UI.

**Props:** None

**State:**
- `activeTab`: Currently active tab section
- `isConnected`: Wallet connection status
- `isLoading`: Application loading state
- `sidebarVisible`: Mobile sidebar visibility state

**Usage:**
```jsx
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

### Web3Provider (`Web3Provider.jsx`)

Provides blockchain connectivity through wagmi and ConnectKit.

**Props:**
- `children`: React children to be wrapped with provider

**Usage:**
```jsx
import { Web3Provider } from './Web3Provider';

<Web3Provider>
  <App />
</Web3Provider>
```

## UI Components

### ResponsiveContainer (`ResponsiveContainer.jsx`)

A container that responds to viewport changes and optimizes rendering.

**Props:**
- `children`: React children
- `className`: Additional CSS classes
- `breakpoints`: Custom breakpoint definitions
- `minHeight`: Minimum height to prevent layout shifts
- `debounceTime`: Debounce time for resize events
- `preventLayoutShift`: Boolean to prevent layout shifts during resizing
- `enableHardwareAcceleration`: Boolean to enable hardware acceleration
- `fallbackWidthPercentage`: Percentage width for mobile devices
- `center`: Boolean to center the container

**Usage:**
```jsx
import { ResponsiveContainer } from './components/ui/ResponsiveContainer';

<ResponsiveContainer minHeight={300}>
  <YourComponent />
</ResponsiveContainer>
```

### SkeletonLoader (`SkeletonLoader.jsx`)

Displays placeholder loading states for various content types.

**Props:**
- `type`: Type of skeleton ('text', 'farm-tile', 'card', 'avatar', etc.)
- `count`: Number of skeleton items to render
- `width`: Custom width
- `height`: Custom height
- `className`: Additional CSS classes

**Usage:**
```jsx
import { SkeletonLoader } from './components/ui/SkeletonLoader';

// Loading text lines
<SkeletonLoader type="text" count={3} />

// Loading farm tiles
<SkeletonLoader type="farm-tile" count={9} />

// Loading card
<SkeletonLoader type="card" />
```

### EnhancedLoadingScreen (`EnhancedLoadingScreen.jsx`)

Animated loading screen with a farm scene and loading tips.

**Props:**
- `isLoading`: Boolean to control visibility
- `progress`: Optional progress value (0-100)
- `minDisplayTime`: Minimum time to display in milliseconds
- `tips`: Array of loading tips to display

**Usage:**
```jsx
import { EnhancedLoadingScreen } from './components/ui/EnhancedLoadingScreen';

<EnhancedLoadingScreen 
  isLoading={appIsLoading} 
  minDisplayTime={2000}
  tips={[
    "Water your crops to make them grow!",
    "Different crops have different growth times and rewards."
  ]}
/>
```

## Farm Components

### FarmGrid (`FarmGrid.jsx`)

Visual representation of farm tiles with interactive elements.

**Props:**
- `selectedTile`: Currently selected tile index
- `setSelectedTile`: Function to update selected tile
- `tileInfo`: Information about the selected tile
- `tileCount`: Total number of tiles
- `cropConfigs`: Configuration for different crop types
- `isWatering`: Boolean for watering animation state
- `isHarvesting`: Boolean for harvesting animation state
- `isFertilizing`: Boolean for fertilizing animation state
- `onTileSelect`: Function called when a tile is selected

**Usage:**
```jsx
import FarmGrid from './components/farm/FarmGrid';

<FarmGrid
  selectedTile={selectedTile}
  setSelectedTile={setSelectedTile}
  tileInfo={tileInfo}
  tileCount={tileCount}
  cropConfigs={cropConfigs}
  isWatering={isWatering}
  isHarvesting={isHarvesting}
  isFertilizing={isFertilizing}
  onTileSelect={handleTileSelect}
/>
```

### FarmManagerWrapper (`FarmManagerWrapper.jsx`)

Integrates with the FarmManager smart contract to handle farming actions.

**Props:** None

**State:**
- `selectedTile`: Currently selected tile
- `tileInfo`: Selected tile information
- `tileCount`: Number of owned tiles
- `inventory`: Player inventory data
- `cropConfigs`: Crop configuration data
- `isLoading`: Loading state for blockchain interactions
- `actionState`: Current action being performed

**Usage:**
```jsx
import FarmManagerWrapper from './components/farm/FarmManagerWrapper';

<FarmManagerWrapper />
```

## Shop Components

### ShopManagerComponent (`ShopManagerComponent.jsx`)

Handles in-game purchases using CROPS tokens.

**Props:** None

**State:**
- `seedPrices`: Prices for different seed types
- `waterBucketPrice`: Price for water buckets
- `fertilizerPrice`: Price for fertilizer
- `tilePrice`: Price for additional tiles
- `inventory`: Player inventory data
- `balance`: CROPS token balance
- `fertilizerCooldown`: Time until next fertilizer purchase

**Usage:**
```jsx
import ShopManagerComponent from './components/ShopManagerComponent';

<ShopManagerComponent />
```

### ShopItem (`ShopItem.jsx`)

Individual shop item display with buy button.

**Props:**
- `name`: Item name
- `description`: Item description
- `price`: Item price in CROPS tokens
- `icon`: Icon component or emoji
- `disabled`: Boolean to disable the buy button
- `cooldown`: Optional cooldown time remaining
- `onBuy`: Function called when item is purchased
- `quantity`: Optional quantity to purchase

**Usage:**
```jsx
import { ShopItem } from './components/ui/ShopItem';

<ShopItem
  name="Water Bucket"
  description="Used to water your crops"
  price={50}
  icon="💧"
  onBuy={handleBuyWaterBucket}
/>
```

## Profile Components

### PlayerRegistryComponent (`PlayerRegistryComponent.jsx`)

Handles player registration and profile display.

**Props:** None

**State:**
- `playerData`: Player profile information
- `nickname`: Player nickname
- `registrationTime`: When the player registered
- `isRegistered`: Registration status
- `isEditing`: Profile editing state

**Usage:**
```jsx
import PlayerRegistryComponent from './components/PlayerRegistryComponent';

<PlayerRegistryComponent />
```

### CropsTokenComponent (`CropsTokenComponent.jsx`)

Manages CROPS token balance and faucet claims.

**Props:** None

**State:**
- `balance`: Current token balance
- `faucetCooldown`: Time until next faucet claim
- `isLoading`: Loading state for blockchain interactions
- `lastClaimTime`: Timestamp of last faucet claim

**Usage:**
```jsx
import CropsTokenComponent from './components/CropsTokenComponent';

<CropsTokenComponent />
```

## Leaderboard Components

### LeaderboardComponent (`LeaderboardComponent.jsx`)

Displays player rankings based on points.

**Props:** None

**State:**
- `topPlayers`: List of top-ranked players
- `playerRank`: Current player's rank
- `totalPlayers`: Total number of registered players
- `isLoading`: Loading state for blockchain interactions

**Usage:**
```jsx
import LeaderboardComponent from './components/LeaderboardComponent';

<LeaderboardComponent />
```

## Effect Components

### WeatherEffects (`WeatherEffects.jsx`)

Adds dynamic weather effects to the farm display.

**Props:**
- `timeOfDay`: Current time of day ('dawn', 'day', 'dusk', 'night')
- `season`: Current season ('spring', 'summer', 'fall', 'winter')

**Usage:**
```jsx
import { WeatherEffects } from './components/effects';

<WeatherEffects timeOfDay="day" season="summer" />
```

### SeasonalEffects (`SeasonalEffects.jsx`)

Adds seasonal visual effects to the farm.

**Props:**
- `season`: Current season ('spring', 'summer', 'fall', 'winter')
- `isTransitioning`: Boolean for season transition animation

**Usage:**
```jsx
import { SeasonalEffects } from './components/effects';

<SeasonalEffects season="fall" isTransitioning={false} />
```

### DayNightCycle (`DayNightCycle.jsx`)

Simulates day/night cycle with lighting changes.

**Props:**
- `cycleSpeed`: Speed of day/night cycle in seconds (default: 300)
- `startTime`: Initial time of day (0-1, where 0 is midnight)

**Usage:**
```jsx
import DayNightCycle from './components/animations/DayNightCycle';

<DayNightCycle cycleSpeed={240} />
```

## Utility Components

### Sidebar (`Sidebar.jsx`)

Navigation sidebar with resource counters.

**Props:** None

**State:**
- `resources`: Player resource data
- `notifications`: Notification status for each section

**Usage:**
```jsx
import Sidebar from './components/Sidebar';

<Sidebar />
```

## Onboarding Components

### OnboardingTutorial (`OnboardingTutorial.jsx`)

Step-by-step interactive tutorial for new users.

**Props:**
- `isOpen`: Boolean to control visibility
- `onClose`: Function called when tutorial is closed
- `onComplete`: Function called when tutorial is completed
- `startAtStep`: Initial step index
- `tutorialSteps`: Optional custom tutorial steps

**Usage:**
```jsx
import { OnboardingTutorial } from './components/onboarding';

<OnboardingTutorial
  isOpen={showTutorial}
  onClose={handleCloseTutorial}
  onComplete={handleCompleteTutorial}
  startAtStep={0}
/>
```

### OnboardingController (`OnboardingController.jsx`)

Manages the display and state of onboarding tutorials.

**Props:**
- `children`: React children
- `currentVersion`: Current app version
- `forceShow`: Boolean to force tutorial display
- `showForNewUsers`: Boolean to show tutorial for new users
- `showUpdates`: Boolean to show update tutorials
- `updateTutorialSteps`: Tutorial steps for update tutorials

**Usage:**
```jsx
import { OnboardingController } from './components/onboarding';

<OnboardingController
  currentVersion="1.0.0"
  showForNewUsers={true}
  showUpdates={true}
>
  <App />
</OnboardingController>
```

## Integration Guidelines

### Contract Integration

When integrating with smart contracts, follow these patterns:

1. **Contract Initialization**:
```jsx
const { data: contract } = useContract({
  address: contractAddress,
  abi: contractAbi,
});
```

2. **Reading Contract Data**:
```jsx
const { data, isLoading, error } = useContractRead({
  contract,
  functionName: 'functionName',
  args: [arg1, arg2],
});
```

3. **Writing to Contract**:
```jsx
const { writeAsync, isLoading } = useContractWrite({
  contract,
  functionName: 'functionName',
});

const handleAction = async () => {
  try {
    const tx = await writeAsync({ args: [arg1, arg2] });
    await tx.wait();
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### State Management

For component state management:

1. **Local Component State**: Use `useState` for component-specific state.
2. **Shared State**: Use React Context for state shared between components.
3. **Form State**: Use controlled components with `useState` for form inputs.

### Performance Best Practices

1. **Avoid Unnecessary Re-renders**:
   - Use `React.memo` for functional components
   - Use `useCallback` for event handlers
   - Use `useMemo` for expensive calculations

2. **Optimize List Rendering**:
   - Add `key` prop to list items
   - Consider virtualization for long lists

3. **Defer Non-Critical Updates**:
   - Use `useEffect` cleanup to cancel operations
   - Implement debouncing for frequent updates

4. **Responsive Images**:
   - Use appropriate image formats (WebP with fallbacks)
   - Implement lazy loading for off-screen images
