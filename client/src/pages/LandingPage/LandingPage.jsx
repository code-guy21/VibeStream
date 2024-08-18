import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/vibestream-logo.svg';
import backgroundVideo from '../../assets/videos/record.mp4';
import fallbackImage from '../../assets/images/fallback-image.jpg';
import styles from './LandingPage.module.css'; // Assuming you'll use a CSS module for consistency

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

			<div className='absolute inset-0 bg-black opacity-70'></div>

			<div className='relative z-10 flex flex-col items-center justify-center text-center px-4'>
				<img
					className='mx-auto h-16 w-auto mb-4'
					src={logo}
					alt='VibeStream Logo'
				/>
				<h1
					className={`${styles.heading} text-5xl md:text-6xl font-bold text-white mb-6`}>
					Welcome to Vibestream!
				</h1>
				<p
					className={`${styles.subheading} text-lg md:text-xl text-gray-300 mb-8`}>
					Your ultimate destination for music and visualizations.
				</p>
				<button onClick={handleLaunchApp} className={styles.launchButton}>
					Launch App
				</button>
			</div>
		</div>
	);
};

export default LandingPage;
