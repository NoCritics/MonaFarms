import React from 'react';
import { AchievementNotification } from './AchievementNotification';
import { useProgress } from '../../context/ProgressContext';
import './notifications.css';

const AchievementNotifications = () => {
  const { newAchievements, acknowledgeAchievement } = useProgress();
  
  if (newAchievements.length === 0) return null;
  
  return (
    <div className="notification-queue">
      {newAchievements.map((achievement) => (
        <AchievementNotification
          key={achievement.id}
          achievement={achievement}
          onClose={() => acknowledgeAchievement(achievement.id)}
        />
      ))}
    </div>
  );
};

export default AchievementNotifications;