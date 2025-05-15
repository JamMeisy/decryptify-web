'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	ConnectWallet,
	Wallet,
	WalletDropdown,
	WalletDropdownLink,
	WalletDropdownDisconnect,
	useWalletContext,
} from '@coinbase/onchainkit/wallet';
import {
	Address,
	Avatar,
	Name,
	Identity,
	EthBalance,
} from '@coinbase/onchainkit/identity';

export default function LandingPage() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [mounted, setMounted] = useState(false);
	const walletContext = useWalletContext();
	const isConnected = walletContext && walletContext.address;

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<div className="min-h-screen flex flex-col  background-trasnparent relative overflow-hidden">
			{/* Animated Background Elements */}
			<div className="fixed inset-0 z-0 pointer-events-none">
				<div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 opacity-90"></div>
				{/* Animated orbs - made smaller */}
				<div className="absolute rounded-full bg-gradient-to-br from-blue-200/40 to-blue-300/30 blur-3xl animate-float" style={{ top: '20%', left: '10%', width: '280px', height: '280px' }}></div>
				<div className="absolute rounded-full bg-gradient-to-br from-violet-200/40 to-purple-300/30 blur-3xl animate-float-delayed" style={{ top: '15%', right: '10%', width: '240px', height: '240px' }}></div>
				<div className="absolute rounded-full bg-gradient-to-br from-purple-100/30 to-pink-200/20 blur-2xl animate-float-slow" style={{ bottom: '15%', right: '15%', width: '200px', height: '200px' }}></div>
				<div className="absolute rounded-full bg-gradient-to-br from-indigo-100/30 to-blue-200/20 blur-2xl animate-float-delayed-slow" style={{ bottom: '20%', left: '15%', width: '220px', height: '220px' }}></div>
			</div>

			<main className="flex-1 flex items-center justify-center px-4 z-10 relative">
				<div className="w-full max-w-md p-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/40 transform hover:scale-[1.01] transition-transform duration-300">
					{/* Logo and Title */}
					<div className="flex flex-col items-center mb-6">
						<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-3 animate-pulse-slow relative">
							<div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 blur-lg opacity-50 animate-pulse"></div>
							<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="-rotate-6 z-10">
								<path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
							</svg>
						</div>
						<h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent mb-2 tracking-tight drop-shadow-lg animate-gradient-text">
							DeCryptify
						</h1>
						<p className="text-center text-gray-700 dark:text-gray-300 mb-6 max-w-xs mx-auto text-sm font-medium animate-fade-in">
							Confidence in Crypto Starts with Trust
						</p>
					</div>

					{error && (
						<div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-3 rounded-lg mb-4 text-xs text-center font-semibold shadow animate-shake">
							<svg className="w-4 h-4 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
								<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
							</svg>
							{error}
						</div>
					)}

					{/* Wallet Connection Section */}
					<div className="w-full py-2 rounded-lg flex flex-col items-center gap-3">
						<Wallet>
							{!isConnected ? (
								<div className="flex flex-col items-center w-full">
									<ConnectWallet className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-blue-500/30 dark:hover:shadow-blue-700/20 flex items-center justify-center transition-all duration-300 transform hover:scale-105 text-sm" />
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center animate-fade-in">
										Connect your wallet to get started
									</p>
								</div>
							) : (
								<>
									{/* Connected State */}
									<div className="flex flex-col items-center gap-3 mt-1 w-full animate-fade-in">
										<div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-700 dark:text-green-300 font-semibold shadow-md border border-green-200 dark:border-green-800 text-sm">
											<div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
											<Avatar className="h-6 w-6 border-2 border-white rounded-full shadow-inner" />
											<span>Connected to Base</span>
										</div>
										
										{/* Action Buttons */}
										<div className="mt-4 w-full flex flex-col gap-3 items-center">
											<button
												onClick={() => router.push('/dashboard')}
												className="w-full py-3 px-6 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-700 hover:via-indigo-700 hover:to-blue-700 shadow-lg hover:shadow-violet-500/40 dark:hover:shadow-violet-700/30 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:translate-y-[-1px] relative group overflow-hidden"
											>
												<div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-indigo-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
												<svg className="w-4 h-4 z-10" fill="currentColor" viewBox="0 0 20 20">
													<path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
												</svg>
												<span className="z-10">Use DeCryptify Now</span>
											</button>
											
											<button
												onClick={() => router.push('/chat')}
												className="w-full py-3 px-6 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 shadow-lg hover:shadow-emerald-500/40 dark:hover:shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 hover:translate-y-[-1px] relative group overflow-hidden"
											>
												<div className="absolute inset-0 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
												<svg className="w-4 h-4 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
												</svg>
												<span className="z-10">Chat with DeCryptify</span>
											</button>
										</div>
									</div>
								</>
							)}
							
							<WalletDropdown>
								<div className="rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/95 px-4 py-3 min-w-[240px] transform transition-all duration-200 hover:scale-[1.01]">
									<Identity className="w-full flex flex-col items-center gap-1" hasCopyAddressOnClick>
										<Avatar className="w-12 h-12 mb-1 shadow-md border-2 border-white" />
										<Name className="font-semibold text-gray-800 dark:text-gray-100 text-sm" />
										<Address className="text-xs text-gray-500 dark:text-gray-400" />
									</Identity>
									<div className="w-full border-t border-gray-200 dark:border-gray-700 my-3"></div>
									<WalletDropdownLink
										icon="wallet"
										href="https://keys.coinbase.com"
										target="_blank"
										rel="noopener noreferrer"
										className="w-full text-left px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 text-xs font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2"
									>
										Wallet
									</WalletDropdownLink>
									<WalletDropdownDisconnect className="w-full text-left px-2 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 text-xs font-medium text-red-600 dark:text-red-300 flex items-center gap-2 mt-1" />
								</div>
							</WalletDropdown>
						</Wallet>
					</div>

					{!isConnected && (
						<div className="mt-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-4">
							<p className="text-xs text-gray-600 dark:text-gray-400 text-center">
								Don't have the extension installed?{' '}
								<a
									href="https://www.coinbase.com/en-gb/wallet/articles/getting-started-extension"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 font-semibold hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 transition-colors underline underline-offset-2"
								>
									Install now →
								</a>
							</p>
						</div>
					)}
				</div>

				{/* Features Section - Hidden on mobile, shown on larger screens */}
				<div className="hidden lg:block absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4">
					<div className="grid grid-cols-3 gap-4">
						<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl shadow-md flex flex-col items-center hover:scale-105 hover:shadow-blue-200/30 dark:hover:shadow-blue-900/30 transition-all duration-300 border border-blue-100 dark:border-blue-900 group">
							<div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
								<svg className="w-5 h-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
								</svg>
							</div>
							<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 text-center">Trust Scores</h3>
							<p className="text-gray-600 dark:text-gray-300 text-xs text-center">Comprehensive trust evaluation</p>
						</div>
						
						<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl shadow-md flex flex-col items-center hover:scale-105 hover:shadow-purple-200/30 dark:hover:shadow-purple-900/30 transition-all duration-300 border border-purple-100 dark:border-purple-900 group">
							<div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
								<svg className="w-5 h-5 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							</div>
							<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 text-center">Real-time Analysis</h3>
							<p className="text-gray-600 dark:text-gray-300 text-xs text-center">Up-to-date crypto insights</p>
						</div>
						
						<div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl shadow-md flex flex-col items-center hover:scale-105 hover:shadow-green-200/30 dark:hover:shadow-green-900/30 transition-all duration-300 border border-green-100 dark:border-green-900 group">
							<div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
								<svg className="w-5 h-5 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
								</svg>
							</div>
							<h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 text-center">Customized Alerts</h3>
							<p className="text-gray-600 dark:text-gray-300 text-xs text-center">Personalized notifications</p>
						</div>
					</div>
				</div>
			</main>

			<footer className="py-6 px-4 text-center text-xs text-gray-600 dark:text-gray-400 z-10 relative font-medium tracking-wide border-t border-gray-100 dark:border-gray-800">
				<p>© {new Date().getFullYear()} DeCryptify. All rights reserved.</p>
			</footer>
		</div>
	);
}