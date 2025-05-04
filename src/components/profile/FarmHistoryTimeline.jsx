import React, { useState, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';

// Icons for different farming activities
const ActivityIcons = {
  PLANT: '🌱',
  WATER: '💧',
  HARVEST: '🌾',
  FERTILIZE: '🧪',
  PURCHASE: '🛒',
  ACHIEVEMENT: '🏆',
  LEVEL_UP: '⭐'
};

// Function to generate mock historical data (in a real app, this would come from blockchain events)
const generateMockHistory = (playerStats) => {
  const history = [];
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  
  // Add events for plants
  for (let i = 0; i < playerStats.plantsPlanted; i++) {
    history.push({
      id: `plant-${i}`,
      type: 'PLANT',
      description: 'Planted a new crop',
      timestamp: now - (Math.random() * 7 * day),
      details: {
        cropType: ['Potato', 'Tomato', 'Strawberry'][Math.floor(Math.random() * 3)]
      }
    });
  }
  
  // Add events for water
  for (let i = 0; i < playerStats.waterBucketsUsed; i++) {
    history.push({
      id: `water-${i}`,
      type: 'WATER',
      description: 'Watered a crop',
      timestamp: now - (Math.random() * 7 * day),
      details: {
        tileNumber: Math.floor(Math.random() * playerStats.tilesOwned) + 1
      }
    });
  }
  
  // Add events for harvests
  for (let i = 0; i < playerStats.cropsHarvested; i++) {
    const cropTypes = ['Potato', 'Tomato', 'Strawberry'];
    const cropType = cropTypes[Math.floor(Math.random() * 3)];
    const cropYield = {
      'Potato': Math.floor(Math.random() * 20) + 30,
      'Tomato': Math.floor(Math.random() * 30) + 40,
      'Strawberry': Math.floor(Math.random() * 40) + 50
    }[cropType];
    
    history.push({
      id: `harvest-${i}`,
      type: 'HARVEST',
      description: `Harvested ${cropType}`,
      timestamp: now - (Math.random() * 7 * day),
      details: {
        cropType,
        yield: cropYield,
        tokens: cropYield
      }
    });
  }
  
  // Add events for fertilizer
  for (let i = 0; i < playerStats.fertilizerUsed; i++) {
    history.push({
      id: `fertilize-${i}`,
      type: 'FERTILIZE',
      description: 'Used fertilizer',
      timestamp: now - (Math.random() * 7 * day),
      details: {
        tileNumber: Math.floor(Math.random() * playerStats.tilesOwned) + 1
      }
    });
  }
  
  // Add purchase events (tiles)
  for (let i = 0; i < playerStats.tilesOwned - 3; i++) {
    history.push({
      id: `purchase-tile-${i}`,
      type: 'PURCHASE',
      description: 'Purchased new farm tile',
      timestamp: now - (Math.random() * 14 * day),
      details: {
        item: 'Farm Tile',
        price: 250
      }
    });
  }
  
  // Add achievement unlocks
  const unlockedAchievements = localStorage.getItem('unlockedAchievements');
  if (unlockedAchievements) {
    const achievements = JSON.parse(unlockedAchievements);
    achievements.forEach((achievementId, index) => {
      history.push({
        id: `achievement-${achievementId}`,
        type: 'ACHIEVEMENT',
        description: 'Achievement unlocked',
        timestamp: now - (Math.random() * 10 * day),
        details: {
          achievementId,
          name: ['Green Thumb Initiate', 'First Harvest', 'Potato Master', 'Tomato Master', 'Farm Expander'][index % 5]
        }
      });
    });
  }
  
  // Sort by timestamp (newest first)
  history.sort((a, b) => b.timestamp - a.timestamp);
  
  return history;
};

const FarmHistoryTimeline = () => {
  const { playerStats } = useProgress();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [isExpanded, setIsExpanded] = useState({});
  
  useEffect(() => {
    // In a real app, this would fetch events from the blockchain
    const mockHistory = generateMockHistory(playerStats);
    setHistory(mockHistory);
  }, [playerStats]);
  
  const toggleExpand = (id) => {
    setIsExpanded(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  const filterHistory = (events) => {
    if (filter === 'ALL') return events;
    return events.filter(event => event.type === filter);
  };
  
  return (
    <div className="farm-history-timeline">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          margin: '0',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#F7B538',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>📜</span> Farm History
        </h3>
        
        <div style={{
          display: 'flex',
          gap: '0.5rem'
        }}>
          <button 
            style={{
              background: filter === 'ALL' ? '#8358FF' : 'rgba(131, 88, 255, 0.2)',
              color: filter === 'ALL' ? 'white' : 'rgba(255, 255, 255, 0.7)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
            onClick={() => setFilter('ALL')}
          >
            All
          </button>
          <button 
            style={{
              background: filter === 'PLANT' ? '#4CAF50' : 'rgba(76, 175, 80, 0.2)',
              color: filter === 'PLANT' ? 'white' : 'rgba(255, 255, 255, 0.7)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            onClick={() => setFilter('PLANT')}
          >
            <span>{ActivityIcons.PLANT}</span> Plants
          </button>
          <button 
            style={{
              background: filter === 'HARVEST' ? '#FFC107' : 'rgba(255, 193, 7, 0.2)',
              color: filter === 'HARVEST' ? 'white' : 'rgba(255, 255, 255, 0.7)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            onClick={() => setFilter('HARVEST')}
          >
            <span>{ActivityIcons.HARVEST}</span> Harvests
          </button>
          <button 
            style={{
              background: filter === 'ACHIEVEMENT' ? '#9C27B0' : 'rgba(156, 39, 176, 0.2)',
              color: filter === 'ACHIEVEMENT' ? 'white' : 'rgba(255, 255, 255, 0.7)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
            onClick={() => setFilter('ACHIEVEMENT')}
          >
            <span>{ActivityIcons.ACHIEVEMENT}</span> Achievements
          </button>
        </div>
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '12px',
        padding: '1rem',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {filterHistory(history).length > 0 ? (
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            position: 'relative'
          }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '30px',
              bottom: '20px',
              width: '2px',
              background: 'rgba(255, 255, 255, 0.1)',
              zIndex: 1
            }}></div>
            
            {filterHistory(history).map((event, index) => (
              <li 
                key={event.id} 
                style={{
                  padding: '0.75rem 0',
                  position: 'relative',
                  paddingLeft: '50px',
                  marginBottom: '0.5rem',
                  zIndex: 2
                }}
              >
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute',
                  left: '14px',
                  top: '20px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  background: (() => {
                    switch(event.type) {
                      case 'PLANT': return '#4CAF50';
                      case 'WATER': return '#2196F3';
                      case 'HARVEST': return '#FFC107';
                      case 'FERTILIZE': return '#9C27B0';
                      case 'PURCHASE': return '#F44336';
                      case 'ACHIEVEMENT': return '#8358FF';
                      case 'LEVEL_UP': return '#F7B538';
                      default: return '#8358FF';
                    }
                  })(),
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  zIndex: 2
                }}></div>
                
                {/* Event content */}
                <div 
                  style={{
                    background: (() => {
                      switch(event.type) {
                        case 'PLANT': return 'rgba(76, 175, 80, 0.1)';
                        case 'WATER': return 'rgba(33, 150, 243, 0.1)';
                        case 'HARVEST': return 'rgba(255, 193, 7, 0.1)';
                        case 'FERTILIZE': return 'rgba(156, 39, 176, 0.1)';
                        case 'PURCHASE': return 'rgba(244, 67, 54, 0.1)';
                        case 'ACHIEVEMENT': return 'rgba(131, 88, 255, 0.1)';
                        case 'LEVEL_UP': return 'rgba(247, 181, 56, 0.1)';
                        default: return 'rgba(255, 255, 255, 0.05)';
                      }
                    })(),
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: (() => {
                      switch(event.type) {
                        case 'PLANT': return '1px solid rgba(76, 175, 80, 0.3)';
                        case 'WATER': return '1px solid rgba(33, 150, 243, 0.3)';
                        case 'HARVEST': return '1px solid rgba(255, 193, 7, 0.3)';
                        case 'FERTILIZE': return '1px solid rgba(156, 39, 176, 0.3)';
                        case 'PURCHASE': return '1px solid rgba(244, 67, 54, 0.3)';
                        case 'ACHIEVEMENT': return '1px solid rgba(131, 88, 255, 0.3)';
                        case 'LEVEL_UP': return '1px solid rgba(247, 181, 56, 0.3)';
                        default: return '1px solid rgba(255, 255, 255, 0.1)';
                      }
                    })(),
                  }}
                  onClick={() => toggleExpand(event.id)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <span style={{
                        fontSize: '1.25rem'
                      }}>{ActivityIcons[event.type]}</span>
                      <span style={{
                        fontWeight: 'bold',
                        color: (() => {
                          switch(event.type) {
                            case 'PLANT': return '#4CAF50';
                            case 'WATER': return '#2196F3';
                            case 'HARVEST': return '#FFC107';
                            case 'FERTILIZE': return '#9C27B0';
                            case 'PURCHASE': return '#F44336';
                            case 'ACHIEVEMENT': return '#8358FF';
                            case 'LEVEL_UP': return '#F7B538';
                            default: return 'white';
                          }
                        })()
                      }}>{event.description}</span>
                    </div>
                    
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.6)'
                    }}>{formatDate(event.timestamp)}</div>
                  </div>
                  
                  {/* Expanded details */}
                  {isExpanded[event.id] && (
                    <div style={{
                      marginTop: '0.75rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      {event.type === 'PLANT' && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <div>Crop Type:</div>
                          <div style={{ fontWeight: 'bold' }}>{event.details.cropType}</div>
                        </div>
                      )}
                      
                      {event.type === 'WATER' && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <div>Tile Number:</div>
                          <div style={{ fontWeight: 'bold' }}>{event.details.tileNumber}</div>
                        </div>
                      )}
                      
                      {event.type === 'HARVEST' && (
                        <>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}>
                            <div>Crop Type:</div>
                            <div style={{ fontWeight: 'bold' }}>{event.details.cropType}</div>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <div>CROPS Earned:</div>
                            <div style={{ fontWeight: 'bold', color: '#F7B538' }}>{event.details.tokens}</div>
                          </div>
                        </>
                      )}
                      
                      {event.type === 'FERTILIZE' && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <div>Tile Number:</div>
                          <div style={{ fontWeight: 'bold' }}>{event.details.tileNumber}</div>
                        </div>
                      )}
                      
                      {event.type === 'PURCHASE' && (
                        <>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '0.5rem'
                          }}>
                            <div>Item:</div>
                            <div style={{ fontWeight: 'bold' }}>{event.details.item}</div>
                          </div>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                          }}>
                            <div>Price:</div>
                            <div style={{ fontWeight: 'bold', color: '#F7B538' }}>{event.details.price} CROPS</div>
                          </div>
                        </>
                      )}
                      
                      {event.type === 'ACHIEVEMENT' && (
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <div>Achievement:</div>
                          <div style={{ fontWeight: 'bold', color: '#8358FF' }}>{event.details.name}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            No farm history events to display.
          </div>
        )}
      </div>
    </div>
  );
};

export default FarmHistoryTimeline;