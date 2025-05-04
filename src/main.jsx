import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Web3Provider } from './Web3Provider';

// Import our design system styles
import './styles/designSystem.css';
import './styles/components.css';
import './styles/animations.css';
import './styles/notifications.css';
import './styles/sidebar.css';
import './styles/farmGrid.css';
import './styles/farmVisualizations.css';
import './styles/loadingScreen.css';

// Import Phase 3 styles
import './styles/common.css';
import './styles/farm.css';
import './styles/shop.css';
import './components/animations/animations.css';
import './components/notifications/notifications.css';
import './components/ui/ContextMenu.css';

// Import Phase 4 styles
import './styles/profile.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </React.StrictMode>,
);