import React, { useState, useEffect } from 'react';
import { useProgress } from '../../context/ProgressContext';

// Achievement categories with icons and colors
const CATEGORIES = {
  farming: {
    icon: '🌱',
    name: 'Farming',
    color: '#4CAF50',
    lightColor: 'rgba(76, 175, 80, 0.2)'
  },
  harvesting: {
    icon: '🌾',
    name: 'Harvesting',
    color: '#FFC107',
    lightColor: 'rgba(255, 193, 7, 0.2)'
  },
  economy: {
    icon: '💰',
    name: 'Economy',
    color: '#F44336',
    lightColor: 'rgba(244, 67, 54, 0.2)'
  },
  social: {
    icon: '👥',
    name: 'Social',
    color: '#2196F3',
    lightColor: 'rgba(33, 150, 243, 0.2)'
  }
};

const AchievementGallery = () => {
  const { achievements, playerStats } = useProgress();
  const [filter, setFilter] = useState('all');
  const [showUnlocked, setShowUnlocked] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Calculate achievement counts
  const achievementCounts = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.unlocked).length,
    farming: achievements.filter(a => a.category === 'farming' && a.unlocked).length,
    harvesting: achievements.filter(a => a.category === 'harvesting' && a.unlocked).length,
    economy: achievements.filter(a => a.category === 'economy' && a.unlocked).length,
    social: achievements.filter(a => a.category === 'social' && a.unlocked).length
  };
  
  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    // Filter by category
    if (filter !== 'all' && achievement.category !== filter) {
      return false;
    }
    
    // Filter by unlocked status
    if (!showUnlocked && !achievement.unlocked) {
      return false;
    }
    
    return true;
  });
  
  // Calculate progress for a specific achievement
  const calculateProgress = (achievement) => {
    switch (achievement.id) {
      case 'first_plant':
        return Math.min(1, playerStats.plantsPlanted >= 1 ? 1 : 0);
      case 'first_harvest':
        return Math.min(1, playerStats.cropsHarvested >= 1 ? 1 : 0);
      case 'potato_master':
        return Math.min(1, playerStats.potatoesHarvested / 10);
      case 'tomato_master':
        return Math.min(1, playerStats.tomatoesHarvested / 10);
      case 'strawberry_master':
        return Math.min(1, playerStats.strawberriesHarvested / 10);
      case 'farm_expander':
        return Math.min(1, playerStats.tilesOwned / 10);
      case 'crop_millionaire':
        return Math.min(1, playerStats.totalTokensEarned / 1000);
      case 'daily_streak':
        return Math.min(1, playerStats.loginStreak / 5);
      case 'fertilizer_enthusiast':
        return Math.min(1, playerStats.fertilizerUsed / 10);
      case 'hydration_expert':
        return Math.min(1, playerStats.waterBucketsUsed / 20);
      case 'diverse_farmer':
        const cropTypes = [
          playerStats.potatoesHarvested > 0,
          playerStats.tomatoesHarvested > 0,
          playerStats.strawberriesHarvested > 0
        ].filter(Boolean).length;
        return Math.min(1, cropTypes / 3);
      case 'leaderboard_climber':
        return playerStats.leaderboardRank <= 10 && playerStats.leaderboardRank > 0 ? 1 : 0;
      default:
        return 0;
    }
  };
  
  // Trigger achievement unlock animation
  const showUnlockAnimation = (achievement) => {
    setSelectedAchievement(achievement);
    setIsAnimating(true);
    
    // End animation after 3 seconds
    setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
  };
  
  return (
    <div className="achievement-gallery">
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
          <span>🏆</span> Achievement Gallery
        </h3>
        
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          padding: '0.25rem 0.75rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ color: 'rgba(255,255,255,0.7)' }}>Progress:</span>
          <span style={{ fontWeight: 'bold', color: '#F7B538' }}>
            {achievementCounts.unlocked}/{achievementCounts.total}
          </span>
          <div style={{
            width: '60px',
            height: '8px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginLeft: '0.5rem'
          }}>
            <div style={{
              height: '100%',
              width: `${(achievementCounts.unlocked / achievementCounts.total) * 100}%`,
              background: '#F7B538',
              borderRadius: '4px',
              transition: 'width 1s ease-out'
            }}></div>
          </div>
        </div>
      </div>
      
      {/* Category filters */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <button
          style={{
            background: filter === 'all' ? '#8358FF' : 'rgba(131, 88, 255, 0.2)',
            color: filter === 'all' ? 'white' : 'rgba(255, 255, 255, 0.7)',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onClick={() => setFilter('all')}
        >
          <span>🏆</span> All
        </button>
        
        {Object.entries(CATEGORIES).map(([key, category]) => (
          <button
            key={key}
            style={{
              background: filter === key ? category.color : category.lightColor,
              color: filter === key ? 'white' : 'rgba(255, 255, 255, 0.7)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={() => setFilter(key)}
          >
            <span>{category.icon}</span> 
            {category.name} 
            <span style={{
              marginLeft: '0.25rem',
              fontSize: '0.8rem',
              background: 'rgba(255,255,255,0.2)',
              padding: '0.1rem 0.4rem',
              borderRadius: '8px'
            }}>
              {achievementCounts[key] || 0}
            </span>
          </button>
        ))}
        
        <div style={{ marginLeft: 'auto' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input 
              type="checkbox"
              checked={showUnlocked}
              onChange={() => setShowUnlocked(!showUnlocked)}
              style={{ accentColor: '#8358FF' }}
            />
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Show Locked</span>
          </label>
        </div>
      </div>
      
      {/* Achievement cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        {filteredAchievements.map(achievement => {
          const progress = calculateProgress(achievement);
          const category = CATEGORIES[achievement.category];
          
          return (
            <div
              key={achievement.id}
              style={{
                background: achievement.unlocked ? 
                  `linear-gradient(135deg, ${category.lightColor}, rgba(42, 29, 72, 0.8))` : 
                  'rgba(255,255,255,0.05)',
                borderRadius: '12px',
                padding: '1rem',
                position: 'relative',
                overflow: 'hidden',
                border: achievement.unlocked ? 
                  `1px solid ${category.color}` : 
                  '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={() => achievement.unlocked && showUnlockAnimation(achievement)}
            >
              {achievement.unlocked && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: category.color,
                  color: 'white',
                  fontSize: '0.7rem',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontWeight: 'bold'
                }}>
                  UNLOCKED
                </div>
              )}
              
              <div style={{
                fontSize: '2rem',
                marginBottom: '0.75rem',
                color: achievement.unlocked ? category.color : 'rgba(255,255,255,0.3)'
              }}>
                {category.icon}
              </div>
              
              <h4 style={{
                margin: '0 0 0.5rem 0',
                fontSize: '1.1rem',
                color: achievement.unlocked ? 'white' : 'rgba(255,255,255,0.5)'
              }}>
                {achievement.name}
              </h4>
              
              <p style={{
                margin: '0 0 1rem 0',
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.6)',
                flex: 1
              }}>
                {achievement.description}
              </p>
              
              <div style={{
                marginTop: 'auto'
              }}>
                <div style={{
                  height: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${progress * 100}%`,
                    background: category.color,
                    borderRadius: '3px',
                    transition: 'width 1s ease-out'
                  }}></div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.5)'
                }}>
                  <div>Progress</div>
                  <div>{Math.round(progress * 100)}%</div>
                </div>
              </div>
              
              {/* Glowing effect for unlocked achievements */}
              {achievement.unlocked && (
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `radial-gradient(ellipse at center, ${category.color}10 0%, transparent 60%)`,
                  pointerEvents: 'none'
                }}></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Achievement unlock animation overlay */}
      {isAnimating && selectedAchievement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <div style={{
            background: `linear-gradient(135deg, #2A1D48, ${CATEGORIES[selectedAchievement.category].color}50)`,
            padding: '2rem',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '80%',
            border: `2px solid ${CATEGORIES[selectedAchievement.category].color}`,
            boxShadow: `0 0 30px ${CATEGORIES[selectedAchievement.category].color}80`,
            animation: 'scaleIn 0.5s ease-out, pulse 2s infinite'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              animation: 'bounce 1s ease-out infinite alternate'
            }}>
              {CATEGORIES[selectedAchievement.category].icon}
            </div>
            
            <h3 style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.5rem',
              color: CATEGORIES[selectedAchievement.category].color
            }}>
              Achievement Unlocked!
            </h3>
            
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '2rem',
              color: 'white'
            }}>
              {selectedAchievement.name}
            </h4>
            
            <p style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.1rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              {selectedAchievement.description}
            </p>
            
            <div style={{
              fontSize: '1.1rem',
              color: '#F7B538',
              fontWeight: 'bold'
            }}>
              +{selectedAchievement.points} Points
            </div>
            
            {/* Particle effects */}
            <div className="particles" style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}>
              {Array.from({ length: 50 }).map((_, i) => (
                <div 
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: CATEGORIES[selectedAchievement.category].color,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.7 + 0.3,
                    animation: `particle ${Math.random() * 3 + 2}s linear infinite`
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 30px ${selectedAchievement ? CATEGORIES[selectedAchievement.category].color + '50' : 'rgba(131, 88, 255, 0.3)'}; }
          50% { box-shadow: 0 0 50px ${selectedAchievement ? CATEGORIES[selectedAchievement.category].color + '80' : 'rgba(131, 88, 255, 0.5)'}; }
          100% { box-shadow: 0 0 30px ${selectedAchievement ? CATEGORIES[selectedAchievement.category].color + '50' : 'rgba(131, 88, 255, 0.3)'}; }
        }
        
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }
        
        @keyframes particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(${() => (Math.random() * 200 - 100)}px, ${() => (Math.random() * -200 - 50)}px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementGallery;