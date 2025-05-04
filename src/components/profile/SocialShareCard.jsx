import React, { useState, useRef, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';

// Background pattern SVG for share cards
const CardBackgroundPattern = ({ color }) => {
  return (
    <svg width="100%" height="100%" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        opacity: 0.1, 
        pointerEvents: 'none',
        zIndex: 0
      }}
    >
      <defs>
        <pattern id="farmPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 L40 20" stroke={color} strokeWidth="1" />
          <path d="M20 0 L20 40" stroke={color} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#farmPattern)" />
    </svg>
  );
};

const SocialShareCard = () => {
  const { playerStats } = useProgress();
  const [selectedTemplate, setSelectedTemplate] = useState('achievements');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);
  
  // Create visual data for share cards
  const achievementData = {
    totalUnlocked: playerStats?.achievements?.filter(a => a.unlocked)?.length || 0,
    totalAchievements: playerStats?.achievements?.length || 12,
    favoriteAchievement: 'Master Harvester',
    recentAchievement: 'Green Thumb'
  };
  
  const farmingData = {
    tilesOwned: playerStats?.tilesOwned || 0,
    cropsHarvested: playerStats?.cropsHarvested || 0,
    totalEarnings: playerStats?.totalTokensEarned || 0,
    farmingLevel: Math.floor((playerStats?.totalPoints || 0) / 100) + 1
  };
  
  const leaderboardData = {
    rank: playerStats?.leaderboardRank || '25th',
    points: playerStats?.totalPoints || 0,
    pointsNextRank: (playerStats?.totalPoints || 0) + 50
  };
  
  // Function to copy the card as an image
  const copyCardAsImage = async () => {
    if (!cardRef.current) return;
    
    try {
      // This is a placeholder - in a real app, this would use html2canvas or similar
      // to create a shareable image from the card
      console.log('Copying card as image');
      
      // Simulate copying success
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying card:', error);
    }
  };
  
  // Function to get mock share URL
  const getShareUrl = () => {
    const baseUrl = 'https://monafarms.monad.xyz/share/';
    const playerId = '0x12345...abcde'; // Mocked player ID (would be real wallet address)
    
    return `${baseUrl}${playerId}/${selectedTemplate}`;
  };
  
  return (
    <div style={{
      marginBottom: '2rem'
    }}>
      <h3 style={{
        margin: '0 0 1.5rem 0',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#F7B538',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>🌐</span> Share Your Farm
      </h3>
      
      {/* Template selector */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        overflow: 'auto',
        padding: '0.5rem 0'
      }}>
        <button 
          style={{
            background: selectedTemplate === 'achievements' ? '#8358FF' : 'rgba(131, 88, 255, 0.2)',
            color: selectedTemplate === 'achievements' ? 'white' : 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0
          }}
          onClick={() => setSelectedTemplate('achievements')}
        >
          <span>🏆</span> Achievements
        </button>
        
        <button 
          style={{
            background: selectedTemplate === 'farming' ? '#4CAF50' : 'rgba(76, 175, 80, 0.2)',
            color: selectedTemplate === 'farming' ? 'white' : 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0
          }}
          onClick={() => setSelectedTemplate('farming')}
        >
          <span>🌱</span> Farming Stats
        </button>
        
        <button 
          style={{
            background: selectedTemplate === 'leaderboard' ? '#F44336' : 'rgba(244, 67, 54, 0.2)',
            color: selectedTemplate === 'leaderboard' ? 'white' : 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexShrink: 0
          }}
          onClick={() => setSelectedTemplate('leaderboard')}
        >
          <span>🏅</span> Leaderboard
        </button>
      </div>
      
      {/* Share card preview */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div 
          ref={cardRef}
          style={{
            width: '100%',
            maxWidth: '500px',
            background: selectedTemplate === 'achievements' ? 
              'linear-gradient(135deg, #2A1D48, #523D7F)' : 
              selectedTemplate === 'farming' ? 
              'linear-gradient(135deg, #1B5E20, #388E3C)' :
              'linear-gradient(135deg, #B71C1C, #E53935)',
            borderRadius: '16px',
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
          }}
        >
          {/* Background pattern */}
          <CardBackgroundPattern 
            color={selectedTemplate === 'achievements' ? 
              '#8358FF' : 
              selectedTemplate === 'farming' ? 
              '#4CAF50' :
              '#F44336'
            } 
          />
          
          {/* Top section with logo and QR code */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>🌾</div>
              <div style={{
                fontWeight: 'bold',
                fontSize: '1.25rem',
                color: 'white'
              }}>MonaFarms</div>
            </div>
            
            {/* Mock QR code */}
            <div style={{
              width: '60px',
              height: '60px',
              background: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              color: '#1E1633',
              textAlign: 'center',
              fontWeight: 'bold',
              padding: '0.25rem'
            }}>
              SCAN<br/>TO<br/>VISIT
            </div>
          </div>
          
          {/* Content based on template */}
          {selectedTemplate === 'achievements' && (
            <div style={{
              position: 'relative',
              zIndex: 1
            }}>
              <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.5rem',
                color: 'white',
                textAlign: 'center'
              }}>
                Achievement Showcase
              </h4>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    fontSize: '0.9rem',
                    color: 'rgba(255,255,255,0.7)'
                  }}>Achievements Unlocked:</div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#F7B538'
                  }}>{achievementData.totalUnlocked}/{achievementData.totalAchievements}</div>
                </div>
                
                <div style={{
                  height: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(achievementData.totalUnlocked / achievementData.totalAchievements) * 100}%`,
                    background: '#F7B538',
                    borderRadius: '4px'
                  }}></div>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {['🏆', '🥇', '🌱', '🌾', '💰'].map((emoji, index) => (
                    <div 
                      key={index}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: index < achievementData.totalUnlocked ? 
                          'linear-gradient(135deg, #F7B538, #FFD54F)' : 
                          'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem'
                      }}
                    >
                      {emoji}
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                gap: '1rem'
              }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>⭐</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '0.25rem'
                  }}>Favorite Achievement</div>
                  <div style={{
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>{achievementData.favoriteAchievement}</div>
                </div>
                
                <div style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.5rem'
                  }}>✨</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '0.25rem'
                  }}>Recent Achievement</div>
                  <div style={{
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>{achievementData.recentAchievement}</div>
                </div>
              </div>
            </div>
          )}
          
          {selectedTemplate === 'farming' && (
            <div style={{
              position: 'relative',
              zIndex: 1
            }}>
              <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.5rem',
                color: 'white',
                textAlign: 'center'
              }}>
                Farming Progress
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.25rem'
                  }}>🧑‍🌾</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '0.25rem'
                  }}>Farming Level</div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#F7B538'
                  }}>{farmingData.farmingLevel}</div>
                </div>
                
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '2rem',
                    marginBottom: '0.25rem'
                  }}>🏞️</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '0.25rem'
                  }}>Farm Size</div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#F7B538'
                  }}>{farmingData.tilesOwned} Tiles</div>
                </div>
              </div>
              
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>🌾</span>
                    <span>Total Harvests</span>
                  </div>
                  <div style={{
                    fontWeight: 'bold'
                  }}>{farmingData.cropsHarvested}</div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>💰</span>
                    <span>CROPS Earned</span>
                  </div>
                  <div style={{
                    fontWeight: 'bold',
                    color: '#F7B538'
                  }}>{farmingData.totalEarnings}</div>
                </div>
              </div>
              
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center'
              }}>
                Join me on MonaFarms and start your own farm on Monad!
              </div>
            </div>
          )}
          
          {selectedTemplate === 'leaderboard' && (
            <div style={{
              position: 'relative',
              zIndex: 1
            }}>
              <h4 style={{
                margin: '0 0 1rem 0',
                fontSize: '1.5rem',
                color: 'white',
                textAlign: 'center'
              }}>
                Leaderboard Stats
              </h4>
              
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{
                  fontSize: '4rem',
                  marginBottom: '0.25rem',
                  color: '#F7B538'
                }}>
                  {/* Trophy emoji for top 10, medal for top 50, otherwise star */}
                  {typeof leaderboardData.rank === 'number' ?
                    (leaderboardData.rank <= 3 ? '🏆' : 
                     leaderboardData.rank <= 10 ? '🥇' : 
                     leaderboardData.rank <= 50 ? '🥈' : '⭐') :
                    '⭐'
                  }
                </div>
                
                <div style={{
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: '0.5rem'
                }}>Current Rank</div>
                
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 'bold',
                  color: '#F7B538'
                }}>{leaderboardData.rank}</div>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '1.75rem',
                    marginBottom: '0.25rem'
                  }}>🏅</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '0.25rem'
                  }}>Total Points</div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>{leaderboardData.points}</div>
                </div>
                
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{
                    fontSize: '1.75rem',
                    marginBottom: '0.25rem'
                  }}>🔼</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: '0.25rem'
                  }}>Next Rank</div>
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold'
                  }}>{leaderboardData.pointsNextRank} pts</div>
                </div>
              </div>
              
              <div style={{
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center'
              }}>
                Can you beat me on the MonaFarms leaderboard?
              </div>
            </div>
          )}
          
          {/* Footer with URL and date */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '0.8rem',
            position: 'relative',
            zIndex: 1
          }}>
            <div>monafarms.monad.xyz</div>
            <div>{new Date().toLocaleDateString()}</div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem'
        }}>
          <button
            style={{
              background: '#8358FF',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={copyCardAsImage}
          >
            <span>{copied ? '✓' : '📷'}</span>
            {copied ? 'Copied!' : 'Copy Image'}
          </button>
          
          <button
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={() => {
              navigator.clipboard.writeText(getShareUrl());
              alert('Share URL copied to clipboard!');
            }}
          >
            <span>🔗</span>
            Copy Link
          </button>
        </div>
      </div>
      
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '1rem',
        fontSize: '0.9rem',
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center'
      }}>
        <p style={{
          margin: '0 0 0.5rem 0',
          fontWeight: 'bold',
          fontSize: '1rem',
          color: 'white'
        }}>
          <span style={{ marginRight: '0.5rem' }}>💡</span>
          Share Your Farm on Social Media
        </p>
        <p style={{ margin: '0' }}>
          Customize your share card above, then use the buttons to copy the image or link to share with your friends!
        </p>
      </div>
    </div>
  );
};

export default SocialShareCard;