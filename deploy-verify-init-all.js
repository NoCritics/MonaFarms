const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { formatEther } = require("ethers");

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
    const networkName = hre.network.name;
    const [deployer] = await hre.ethers.getSigners();
    const deployerBalance = await hre.ethers.provider.getBalance(deployer.address);

    console.log(`\\nDeploying to network: ${networkName}`);
    console.log(`Deploying contracts with the account: ${deployer.address} (Balance: ${formatEther(deployerBalance)})`);
    console.log("----------------------------------------------------\\n");

    const deployedContracts = {}; // To store { name: { address: "...", instance: ..., constructorArgs: [], contractName: "..." } }
    const deploymentArtifactsDir = path.join(__dirname, "..", "deployment-artifacts");
    if (!fs.existsSync(deploymentArtifactsDir)) {
        fs.mkdirSync(deploymentArtifactsDir, { recursive: true });
    }
    const addressesFilePath = path.join(deploymentArtifactsDir, `deployedNewContracts_${networkName}.json`);

    // Role definitions (must match those in PlayerRegistryInventory.sol)
    const MODIFIER_ROLE = hre.ethers.id("MODIFIER_ROLE"); // keccak256("MODIFIER_ROLE")
    const TIER_UPDATER_ROLE = hre.ethers.id("TIER_UPDATER_ROLE"); // keccak256("TIER_UPDATER_ROLE")
    const INITIAL_CROPS_GRANTER_ROLE = hre.ethers.id("INITIAL_CROPS_GRANTER_ROLE"); // keccak256("INITIAL_CROPS_GRANTER_ROLE")

    // Helper function to deploy and store contract info
    async function deployContract(contractName, constructorArgs = [], contractAlias) {
        const alias = contractAlias || contractName;
        console.log(`Deploying ${alias} (from ${contractName})...`);
        const ContractFactory = await hre.ethers.getContractFactory(contractName);
        const contractInstance = await ContractFactory.deploy(...constructorArgs);
        await contractInstance.waitForDeployment();
        const address = contractInstance.target;
        console.log(`${alias} deployed to: ${address}`);

        deployedContracts[alias] = {
            address: address,
            instance: contractInstance,
            constructorArgs: constructorArgs,
            contractName: contractName // Store the actual contract name for verification
        };

        if (networkName !== "localhost" && networkName !== "hardhat") {
            try {
                console.log(`Waiting for 5 confirmations for ${alias}...`);
                const deployTx = contractInstance.deploymentTransaction();
                if (deployTx) {
                    await deployTx.wait(5);
                    console.log(`${alias} transaction confirmed.`);
                } else {
                    console.warn(`Warning: Could not retrieve deployment transaction for ${alias}.`);
                }
            } catch (e) {
                console.warn(`Warning: ${alias} deployment confirmation wait failed: ${e.message}`);
            }
        }
        return contractInstance; // Return instance for immediate use
    }

    try {
        // --- 1. DEPLOYMENT ---
        console.log("Starting contract deployments...");

        const cropsTokenArgs = [deployer.address];
        const cropsToken = await deployContract("CROPS_Token", cropsTokenArgs);

        const timeOracleArgs = [deployer.address];
        const timeOracle = await deployContract("TimeOracle", timeOracleArgs);

        const itemRegistryArgs = [deployer.address];
        const itemRegistry = await deployContract("ItemRegistry", itemRegistryArgs);

        // PlayerRegistryInventory constructor now takes 4 arguments
        const playerRegistryInventoryArgs = [deployer.address, cropsToken.target, timeOracle.target, itemRegistry.target];
        const playerRegistryInventory = await deployContract("PlayerRegistryInventory", playerRegistryInventoryArgs);

        const playerLeaderboardArgs = [deployer.address, playerRegistryInventory.target];
        const playerLeaderboard = await deployContract("PlayerLeaderboard", playerLeaderboardArgs);

        const economyContractArgs = [deployer.address, cropsToken.target, playerRegistryInventory.target, timeOracle.target];
        const economyContract = await deployContract("EconomyContract", economyContractArgs);

        // Deploy FarmEnhancementContract now as PlayerRegistryInventory instance exists
        // FarmEnhancementContract constructor needs: PlayerRegistryInventory, TimeOracle, ItemRegistry
        const farmEnhancementContractArgs = [deployer.address, playerRegistryInventory.target, timeOracle.target, itemRegistry.target];
        const farmEnhancementContractInstance = await deployContract("FarmEnhancementContract", farmEnhancementContractArgs, "FarmEnhancementContract"); 

        const craftingManagerArgs = [deployer.address, playerRegistryInventory.target, itemRegistry.target, playerLeaderboard.target];
        const craftingManager = await deployContract("CraftingManager", craftingManagerArgs);

        const shopManagerArgs = [deployer.address, playerRegistryInventory.target, itemRegistry.target, economyContract.target, playerLeaderboard.target, farmEnhancementContractInstance.target, timeOracle.target, cropsToken.target];
        const shopManager = await deployContract("ShopManager", shopManagerArgs);

        const farmManagerArgs = [deployer.address, playerRegistryInventory.target, itemRegistry.target, timeOracle.target, economyContract.target, playerLeaderboard.target, farmEnhancementContractInstance.target, cropsToken.target];
        const farmManager = await deployContract("FarmManager", farmManagerArgs);

        console.log("----------------------------------------------------");
        console.log("All contracts deployed.");

        const addressesToSave = {};
        for (const name in deployedContracts) {
            addressesToSave[name] = deployedContracts[name].address;
        }
        fs.writeFileSync(addressesFilePath, JSON.stringify(addressesToSave, null, 2));
        console.log(`Deployed addresses saved to ${addressesFilePath}`);


        // --- 2. VERIFICATION ---
        if (networkName !== "localhost" && networkName !== "hardhat") {
            console.log("----------------------------------------------------");
            console.log("Starting contract verification on Sourcify (Monad)...");
            console.log("Waiting a bit before starting verification to allow indexers to catch up...");
            await delay(30000); // 30-second delay

            for (const name of Object.keys(deployedContracts)) {
                const contract = deployedContracts[name];
                console.log(`Verifying ${name} (${contract.contractName}) at ${contract.address}...`);
                try {
                    // Hardhat's verify task can usually infer the contract name if the address is unique.
                    // If not, you might need to provide the fully qualified name.
                    // e.g., contract: \`contracts/new/${contract.contractName}.sol:${contract.contractName}\`
                    await hre.run("verify:verify", {
                        address: contract.address,
                        constructorArguments: contract.constructorArgs,
                    });
                    console.log(`${name} verified successfully.`);
                } catch (error) {
                    console.error(`Error verifying ${name}:`, error.message);
                    if (error.message.toLowerCase().includes("already verified") || error.message.toLowerCase().includes("already_verified")) {
                        console.log(`${name} is already verified.`);
                    } else {
                        console.log(`Failed to verify ${name}. Skipping...`);
                    }
                }
                await delay(5000); // Short delay between verifications
            }
            console.log("Contract verification process completed.");
        } else {
            console.log("Skipping verification for local network.");
        }


        // --- 3. INITIALIZATION ---
        console.log("----------------------------------------------------");
        console.log("Performing post-deployment initializations...");

        // 3.1 Initialize ItemRegistry default data
        console.log(`Initializing ItemRegistry (${itemRegistry.target}) default data...`);
        const itemRegistryTx = await itemRegistry.connect(deployer).initializeDefaultData();
        console.log(`Sent ItemRegistry.initializeDefaultData() tx: ${itemRegistryTx.hash}`);
        await itemRegistryTx.wait();
        console.log("ItemRegistry default data initialized.");

        // 3.2 Transfer CROPS_Token ownership to EconomyContract
        console.log(`Transferring CROPS_Token (${cropsToken.target}) ownership to EconomyContract (${economyContract.target})...`);
        const transferOwnershipTx = await cropsToken.connect(deployer).transferOwnership(economyContract.target);
        console.log(`Sent CROPS_Token.transferOwnership() tx: ${transferOwnershipTx.hash}`);
        await transferOwnershipTx.wait();
        console.log("CROPS_Token ownership transferred to EconomyContract.");

        // 3.3 Call setExternalContracts on relevant contracts
        const contractsToInitialize = [
            // PlayerRegistryInventory now takes 4 args in setExternalContracts
            { name: "PlayerRegistryInventory", instance: playerRegistryInventory, args: [cropsToken.target, timeOracle.target, itemRegistry.target, farmEnhancementContractInstance.target] }, 
            { name: "PlayerLeaderboard", instance: playerLeaderboard, args: [playerRegistryInventory.target] },
            { name: "EconomyContract", instance: economyContract, args: [cropsToken.target, playerRegistryInventory.target, timeOracle.target] },
            { name: "FarmEnhancementContract", instance: farmEnhancementContractInstance, args: [playerRegistryInventory.target, timeOracle.target, itemRegistry.target] },
            { name: "CraftingManager", instance: craftingManager, args: [playerRegistryInventory.target, itemRegistry.target, playerLeaderboard.target] },
            { name: "ShopManager", instance: shopManager, args: [playerRegistryInventory.target, itemRegistry.target, economyContract.target, playerLeaderboard.target, farmEnhancementContractInstance.target, timeOracle.target, cropsToken.target] },
            { name: "FarmManager", instance: farmManager, args: [playerRegistryInventory.target, itemRegistry.target, timeOracle.target, economyContract.target, playerLeaderboard.target, farmEnhancementContractInstance.target, cropsToken.target] },
        ];

        for (const contractInfo of contractsToInitialize) {
            // Check if the setExternalContracts function exists on the instance
            if (typeof contractInfo.instance.setExternalContracts === 'function') {
                console.log(`Calling setExternalContracts for ${contractInfo.name}...`);
                const tx = await contractInfo.instance.connect(deployer).setExternalContracts(...contractInfo.args);
                console.log(`Sent ${contractInfo.name}.setExternalContracts() tx: ${tx.hash}`);
                await tx.wait();
                console.log(`${contractInfo.name} external contracts set.`);
            } else {
                console.warn(`Skipping setExternalContracts for ${contractInfo.name} as function is not present or not callable.`);
            }
        }

        // 3.4 Grant roles on PlayerRegistryInventory
        console.log("Granting roles on PlayerRegistryInventory...");

        // Grant MODIFIER_ROLE to contracts that need to modify inventory or player state
        const modifierRoleReceivers = [
            { name: "ShopManager", address: shopManager.target },
            { name: "CraftingManager", address: craftingManager.target },
            { name: "FarmManager", address: farmManager.target },
            { name: "FarmEnhancementContract", address: farmEnhancementContractInstance.target },
            { name: "EconomyContract", address: economyContract.target } // For adminMint/faucet if they use _addItem
        ];
        for (const receiver of modifierRoleReceivers) {
            console.log(`Granting MODIFIER_ROLE to ${receiver.name} (${receiver.address})...`);
            const tx = await playerRegistryInventory.connect(deployer).grantRole(MODIFIER_ROLE, receiver.address);
            await tx.wait();
            console.log(`MODIFIER_ROLE granted to ${receiver.name}.`);
        }

        // Grant TIER_UPDATER_ROLE to PlayerLeaderboard
        console.log(`Granting TIER_UPDATER_ROLE to PlayerLeaderboard (${playerLeaderboard.target})...`);
        const tierUpdaterTx = await playerRegistryInventory.connect(deployer).grantRole(TIER_UPDATER_ROLE, playerLeaderboard.target);
        await tierUpdaterTx.wait();
        console.log("TIER_UPDATER_ROLE granted to PlayerLeaderboard.");

        // Grant INITIAL_CROPS_GRANTER_ROLE to EconomyContract
        console.log(`Granting INITIAL_CROPS_GRANTER_ROLE to EconomyContract (${economyContract.target})...`);
        const initialCropsTx = await playerRegistryInventory.connect(deployer).grantRole(INITIAL_CROPS_GRANTER_ROLE, economyContract.target);
        await initialCropsTx.wait();
        console.log("INITIAL_CROPS_GRANTER_ROLE granted to EconomyContract.");

        // Grant MODIFIER_ROLE to PlayerRegistryInventory itself for blueprint awarding
        console.log(`Granting MODIFIER_ROLE to PlayerRegistryInventory itself (${playerRegistryInventory.target}) for internal operations...`);
        const selfGrantTx = await playerRegistryInventory.connect(deployer).grantModifierRoleToSelf(playerRegistryInventory.target);
        await selfGrantTx.wait();
        console.log("MODIFIER_ROLE granted to PlayerRegistryInventory for self-operations.");

        console.log("----------------------------------------------------");
        console.log("All contracts deployed, verified (if applicable), and initialized successfully!");
        const finalAddresses = {};
        for (const name in deployedContracts) {
            finalAddresses[name] = deployedContracts[name].address;
        }
        console.log("Final Deployed Addresses:", finalAddresses);

    } catch (error) {
        console.error("Deployment script failed:", error);
        if (Object.keys(deployedContracts).length > 0) {
            const errorAddresses = {};
            for (const name in deployedContracts) {
                errorAddresses[name] = deployedContracts[name].address;
            }
            console.error("Addresses deployed so far (incomplete deployment):", errorAddresses);
            fs.writeFileSync(
                path.join(deploymentArtifactsDir, `deployedNewContracts_${networkName}_INCOMPLETE.json`),
                JSON.stringify(errorAddresses, null, 2)
            );
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 