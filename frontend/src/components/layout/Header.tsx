import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import BellIcon from '@heroicons/react/24/outline/BellIcon';
import {
	Wallet,
	WalletDropdown,
	WalletDropdownLink,
	WalletDropdownDisconnect,
	ConnectWallet
} from '@coinbase/onchainkit/wallet';
import {
	Avatar,
	Name,
	Address,
	EthBalance,
	Identity,
} from '@coinbase/onchainkit/identity';

interface HeaderProps {
	username: string;
	isDarkMode: boolean;
	toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({
	username,
	isDarkMode,
	toggleTheme,
}) => {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const handleAvatarClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setDropdownOpen((open) => !open);
	};

	// Handle click outside to close dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setDropdownOpen(false);
			}
		};

		if (dropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [dropdownOpen]);

	return (
		<header
			className='w-full flex justify-between items-center px-6 py-3.5 bg-white dark:bg-[var(--navbar-bg)] z-10 shadow-sm relative border-b border-gray-100 dark:border-gray-800'
			style={{
				background:
					'linear-gradient(to right, rgba(255, 255, 255, 0.8), rgba(237, 211, 255, 0.05))',
				backdropFilter: 'blur(8px)',
			}}
		>
			{/* Left section with brand */}
			<div
				className='flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-gray-800/40 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors button-hover-effect'
				style={{
					background:
						'linear-gradient(to right, rgba(207, 134, 255, 0.1), rgba(174, 210, 255, 0.15))',
					border: '1px solid rgba(174, 210, 255, 0.2)',
				}}
			>
				<h3 className='text-base font-medium text-gray-700 dark:text-gray-300 gradient-text'>
					DeCryptify AI
				</h3>
				<ChevronDownIcon className='w-4 h-4 text-gray-500' />
			</div>

			{/* Right section with user tools */}
			<div className='flex items-center gap-4'>
				<button
					className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 relative button-hover-effect'
					style={{ background: 'rgba(174, 210, 255, 0.08)' }}
					aria-label='Notifications'
				>
					<BellIcon className='h-5 w-5' />
					<span className='absolute top-1 right-1 w-2 h-2 bg-[var(--light-blue)] rounded-full animate-pulse'></span>
				</button>
				<button
					className='rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 button-hover-effect'
					style={{ background: 'rgba(207, 134, 255, 0.08)' }}
					aria-label='Settings'
				>
					<Cog6ToothIcon className='h-5 w-5' />
				</button>
				<div className='relative flex items-center'>
					<Wallet>
						<ConnectWallet />
						<WalletDropdown className="min-w-[220px] bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 mt-2 absolute right-0 z-20 p-2">
							<Identity className="flex flex-col items-start gap-1 px-4 pt-3 pb-2 border-b border-gray-100 dark:border-gray-800">
								<Avatar className="w-9 h-9 mb-1" />
								<Name className="font-semibold text-gray-800 dark:text-gray-100 text-sm" />
								<Address className="text-xs text-gray-500 dark:text-gray-400" />
							</Identity>
							<WalletDropdownLink
								className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-200 mt-2 text-sm font-medium"
								icon='wallet'
								href='https://keys.coinbase.com'
								target='_blank'
								rel='noopener noreferrer'
							>
								Wallet
							</WalletDropdownLink>
							<WalletDropdownDisconnect className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-red-600 dark:text-red-400 mt-1 text-sm font-medium" />
						</WalletDropdown>
					</Wallet>
				</div>
			</div>
		</header>
	);
};

export default Header;
