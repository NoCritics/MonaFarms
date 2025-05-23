import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { parseEther, formatEther, formatUnits } from 'viem';
import CROPS_TokenABI from '../abis/CROPS_Token.abi.json';
import EconomyContractABI from '../abis/EconomyContract.abi.json';
import { CONTRACT_ADDRESSES } from '../constants/contractAddresses';
import { CropsToken as CropsTokenIcon } from '../assets/ItemImages';

const CropsTokenComponent = () => {
    const { address } = useAccount();
    const [transferAmount, setTransferAmount] = useState("");
    const [transferRecipient, setTransferRecipient] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState(null);
    const [tokenDecimals, setTokenDecimals] = useState(18); // Default to 18, but we'll read the actual value

    // Get token decimals
    const { data: decimalsData } = useReadContract({
        address: CONTRACT_ADDRESSES.CROPS_Token,
        abi: CROPS_TokenABI,
        functionName: 'decimals',
        enabled: !!address,
    });

    // Set token decimals when data is received
    useEffect(() => {
        if (decimalsData !== undefined) {
            setTokenDecimals(Number(decimalsData));
        }
    }, [decimalsData]);

    // Get token balance from CROPS_Token contract
    const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.CROPS_Token,
        abi: CROPS_TokenABI,
        functionName: 'balanceOf',
        args: [address],
        enabled: !!address,
    });

    // Get faucet cooldown time from EconomyContract
    const { data: faucetTime, refetch: refetchFaucetTime } = useReadContract({
        address: CONTRACT_ADDRESSES.EconomyContract,
        abi: EconomyContractABI,
        functionName: 'getTimeToCooldownEnd',
        args: [address, 0], // 0 is the cooldown type for daily faucet
        enabled: !!address,
    });

    useEffect(() => {
        if (faucetTime) {
            const time = Number(faucetTime);
            setTimeLeft(time);
            
            // Clear any existing interval
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            
            // Only set up interval if there's time remaining
            if (time > 0) {
                const interval = setInterval(() => {
                    setTimeLeft(prevTime => {
                        if (prevTime <= 1) {
                            clearInterval(interval);
                            refetchFaucetTime();
                            return 0;
                        }
                        return prevTime - 1;
                    });
                }, 1000);
                
                setCountdownInterval(interval);
            }
        }
        
        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [faucetTime, refetchFaucetTime]);

    const { writeContractAsync: claimFaucet, isPending: isClaiming } = useWriteContract();

    const handleClaimFaucet = async () => {
        try {
            await claimFaucet({
                address: CONTRACT_ADDRESSES.EconomyContract,
                abi: EconomyContractABI,
                functionName: 'claimDailyFaucet'
            });
            refetchBalance();
            refetchFaucetTime();
        } catch (error) {
            console.error("Faucet claim error:", error);
            alert("Claim failed: " + error.message);
        }
    };

    const { writeContractAsync: transferTokens, isPending: isTransferring } = useWriteContract();

    const handleTransfer = async () => {
        if (!transferAmount || !transferRecipient) return;
        try {
            // Use the correct decimals for parsing the transfer amount
            const parsedAmount = tokenDecimals === 18 
                ? parseEther(transferAmount) 
                : BigInt(Math.floor(parseFloat(transferAmount) * (10 ** tokenDecimals)));

            await transferTokens({
                address: CONTRACT_ADDRESSES.CROPS_Token,
                abi: CROPS_TokenABI,
                functionName: 'transfer',
                args: [transferRecipient, parsedAmount]
            });
            setTransferAmount("");
            setTransferRecipient("");
            refetchBalance();
        } catch (error) {
            console.error("Transfer error:", error);
            alert("Transfer failed: " + error.message);
        }
    };

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Format token balance with correct decimals
    const formatTokenBalance = () => {
        if (!tokenBalance) return '0';
        
        // Use formatUnits with the correct decimals if we have it, otherwise fall back to formatEther
        try {
            return formatUnits(tokenBalance, tokenDecimals);
        } catch (error) {
            console.error("Error formatting balance:", error);
            return formatEther(tokenBalance); // Fallback
        }
    };

    const timePercentage = timeLeft > 0 ? 100 - ((timeLeft / (24 * 3600)) * 100) : 100;

    if (!address) return (
        <div className="card animate-fade-in">
            <h2>CROPS Token</h2>
            <p className="text-center text-secondary">Please connect your wallet to view your token balance.</p>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h2>CROPS Token</h2>
            
            <div className="token-card card">
                <h3>Token Balance</h3>
                
                <div className="token-balance">
                    <div className="token-icon"><CropsTokenIcon size={24} /></div>
                    <div>{formatTokenBalance()}</div>
                    <div className="token-label">CROPS</div>
                </div>
                
                <div className="faucet-timer">
                    <div className="w-full">
                        <div className="flex justify-between mb-sm">
                            <div className="text-secondary">Daily Token Faucet</div>
                            {timeLeft > 0 && (
                                <div className="text-highlight">{formatTime(timeLeft)}</div>
                            )}
                        </div>
                        
                        <div className="timer-progress">
                            <div 
                                className="timer-fill" 
                                style={{ width: `${timePercentage}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
                
                <div className="text-center mt-md">
                    {timeLeft === 0 ? (
                        <button 
                            className="btn btn-highlight" 
                            onClick={handleClaimFaucet} 
                            disabled={isClaiming}
                        >
                            {isClaiming ? "Claiming..." : "Claim 50 CROPS"}
                        </button>
                    ) : (
                        <p className="text-secondary">Come back later to claim more tokens!</p>
                    )}
                </div>
            </div>
            
            <div className="transfer-card card mt-lg">
                <h3>Transfer Tokens</h3>
                
                <div className="form-group mt-md">
                    <label className="form-label" htmlFor="recipient">Recipient Address:</label>
                    <input
                        id="recipient"
                        type="text"
                        className="form-control"
                        value={transferRecipient}
                        onChange={(e) => setTransferRecipient(e.target.value)}
                        placeholder="0x..."
                    />
                </div>
                
                <div className="form-group">
                    <label className="form-label" htmlFor="amount">Amount (CROPS):</label>
                    <input
                        id="amount"
                        type="number"
                        className="form-control"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Amount"
                        min="0"
                        step="0.1"
                    />
                </div>
                
                <button
                    className="btn btn-primary w-full mt-md"
                    onClick={handleTransfer}
                    disabled={isTransferring || !transferAmount || !transferRecipient}
                >
                    {isTransferring ? "Transferring..." : "Transfer Tokens"}
                </button>
            </div>
        </div>
    );
};

export default CropsTokenComponent;