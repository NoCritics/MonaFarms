import React, { createContext, useContext, useState, useEffect } from 'react';
import AchievementManager from '../services/AchievementManager';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

export const ProgressProvider = ({ children }) => {
  const [playerStats, setPlayerStats] = useState({
    plantsPlanted: 0,
    cropsHarvested: 0,
    potatoesHarvested: 0,
    tomatoesHarvested: 0,
    strawberriesHarvested: 0,
    tilesOwned: 0,
    waterBucketsUsed: 0,
    fertilizerUsed: 0,
    totalTokensEarned: 0,
    loginStreak: 0,
    leaderboardRank: 0
  });
  
  const [newAchievements, setNewAchievements] = useState([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpRewards, setLevelUpRewards] = useState([]);
  
  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('playerStats');
    if (savedStats) {
      setPlayerStats(JSON.parse(savedStats));
    }
    
    // Check login streak
    const lastLogin = localStorage.getItem('lastLoginDate');
    const today = new Date().toDateString();
    
    if (lastLogin) {
      const lastDate = new Date(lastLogin);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate.toDateString() === yesterday.toDateString()) {
        // Consecutive login
        updateStats({ loginStreak: playerStats.loginStreak + 1 });
      } else if (lastDate.toDateString() !== today) {
        // Not consecutive and not already logged in today
        updateStats({ loginStreak: 1 });
      }
    } else {
      // First login ever
      updateStats({ loginStreak: 1 });
    }
    
    localStorage.setItem('lastLoginDate', today);
  }, []);
  
  // Save stats to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('playerStats', JSON.stringify(playerStats));
    
    // Check for newly unlocked achievements
    const unlocked = AchievementManager.checkAchievements(playerStats);
    if (unlocked.length > 0) {
      setNewAchievements(prev => [...prev, ...unlocked]);
    }
    
    // Check for level up (simplified level system based on total actions)
    const totalActions = 
      playerStats.plantsPlanted + 
      playerStats.cropsHarvested + 
      playerStats.waterBucketsUsed + 
      playerStats.fertilizerUsed;
    
    const previousLevel = Math.floor((totalActions - 1) / 10);
    const currentLevel = Math.floor(totalActions / 10);
    
    if (currentLevel > previousLevel && totalActions > 0) {
      // Level up!
      const rewards = [
        { icon: '💧', label: '+1 Water Bucket' },
        { icon: '💰', label: `+${currentLevel * 50} CROPS Tokens` }
      ];
      
      if (unlocked.length > 0) {
        rewards.push({ icon: '🏆', label: 'New Achievement Unlocked!' });
      }
      
      setLevelUpRewards(rewards);
      setShowLevelUp(true);
    }
    
  }, [playerStats]);
  
  const updateStats = (newStats) => {
    setPlayerStats(prevStats => ({
      ...prevStats,
      ...newStats
    }));
  };
  
  const acknowledgeAchievement = (achievementId) => {
    setNewAchievements(prev => prev.filter(a => a.id !== achievementId));
  };
  
  return (
    <ProgressContext.Provider 
      value={{ 
        playerStats, 
        updateStats, 
        newAchievements,
        acknowledgeAchievement,
        achievements: AchievementManager.getAllAchievements(),
        showLevelUp,
        levelUpRewards,
        dismissLevelUp: () => setShowLevelUp(false)
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};