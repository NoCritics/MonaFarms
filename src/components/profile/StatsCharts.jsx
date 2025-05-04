import React from 'react';
import { useProgress } from '../../context/ProgressContext';

const StatsPieChart = ({ data, colors, title }) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate each slice's angle and create the segmented pie chart
  let cumulativeAngle = 0;
  
  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h4 style={{
        margin: '0 0 1rem 0',
        fontSize: '1.1rem',
        color: '#F7B538'
      }}>{title}</h4>
      
      <div style={{
        position: 'relative',
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        overflow: 'hidden',
        background: '#1E1633',
        marginBottom: '1rem'
      }}>
        {data.map((item, index) => {
          if (item.value === 0 || total === 0) return null;
          
          const angle = (item.value / total) * 360;
          const oldAngle = cumulativeAngle;
          cumulativeAngle += angle;
          
          // Create slice as conic gradient
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `conic-gradient(${colors[index]} ${oldAngle}deg, ${colors[index]} ${cumulativeAngle}deg, transparent ${cumulativeAngle}deg, transparent 360deg)`
              }}
            ></div>
          );
        })}
        
        {/* Center circle for donut chart */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: '#1E1633',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Total</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{total}</div>
        </div>
      </div>
      
      {/* Legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.5rem',
        width: '100%'
      }}>
        {data.map((item, index) => (
          <div 
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '3px',
              background: colors[index],
              flexShrink: 0
            }}></div>
            <div style={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.8)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {item.label} ({total === 0 ? 0 : Math.round((item.value / total) * 100)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsBarChart = ({ data, maxValue, title, color }) => {
  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px'
    }}>
      <h4 style={{
        margin: '0 0 1rem 0',
        fontSize: '1.1rem',
        color: '#F7B538'
      }}>{title}</h4>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        {data.map((item, index) => (
          <div key={index}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.25rem'
            }}>
              <div style={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.8)'
              }}>{item.label}</div>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>{item.value}</div>
            </div>
            
            <div style={{
              height: '10px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(item.value / maxValue) * 100}%`,
                background: typeof color === 'function' ? color(index) : color,
                borderRadius: '5px',
                transition: 'width 1s ease-out'
              }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsRadarChart = ({ data, maxValues, title }) => {
  const sides = data.length;
  const size = 120; // Radius of chart
  const centerX = size;
  const centerY = size;
  
  // Calculate coordinates for each data point
  const points = data.map((item, index) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2; // Start from top
    const normalizedValue = item.value / maxValues[index]; // 0 to 1
    const radius = normalizedValue * size;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      label: item.label,
      value: item.value
    };
  });
  
  // Create SVG path for the radar shape
  const path = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ') + ' Z'; // Z closes the path
  
  // Create paths for the background grid
  const gridLevels = 4; // Number of concentric shapes
  const gridPaths = Array.from({ length: gridLevels }).map((_, level) => {
    const ratio = (level + 1) / gridLevels;
    
    return Array.from({ length: sides }).map((_, index) => {
      const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
      const radius = ratio * size;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') + ' Z';
  });
  
  // Create paths for the axis lines
  const axisLines = Array.from({ length: sides }).map((_, index) => {
    const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
    const x = centerX + size * Math.cos(angle);
    const y = centerY + size * Math.sin(angle);
    
    return `M ${centerX} ${centerY} L ${x} ${y}`;
  });
  
  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h4 style={{
        margin: '0 0 1rem 0',
        fontSize: '1.1rem',
        color: '#F7B538'
      }}>{title}</h4>
      
      <div style={{
        position: 'relative',
        width: size * 2,
        height: size * 2,
        margin: '0 auto 1rem'
      }}>
        <svg width={size * 2} height={size * 2} viewBox={`0 0 ${size * 2} ${size * 2}`}>
          {/* Background grid */}
          {gridPaths.map((path, index) => (
            <path
              key={`grid-${index}`}
              d={path}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="1"
            />
          ))}
          
          {/* Axis lines */}
          {axisLines.map((line, index) => (
            <path
              key={`axis-${index}`}
              d={line}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          ))}
          
          {/* Radar shape */}
          <path
            d={path}
            fill="rgba(131, 88, 255, 0.2)"
            stroke="#8358FF"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#8358FF"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>
        
        {/* Axis labels */}
        {points.map((point, index) => {
          const angle = (Math.PI * 2 * index) / sides - Math.PI / 2;
          const labelRadius = size * 1.15; // Position labels outside the chart
          const x = centerX + labelRadius * Math.cos(angle);
          const y = centerY + labelRadius * Math.sin(angle);
          
          // Position text alignment based on which quadrant the label is in
          let textAnchor = 'middle';
          let dy = 0;
          
          if (angle < -Math.PI * 0.25) textAnchor = 'middle'; // top
          else if (angle < Math.PI * 0.25) textAnchor = 'start'; // right
          else if (angle < Math.PI * 0.75) textAnchor = 'middle'; // bottom
          else if (angle < Math.PI * 1.25) textAnchor = 'end'; // left
          else textAnchor = 'middle'; // top
          
          return (
            <div 
              key={`label-${index}`} 
              style={{
                position: 'absolute',
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                fontSize: '0.8rem',
                color: 'rgba(255,255,255,0.7)',
                textAlign: textAnchor === 'middle' ? 'center' : 
                          textAnchor === 'start' ? 'left' : 'right',
                width: '70px'
              }}
            >
              {point.label}
            </div>
          );
        })}
      </div>
      
      {/* Stats legend */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.5rem',
        width: '100%'
      }}>
        {data.map((item, index) => (
          <div 
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#8358FF',
              flexShrink: 0
            }}></div>
            <div style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: '0.9rem'
            }}>
              {item.label}: {item.value}/{maxValues[index]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsCharts = () => {
  const { playerStats } = useProgress();
  
  // Create data for harvest distribution chart
  const harvestData = [
    { label: 'Potatoes', value: playerStats?.potatoesHarvested || 0 },
    { label: 'Tomatoes', value: playerStats?.tomatoesHarvested || 0 },
    { label: 'Strawberries', value: playerStats?.strawberriesHarvested || 0 }
  ];
  
  // Create data for activity chart
  const activityData = [
    { label: 'Planting', value: playerStats?.plantsPlanted || 0 },
    { label: 'Watering', value: playerStats?.waterBucketsUsed || 0 },
    { label: 'Harvesting', value: playerStats?.cropsHarvested || 0 },
    { label: 'Fertilizing', value: playerStats?.fertilizerUsed || 0 }
  ];
  
  // Create data for earnings chart
  const tokenEarnings = playerStats?.totalTokensEarned || 0;
  const tokensSpent = (playerStats?.tilesOwned || 0) * 250; // 250 per tile
  const earningsData = [
    { label: 'Earned', value: tokenEarnings },
    { label: 'Spent', value: tokensSpent },
    { label: 'Balance', value: Math.max(0, tokenEarnings - tokensSpent) }
  ];
  
  // Create data for performance stats
  const performanceData = [
    { label: 'Speed', value: Math.min(10, ((playerStats?.cropsHarvested || 0) / 10) * 10) },
    { label: 'Efficiency', value: Math.min(10, ((playerStats?.cropsHarvested || 0) / (playerStats?.plantsPlanted || 1)) * 10) },
    { label: 'Consistency', value: Math.min(10, (playerStats?.loginStreak || 0)) },
    { label: 'Diversity', value: Math.min(10, ((
      Number(playerStats?.potatoesHarvested > 0) + 
      Number(playerStats?.tomatoesHarvested > 0) + 
      Number(playerStats?.strawberriesHarvested > 0)
    ) / 3) * 10) },
    { label: 'Expansion', value: Math.min(10, ((playerStats?.tilesOwned || 0) / 24) * 10) }
  ];

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h3 style={{
        margin: '0 0 1.5rem 0',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#F7B538',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <span>📊</span> Farming Analytics
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        {/* Harvest distribution chart */}
        <StatsPieChart 
          data={harvestData} 
          colors={['#4CAF50', '#F44336', '#FFC107']} 
          title="Harvest Distribution" 
        />
        
        {/* Activity breakdown */}
        <StatsBarChart 
          data={activityData} 
          maxValue={Math.max(...activityData.map(item => item.value), 10)} 
          title="Farming Activities" 
          color={(index) => ['#4CAF50', '#2196F3', '#FFC107', '#9C27B0'][index]}
        />
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Earnings chart */}
        <StatsBarChart 
          data={earningsData} 
          maxValue={Math.max(...earningsData.map(item => item.value), 100)} 
          title="CROPS Token Economy" 
          color={(index) => ['#F7B538', '#F44336', '#8358FF'][index]}
        />
        
        {/* Performance radar chart */}
        <StatsRadarChart 
          data={performanceData} 
          maxValues={[10, 10, 10, 10, 10]} 
          title="Farmer Performance" 
        />
      </div>
    </div>
  );
};

export default StatsCharts;