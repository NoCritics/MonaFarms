import React, { useState } from 'react';
import './GuideComponent.css';

const GuideComponent = () => {
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
        { id: 'farming-basics', title: 'Farming Basics', icon: '🌱' },
        { id: 'crops-items', title: 'Crops & Items', icon: '🌾' },
        { id: 'achievements', title: 'Achievement System', icon: '🏆' },
        { id: 'shop-economy', title: 'Shop & Economy', icon: '💰' },
        { id: 'crafting', title: 'Crafting System', icon: '⚒️' },
        { id: 'upgrades', title: 'Farm Upgrades', icon: '⬆️' },
        { id: 'advanced', title: 'Advanced Mechanics', icon: '🎯' }
    ];

    const renderSection = () => {
        switch(activeSection) {
            case 'getting-started':
                return <GettingStartedSection />;
            case 'farming-basics':
                return <FarmingBasicsSection />;
            case 'crops-items':
                return <CropsItemsSection />;
            case 'achievements':
                return <AchievementsSection />;
            case 'shop-economy':
                return <ShopEconomySection />;
            case 'crafting':
                return <CraftingSection />;
            case 'upgrades':
                return <UpgradesSection />;
            case 'advanced':
                return <AdvancedSection />;
            default:
                return <GettingStartedSection />;
        }
    };

    return (
        <div className="guide-container">
            <div className="guide-header">
                <h1>MonaFarms Game Guide</h1>
                <p>Everything you need to know to become a master farmer!</p>
            </div>

            <div className="guide-content">
                <div className="guide-sidebar">
                    <h3>Table of Contents</h3>
                    {sections.map(section => (
                        <div
                            key={section.id}
                            className={`guide-section-link ${activeSection === section.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(section.id)}
                        >
                            <span className="section-icon">{section.icon}</span>
                            {section.title}
                        </div>
                    ))}
                </div>

                <div className="guide-main">
                    {renderSection()}
                </div>
            </div>
        </div>
    );
};

const GettingStartedSection = () => (
    <div className="guide-section">
        <h2>🚀 Getting Started</h2>
        
        <div className="info-box">
            <h3>Welcome to MonaFarms!</h3>
            <p>MonaFarms is a blockchain-based farming simulation game on the Monad testnet where you can grow crops, earn CROPS tokens, and compete with other farmers!</p>
        </div>

        <h3>First Steps</h3>
        <ol>
            <li><strong>Connect Your Wallet:</strong> Use the Connect button to link your Web3 wallet to the game.</li>
            <li><strong>Register as a Player:</strong> Create your farmer profile with a unique nickname.</li>
            <li><strong>Receive Starting Items:</strong> Upon registration, you'll receive:
                <ul>
                    <li>🪣 6 Water Buckets</li>
                    <li>💰 100 CROPS Tokens</li>
                    <li>🌱 1 Random Basic Seed (Potato, Tomato, or Strawberry)</li>
                    <li>🏞️ 3 Farm Tiles</li>
                </ul>
            </li>
            <li><strong>Plant Your First Crop:</strong> Go to the Farm tab and plant your seed!</li>
        </ol>

        <div className="tip-box">
            <strong>💡 Pro Tip:</strong> Claim your daily faucet of 50 CROPS tokens every 24 hours to keep growing!
        </div>
    </div>
);

const FarmingBasicsSection = () => (
    <div className="guide-section">
        <h2>🌱 Farming Basics</h2>
        
        <h3>The Farming Cycle</h3>
        <div className="farming-cycle">
            <div className="cycle-step">
                <div className="step-number">1</div>
                <h4>Plant</h4>
                <p>Select a seed from your inventory and plant it on an empty tile</p>
            </div>
            <div className="cycle-arrow">→</div>
            <div className="cycle-step">
                <div className="step-number">2</div>
                <h4>Water</h4>
                <p>Water your crops at least once (some need more) before they mature</p>
            </div>
            <div className="cycle-arrow">→</div>
            <div className="cycle-step">
                <div className="step-number">3</div>
                <h4>Wait</h4>
                <p>Each crop has its own growth time - be patient!</p>
            </div>
            <div className="cycle-arrow">→</div>
            <div className="cycle-step">
                <div className="step-number">4</div>
                <h4>Harvest</h4>
                <p>Collect your mature crops to earn CROPS tokens</p>
            </div>
        </div>

        <h3>Important Rules</h3>
        <ul>
            <li>📌 Crops stay on tiles indefinitely until harvested (except Rainbow Fruit)</li>
            <li>💧 You can water crops anytime between planting and harvesting</li>
            <li>⚡ Fertilizer instantly grows non-rare crops, bypassing water needs</li>
            <li>🏞️ You can have up to 24 farm tiles total</li>
            <li>🌟 Only one rare crop of a particular type can be grown at a time across all tiles</li>
            <li>🌈 Rainbow Fruit prevents ANY other crops from being grown while active</li>
        </ul>

        <div className="warning-box">
            <strong>⚠️ Warning:</strong> Don't forget to water your crops! Unwatered crops won't mature.
        </div>
    </div>
);

const CropsItemsSection = () => (
    <div className="guide-section">
        <h2>🌾 Crops & Items</h2>
        
        <h3>Crop Categories</h3>
        
        <div className="crop-category">
            <h4>🥔 Basic Crops</h4>
            <p>Your starting crops - perfect for beginners!</p>
            <ul>
                <li><strong>Potato:</strong> Reliable and steady</li>
                <li><strong>Tomato:</strong> Classic farm staple</li>
                <li><strong>Strawberry:</strong> Sweet and profitable</li>
            </ul>
        </div>

        <div className="crop-category">
            <h4>🌽 Standard Expansion Crops</h4>
            <p>Unlock these as you progress through the game</p>
            <ul>
                <li>Various crops with different growth times and yields</li>
                <li>Better profit margins than basic crops</li>
                <li>Some may require achievement tier unlocks</li>
            </ul>
        </div>

        <div className="crop-category">
            <h4>✨ Rare Crops</h4>
            <p>Special crops with unique properties and restrictions</p>
            <ul>
                <li><strong>Rainbow Fruit:</strong> Prevents all other farming while growing</li>
                <li><strong>Other Rare Crops:</strong> Only one rare crop type at a time</li>
                <li>Cannot be fertilized - must wait full growth time</li>
                <li>Higher rewards but longer growth times</li>
            </ul>
        </div>

        <h3>Essential Items</h3>
        <div className="items-grid">
            <div className="item-card">
                <h4>💧 Water Bucket</h4>
                <p>Essential for crop growth. Buy in packs of 6 for 50 CROPS</p>
            </div>
            <div className="item-card">
                <h4>🌿 Fertilizer</h4>
                <p>Instantly grows non-rare crops. Skip the waiting!</p>
            </div>
            <div className="item-card">
                <h4>🏞️ Farm Tiles</h4>
                <p>Expand your farm. Start with 3, max out at 24!</p>
            </div>
        </div>
    </div>
);

const AchievementsSection = () => (
    <div className="guide-section">
        <h2>🏆 Achievement System</h2>
        
        <p>Every action in the game earns you achievement points! Progress through tiers to unlock powerful upgrades.</p>

        <h3>Point System</h3>
        <ul>
            <li>🌱 Basic Actions (5-15 PTS): Planting, watering, harvesting</li>
            <li>🛒 Shop Actions (5-15 PTS): Purchasing items</li>
            <li>⚒️ Crafting Actions (5-15 PTS): Creating items</li>
            <li>🏆 Achievements (50-500 PTS): Complete specific goals for big rewards!</li>
        </ul>

        <h3>Achievement Tiers</h3>
        
        <div className="tier-progression">
            <div className="tier-card beginner">
                <h4>🌱 Beginner Tier</h4>
                <p className="tier-range">0 - 500 PTS</p>
                <p className="tier-reward">Unlocks: Irrigation System (Tier 1)</p>
                <div className="tier-examples">
                    <p>Example Achievements:</p>
                    <ul>
                        <li>First Harvest (+50 PTS)</li>
                        <li>Seed Collector (+50 PTS)</li>
                        <li>Green Thumb (+50 PTS)</li>
                    </ul>
                </div>
            </div>

            <div className="tier-card intermediate">
                <h4>🌾 Intermediate Tier</h4>
                <p className="tier-range">501 - 1,500 PTS</p>
                <p className="tier-reward">Unlocks: Irrigation (Tier 2) + Greenhouse (Tier 1)</p>
                <div className="tier-examples">
                    <p>Example Achievements:</p>
                    <ul>
                        <li>Potato King/Queen (+100 PTS)</li>
                        <li>Farm Expander (+100 PTS)</li>
                        <li>Daily Devotee (+100 PTS)</li>
                    </ul>
                </div>
            </div>

            <div className="tier-card expert">
                <h4>🎯 Expert Tier</h4>
                <p className="tier-range">1,501 - 3,000 PTS</p>
                <p className="tier-reward">Unlocks: Multiple Tier 3 Upgrades + Blueprints</p>
                <div className="tier-examples">
                    <p>Example Achievements:</p>
                    <ul>
                        <li>Harvest Legend (+200 PTS)</li>
                        <li>Land Baron (+200 PTS)</li>
                        <li>Wealthy Farmer (+200 PTS)</li>
                    </ul>
                </div>
            </div>

            <div className="tier-card master">
                <h4>👑 Master Tier</h4>
                <p className="tier-range">3,001 - 6,000 PTS</p>
                <p className="tier-reward">Reward: Golden Emblem "THE MYTH, THE LEGEND"</p>
                <div className="tier-examples">
                    <p>Example Achievements:</p>
                    <ul>
                        <li>Farming Mogul (+500 PTS)</li>
                        <li>Token Empire (+500 PTS)</li>
                        <li>Leaderboard Champion (+500 PTS)</li>
                    </ul>
                </div>
            </div>

            <div className="tier-card legendary">
                <h4>🌟 Legendary Tier</h4>
                <p className="tier-range">6,001 - 10,000 PTS</p>
                <p className="tier-reward">Continue your legendary journey!</p>
            </div>

            <div className="tier-card epochal">
                <h4>✨ Epochal Tier</h4>
                <p className="tier-range">10,001 - 20,000 PTS</p>
                <p className="tier-reward">Reward: Platinum Emblem "DIVINE ASCENDED FARMER"</p>
            </div>
        </div>

        <div className="info-box">
            <strong>📊 Leaderboard:</strong> Your total achievement points are displayed publicly on the leaderboard. Compete for the top spot!
        </div>
    </div>
);

const ShopEconomySection = () => (
    <div className="guide-section">
        <h2>💰 Shop & Economy</h2>
        
        <h3>CROPS Token</h3>
        <p>CROPS is the main currency in MonaFarms. Use it to buy seeds, items, and expand your farm!</p>
        
        <div className="economy-info">
            <div className="economy-card">
                <h4>📈 Earning CROPS</h4>
                <ul>
                    <li>Harvest crops for yields</li>
                    <li>Daily faucet: 50 CROPS (24h cooldown)</li>
                    <li>Complete achievements</li>
                    <li>Sell crafted items</li>
                </ul>
            </div>
            
            <div className="economy-card">
                <h4>💸 Spending CROPS</h4>
                <ul>
                    <li>Buy seeds and items</li>
                    <li>Purchase farm tiles</li>
                    <li>Get water buckets (6 for 50 CROPS)</li>
                    <li>All purchases go to project treasury</li>
                </ul>
            </div>
        </div>

        <h3>Shop Items</h3>
        <p>The shop offers various items for your farming needs:</p>
        <ul>
            <li>🌱 Seeds (Basic, Standard, and Rare varieties)</li>
            <li>💧 Water Buckets</li>
            <li>🌿 Fertilizer</li>
            <li>🏞️ Additional Farm Tiles</li>
            <li>🎯 Special items (unlock with achievement tiers)</li>
        </ul>

        <div className="tip-box">
            <strong>💡 Tip:</strong> Some rare items only become available after reaching certain achievement tiers!
        </div>
    </div>
);

const CraftingSection = () => (
    <div className="guide-section">
        <h2>⚒️ Crafting System</h2>
        
        <p>Create powerful tools and items that can't be bought in the shop!</p>

        <h3>Crafting Basics</h3>
        <ul>
            <li>Combine items to create new, more powerful ones</li>
            <li>Crafted items are exclusive - can't be purchased</li>
            <li>Some items require blueprints to craft</li>
        </ul>

        <h3>Special Crafted Items</h3>
        
        <div className="crafted-items">
            <div className="crafted-item">
                <h4>🌙 Lunar Harvester</h4>
                <p>Auto-harvests rare crops when mature</p>
                <ul>
                    <li>Works up to 6 times per 24 hours</li>
                    <li>Locks tile until harvest time</li>
                    <li>Creates temporary basket for rewards</li>
                    <li>Must claim basket contents manually</li>
                </ul>
            </div>
            
            <div className="crafted-item">
                <h4>⚔️ Monadium Sickle</h4>
                <p>Powerful harvesting tool</p>
                <ul>
                    <li>Requires blueprint (Expert Tier reward)</li>
                    <li>Enhanced harvesting capabilities</li>
                </ul>
            </div>
            
            <div className="crafted-item">
                <h4>🛠️ Monadium Hoe</h4>
                <p>Instant plant & harvest for non-rare crops</p>
                <ul>
                    <li>Requires blueprint (Expert Tier reward)</li>
                    <li>Use limit: 240 times per 24 hours</li>
                    <li>Skip watering requirements</li>
                    <li>Instant CROPS yield</li>
                </ul>
            </div>
        </div>

        <div className="info-box">
            <strong>📋 Blueprints:</strong> Monadium tools require blueprints, which are awarded upon completing the Expert achievement tier!
        </div>
    </div>
);

const UpgradesSection = () => (
    <div className="guide-section">
        <h2>⬆️ Farm Upgrades</h2>
        
        <p>Unlock powerful farm upgrades by progressing through achievement tiers!</p>

        <div className="upgrades-grid">
            <div className="upgrade-card">
                <div className="upgrade-icon">💧</div>
                <h3>Irrigation System</h3>
                <p>Get bonus water buckets with each purchase</p>
                <div className="upgrade-tiers">
                    <div className="upgrade-tier tier-1">
                        <span className="tier-label">Tier 1</span>
                        <span className="tier-value">+1 bucket (7 total)</span>
                    </div>
                    <div className="upgrade-tier tier-2">
                        <span className="tier-label">Tier 2</span>
                        <span className="tier-value">+2 buckets (8 total)</span>
                    </div>
                    <div className="upgrade-tier tier-3">
                        <span className="tier-label">Tier 3</span>
                        <span className="tier-value">+3 buckets (9 total)</span>
                    </div>
                    <div className="upgrade-tier tier-4">
                        <span className="tier-label">Tier 4</span>
                        <span className="tier-value">+4 buckets (10 total)</span>
                    </div>
                </div>
                <p className="upgrade-note">Same price of 50 CROPS!</p>
            </div>

            <div className="upgrade-card">
                <div className="upgrade-icon">🏠</div>
                <h3>Greenhouse</h3>
                <p>Boost crop growth speed</p>
                <div className="upgrade-tiers">
                    <div className="upgrade-tier tier-1">
                        <span className="tier-label">Tier 1</span>
                        <span className="tier-value">5% faster growth</span>
                    </div>
                    <div className="upgrade-tier tier-2">
                        <span className="tier-label">Tier 2</span>
                        <span className="tier-value">10% faster growth</span>
                    </div>
                    <div className="upgrade-tier tier-3">
                        <span className="tier-label">Tier 3</span>
                        <span className="tier-value">15% faster growth</span>
                    </div>
                    <div className="upgrade-tier tier-4">
                        <span className="tier-label">Tier 4</span>
                        <span className="tier-value">20% faster growth</span>
                    </div>
                </div>
            </div>

            <div className="upgrade-card">
                <div className="upgrade-icon">🌱</div>
                <h3>Seed Saver</h3>
                <p>Chance to keep seeds when planting</p>
                <div className="upgrade-tiers">
                    <div className="upgrade-tier tier-1">
                        <span className="tier-label">Tier 1</span>
                        <span className="tier-value">5% chance</span>
                    </div>
                    <div className="upgrade-tier tier-2">
                        <span className="tier-label">Tier 2</span>
                        <span className="tier-value">10% chance</span>
                    </div>
                    <div className="upgrade-tier tier-3">
                        <span className="tier-label">Tier 3</span>
                        <span className="tier-value">15% chance</span>
                    </div>
                    <div className="upgrade-tier tier-4">
                        <span className="tier-label">Tier 4</span>
                        <span className="tier-value">20% chance</span>
                    </div>
                </div>
            </div>

            <div className="upgrade-card">
                <div className="upgrade-icon">🌾</div>
                <h3>Rich Soil</h3>
                <p>Increase harvest yields</p>
                <div className="upgrade-tiers">
                    <div className="upgrade-tier tier-1">
                        <span className="tier-label">Tier 1</span>
                        <span className="tier-value">5% more yield</span>
                    </div>
                    <div className="upgrade-tier tier-2">
                        <span className="tier-label">Tier 2</span>
                        <span className="tier-value">10% more yield</span>
                    </div>
                    <div className="upgrade-tier tier-3">
                        <span className="tier-label">Tier 3</span>
                        <span className="tier-value">15% more yield</span>
                    </div>
                    <div className="upgrade-tier tier-4">
                        <span className="tier-label">Tier 4</span>
                        <span className="tier-value">20% more yield</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="upgrade-progression">
            <h3>Upgrade Unlock Progression</h3>
            <table className="upgrade-table">
                <thead>
                    <tr>
                        <th>Tier Completed</th>
                        <th>Irrigation</th>
                        <th>Greenhouse</th>
                        <th>Seed Saver</th>
                        <th>Rich Soil</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Beginner</td>
                        <td>Tier 1</td>
                        <td>-</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Intermediate</td>
                        <td>Tier 2</td>
                        <td>Tier 1</td>
                        <td>-</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Expert</td>
                        <td>Tier 3</td>
                        <td>Tier 2</td>
                        <td>Tier 1</td>
                        <td>Tier 1</td>
                    </tr>
                    <tr>
                        <td>Master</td>
                        <td>Tier 4</td>
                        <td>Tier 3</td>
                        <td>Tier 2</td>
                        <td>Tier 2</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
);

const AdvancedSection = () => (
    <div className="guide-section">
        <h2>🎯 Advanced Mechanics</h2>
        
        <h3>Rare Crop Strategy</h3>
        <ul>
            <li>🌟 Only one rare crop can exist across all tiles at once</li>
            <li>🌈 Rainbow Fruit blocks ALL other farming - plan carefully!</li>
            <li>⏰ Rare crops cannot be fertilized - patience required</li>
            <li>💰 Higher risk, higher reward gameplay</li>
        </ul>

        <h3>Efficiency Tips</h3>
        <div className="tips-grid">
            <div className="tip-card">
                <h4>⏱️ Time Management</h4>
                <ul>
                    <li>Water crops right after planting to save trips</li>
                    <li>Use fertilizer on high-value non-rare crops</li>
                    <li>Plan rare crop timing around your schedule</li>
                </ul>
            </div>
            
            <div className="tip-card">
                <h4>💰 Economy Optimization</h4>
                <ul>
                    <li>Always claim daily faucet</li>
                    <li>Focus on high-yield crops once unlocked</li>
                    <li>Save for tile expansions early</li>
                </ul>
            </div>
            
            <div className="tip-card">
                <h4>🏆 Achievement Hunting</h4>
                <ul>
                    <li>Complete easy achievements first</li>
                    <li>Daily actions add up quickly</li>
                    <li>Mix farming with shop/crafting actions</li>
                </ul>
            </div>
        </div>

        <h3>Monadium Tool Usage</h3>
        <div className="tool-strategy">
            <h4>🛠️ Monadium Hoe Strategy</h4>
            <p>With 240 uses per day, you can:</p>
            <ul>
                <li>Focus on high-value standard crops</li>
                <li>Skip water management entirely</li>
                <li>Maximize daily CROPS earnings</li>
                <li>Free up time for rare crop management</li>
            </ul>
        </div>

        <h3>Leaderboard Competition</h3>
        <ul>
            <li>🥇 Points from ALL activities count</li>
            <li>📈 Consistency beats sporadic play</li>
            <li>🎯 Balance achievement hunting with efficient farming</li>
            <li>👑 Top players earn special recognition</li>
        </ul>

        <div className="final-tips">
            <h3>🌟 Final Pro Tips</h3>
            <ol>
                <li><strong>Start Small:</strong> Master basic crops before attempting rare ones</li>
                <li><strong>Upgrade Smart:</strong> Prioritize upgrades that match your playstyle</li>
                <li><strong>Stay Active:</strong> Daily engagement compounds quickly</li>
                <li><strong>Join Community:</strong> Learn from other farmers' strategies</li>
                <li><strong>Have Fun:</strong> It's a game - enjoy the journey to becoming a legendary farmer!</li>
            </ol>
        </div>
    </div>
);

export default GuideComponent;