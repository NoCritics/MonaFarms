# MonaFarms Maintenance Guide

## Overview

This guide is designed for developers maintaining and extending the MonaFarms application. It covers best practices, architectural decisions, and common maintenance tasks.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Development Workflow](#development-workflow)
3. [Smart Contract Integration](#smart-contract-integration)
4. [UI Updates](#ui-updates)
5. [Performance Optimization](#performance-optimization)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Future Roadmap](#future-roadmap)

## Project Structure

### Directory Organization

```
monad-deployer/
├── contracts/                 # Smart contracts
│   ├── abis/                  # Contract ABIs
│   ├── CropsToken.sol         # ERC20 token implementation
│   ├── FarmManager.sol        # Core farming gameplay
│   ├── Leaderboard.sol        # Player rankings
│   ├── PlayerRegistry.sol     # Player account management
│   └── ShopManager.sol        # In-game item purchases
├── docs/                      # Documentation
├── public/                    # Static assets
├── src/                       # Frontend source code
│   ├── assets/                # Images, icons, etc.
│   ├── components/            # React components
│   │   ├── animations/        # Visual animations
│   │   ├── effects/           # Visual effects
│   │   ├── farm/              # Farm-related components
│   │   ├── notifications/     # Notification system
│   │   ├── onboarding/        # Tutorial components
│   │   ├── profile/           # User profile components
│   │   └── ui/                # Reusable UI components
│   ├── context/               # React context providers
│   ├── services/              # API services
│   ├── styles/                # CSS styles
│   │   └── constants/         # Design system constants
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Main application
│   ├── main.jsx               # Entry point
│   └── Web3Provider.jsx       # Blockchain connection
└── vite.config.js             # Build configuration
```

### Key Files

- `contracts/*.sol`: Solidity smart contracts defining game mechanics
- `src/App.jsx`: Main application structure and routing
- `src/Web3Provider.jsx`: Blockchain connection configuration
- `src/styles/constants/*.js`: Design system constants for consistency
- `src/components/effects/*.jsx`: Environmental effects components
- `src/components/onboarding/*.jsx`: Onboarding tutorial components

## Development Workflow

### Setting Up the Development Environment

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/monad-deployer.git
   cd monad-deployer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Access the application at http://localhost:5173

### Branch Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: Individual feature branches
- `bugfix/*`: Bug fix branches
- `release/*`: Release preparation branches

### Code Style Guidelines

1. **Component Structure**
   - One component per file
   - Use functional components with hooks
   - Follow naming convention: `ComponentName.jsx` and `ComponentName.css`

2. **State Management**
   - Use React Context for global state
   - Keep component state localized
   - Use reducers for complex state logic

3. **CSS Methodology**
   - Component-scoped CSS files
   - Use consistent naming convention
   - Apply design system constants

## Smart Contract Integration

### Contract Addresses

The application connects to the following smart contracts on the Monad testnet:

- PlayerRegistry: `0x...` (Update with actual address)
- CropsToken: `0x...` (Update with actual address)
- FarmManager: `0x...` (Update with actual address)
- ShopManager: `0x...` (Update with actual address)
- Leaderboard: `0x...` (Update with actual address)

### Updating Contract ABIs

When modifying smart contracts:

1. Compile the updated contracts
2. Copy the new ABIs to `contracts/abis/`
3. Update the contract addresses in the application if necessary

### Contract Interaction Pattern

The recommended pattern for contract interactions:

```jsx
import { useContract, useContractRead, useContractWrite } from 'wagmi';
import { contractAbi } from '../contracts/abis/contract-abi.json';

// Hook pattern
const useContractData = () => {
  const contractAddress = '0x...';
  
  const { data: contract } = useContract({
    address: contractAddress,
    abi: contractAbi,
  });
  
  const { data, isLoading } = useContractRead({
    contract,
    functionName: 'getData',
    args: [],
  });
  
  const { writeAsync, isLoading: isWriting } = useContractWrite({
    contract,
    functionName: 'updateData',
  });
  
  const updateData = async (newData) => {
    try {
      const tx = await writeAsync({ args: [newData] });
      return tx.wait();
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };
  
  return {
    data,
    isLoading,
    updateData,
    isWriting,
  };
};
```

## UI Updates

### Adding New Components

1. Create the component file in the appropriate directory
2. Import design system constants
3. Implement the component following the existing patterns
4. Add the component to the index file if applicable
5. Update the documentation if necessary

### Modifying Existing Components

1. Review the component's usage and dependencies
2. Make changes while maintaining the component's API
3. Update tests if applicable
4. Document changes if significant

### Adding Visual Effects

1. Create the effect component in the `components/effects/` directory
2. Use the animation constants from the design system
3. Implement performance optimizations
4. Add the effect to the appropriate parent component

## Performance Optimization

### Rendering Optimization

1. **Component Memoization**
   ```jsx
   import React, { memo } from 'react';
   
   const OptimizedComponent = memo(({ prop1, prop2 }) => {
     // Component implementation
   });
   ```

2. **List Virtualization**
   For long lists like the leaderboard, use:
   ```jsx
   import { FixedSizeList } from 'react-window';
   
   const VirtualizedList = ({ items }) => (
     <FixedSizeList
       height={500}
       width="100%"
       itemCount={items.length}
       itemSize={50}
     >
       {({ index, style }) => (
         <div style={style}>
           {items[index].name}
         </div>
       )}
     </FixedSizeList>
   );
   ```

3. **Lazy Loading**
   ```jsx
   import React, { lazy, Suspense } from 'react';
   
   const LazyComponent = lazy(() => import('./HeavyComponent'));
   
   const ParentComponent = () => (
     <Suspense fallback={<div>Loading...</div>}>
       <LazyComponent />
     </Suspense>
   );
   ```

### Asset Optimization

1. **Progressive Loading**
   Use the `ProgressiveLoader` utility:
   ```jsx
   import ProgressiveLoader from '../utils/progressiveLoader';
   
   const loader = new ProgressiveLoader();
   
   loader
     .add('image1', ProgressiveLoader.loaders.image('/path/to/image.webp'))
     .add('font1', ProgressiveLoader.loaders.font('CustomFont', '/path/to/font.woff2'))
     .onProgress(progress => {
       console.log(`Loading: ${progress.percent}%`);
     })
     .onComplete(result => {
       console.log('All resources loaded');
     })
     .start();
   ```

2. **Image Format**
   - Use WebP format with fallbacks
   - Implement responsive images for different screen sizes
   - Lazy load off-screen images

## Testing

### Manual Testing Checklist

Before submitting pull requests, verify:

1. **Wallet Connection**
   - Connect with MetaMask/Rabby
   - Connect with different accounts
   - Disconnect and reconnect

2. **Player Registration**
   - Register new player
   - View profile information
   - Update nickname

3. **Farming Actions**
   - Plant seeds
   - Water crops
   - Harvest mature crops
   - Use fertilizer

4. **Shop Functions**
   - Buy seeds
   - Buy water buckets
   - Buy fertilizer
   - Buy tiles

5. **Leaderboard**
   - View top players
   - Check player rank
   - Verify point calculation

6. **Responsive Design**
   - Test on mobile (< 576px)
   - Test on tablet (576px - 992px)
   - Test on desktop (> 992px)

7. **Performance**
   - Check loading times
   - Verify animation smoothness
   - Test with network throttling

## Deployment

### Development Environment

Deploy to the development environment:

```bash
npm run build:dev
# Deploy to development server
```

### Production Environment

Deploy to the production environment:

```bash
npm run build
# Deploy to production server
```

### Contract Deployment

For contract updates:

1. Deploy new contracts to the Monad testnet
2. Update ABIs in the repository
3. Update contract addresses in the application
4. Test thoroughly before releasing

## Troubleshooting

### Common Issues

1. **Wallet Connection Issues**
   - Verify Monad testnet configuration
   - Check for network changes
   - Verify RPC URL availability

2. **Transaction Failures**
   - Check for sufficient MONAD tokens
   - Verify contract function parameters
   - Check transaction logs for errors

3. **UI Rendering Issues**
   - Clear browser cache
   - Check for CSS conflicts
   - Verify responsive breakpoints

### Debug Tools

- Browser Developer Tools
- React Developer Tools
- Monad Testnet Explorer

## Future Roadmap

### Planned Features

1. **Phase 5 Completion**
   - ✅ Visual Polish & Consistency
   - ✅ Performance Optimization
   - ✅ User Testing & Launch Preparation
   - ✅ Documentation & Handoff

2. **Future Enhancements**
   - Multi-player interactions
   - Seasonal events
   - Achievements system expansion
   - Marketplace for trading

### Maintenance Schedule

- Weekly dependency updates
- Monthly performance audits
- Quarterly feature releases
