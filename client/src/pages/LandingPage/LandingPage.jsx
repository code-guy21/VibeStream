import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/vibestream-logo.svg';
import backgroundVideo from '../../assets/videos/record.mp4';
import fallbackImage from '../../assets/images/fallback-image.jpg';

const LandingPage = () => {
	const navigate = useNavigate();

	const handleLaunchApp = () => {
		navigate('/app');
	};

	return (
		<div className='relative min-h-screen flex flex-col'>
			<video
				autoPlay
				loop
				muted
				playsInline
				className='absolute w-full h-full object-cover'>
				<source src={backgroundVideo} type='video/mp4' />
				<img
					src={fallbackImage}
					alt='Fallback Background'
					className='absolute w-full h-full object-cover'
				/>
			</video>

			<div className='absolute inset-0 bg-black opacity-60'></div>

			<div className='relative z-10 flex flex-col items-center justify-center text-center px-4'>
				<img
					className='mx-auto h-16 w-auto mb-4'
					src={logo}
					alt='VibeStream Logo'
				/>
				<h1 className='text-5xl md:text-6xl font-heading font-bold text-white mb-6 animate-fade-in'>
					Welcome to Vibestream!
				</h1>
				<p className='text-lg md:text-xl font-body text-gray-200 mb-8 animate-fade-in delay-500'>
					Your ultimate destination for music and visualizations.
				</p>
				<button
					onClick={handleLaunchApp}
					className='px-8 py-3 bg-accent text-white font-body font-semibold rounded-full hover:bg-white hover:text-accent transition-colors duration-300 animate-fade-in delay-700'>
					Launch App
				</button>
			</div>
		</div>
	);
};

export default LandingPage;
