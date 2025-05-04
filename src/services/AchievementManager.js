class AchievementManager {
  constructor() {
    this.achievements = [
      {
        id: 'first_plant',
        name: 'Green Thumb Initiate',
        description: 'Plant your first crop',
        category: 'farming',
        points: 10,
        condition: (stats) => stats.plantsPlanted >= 1
      },
      {
        id: 'first_harvest',
        name: 'First Harvest',
        description: 'Successfully harvest your first crop',
        category: 'harvesting',
        points: 15,
        condition: (stats) => stats.cropsHarvested >= 1
      },
      {
        id: 'potato_master',
        name: 'Potato Master',
        description: 'Harvest 10 potato crops',
        category: 'farming',
        points: 20,
        condition: (stats) => stats.potatoesHarvested >= 10
      },
      {
        id: 'tomato_master',
        name: 'Tomato Master',
        description: 'Harvest 10 tomato crops',
        category: 'farming',
        points: 20,
        condition: (stats) => stats.tomatoesHarvested >= 10
      },
      {
        id: 'strawberry_master',
        name: 'Strawberry Master',
        description: 'Harvest 10 strawberry crops',
        category: 'farming',
        points: 20,
        condition: (stats) => stats.strawberriesHarvested >= 10
      },
      {
        id: 'farm_expander',
        name: 'Farm Expander',
        description: 'Own 10 farm tiles',
        category: 'economy',
        points: 25,
        condition: (stats) => stats.tilesOwned >= 10
      },
      {
        id: 'crop_millionaire',
        name: 'Crop Millionaire',
        description: 'Earn 1000 CROPS tokens',
        category: 'economy',
        points: 50,
        condition: (stats) => stats.totalTokensEarned >= 1000
      },
      {
        id: 'daily_streak',
        name: 'Consistent Farmer',
        description: 'Log in for 5 consecutive days',
        category: 'social',
        points: 30,
        condition: (stats) => stats.loginStreak >= 5
      },
      {
        id: 'fertilizer_enthusiast',
        name: 'Fertilizer Enthusiast',
        description: 'Use fertilizer 10 times',
        category: 'farming',
        points: 15,
        condition: (stats) => stats.fertilizerUsed >= 10
      },
      {
        id: 'hydration_expert',
        name: 'Hydration Expert',
        description: 'Water 20 crops',
        category: 'farming',
        points: 15,
        condition: (stats) => stats.waterBucketsUsed >= 20
      },
      {
        id: 'diverse_farmer',
        name: 'Diverse Farmer',
        description: 'Grow all types of crops',
        category: 'farming',
        points: 25,
        condition: (stats) => 
          stats.potatoesHarvested > 0 && 
          stats.tomatoesHarvested > 0 && 
          stats.strawberriesHarvested > 0
      },
      {
        id: 'leaderboard_climber',
        name: 'Leaderboard Climber',
        description: 'Reach top 10 on the leaderboard',
        category: 'social',
        points: 50,
        condition: (stats) => stats.leaderboardRank <= 10 && stats.leaderboardRank > 0
      }
    ];
    
    // Load unlocked achievements from localStorage
    this.unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements') || '[]');
  }
  
  // Check for newly unlocked achievements
  checkAchievements(stats) {
    const newlyUnlocked = [];
    
    this.achievements.forEach(achievement => {
      if (
        !this.unlockedAchievements.includes(achievement.id) && 
        achievement.condition(stats)
      ) {
        this.unlockedAchievements.push(achievement.id);
        newlyUnlocked.push(achievement);
      }
    });
    
    // Save to localStorage
    localStorage.setItem('unlockedAchievements', JSON.stringify(this.unlockedAchievements));
    
    return newlyUnlocked;
  }
  
  // Get all achievements with unlocked status
  getAllAchievements() {
    return this.achievements.map(achievement => ({
      ...achievement,
      unlocked: this.unlockedAchievements.includes(achievement.id)
    }));
  }
  
  // Get unlocked achievements
  getUnlockedAchievements() {
    return this.achievements.filter(achievement => 
      this.unlockedAchievements.includes(achievement.id)
    );
  }
  
  // Reset all achievements (for testing)
  resetAchievements() {
    this.unlockedAchievements = [];
    localStorage.setItem('unlockedAchievements', JSON.stringify(this.unlockedAchievements));
  }
}

export default new AchievementManager();