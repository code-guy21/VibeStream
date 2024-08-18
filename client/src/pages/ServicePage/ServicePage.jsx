import React from 'react';
import SpotifyConnect from '../../components/SpotifyConnect';
import logo from '../../assets/images/vibestream-logo.svg';
import styles from './ServicePage.module.css';

function ServicePage() {
	return (
		<div
			className={`relative flex min-h-screen flex-col justify-center items-center ${styles.pageBackground}`}>
			{/* Background Gradient & Elements */}
			<div className={`${styles.gradientOverlay} absolute inset-0`}></div>

			<div className='relative z-10 text-center'>
				<img
					className='mx-auto h-20 w-auto mb-8'
					src={logo}
					alt='VibeStream Logo'
				/>
				<h2 className={`${styles.heading} text-4xl font-bold mb-6`}>
					Link a Service
				</h2>
				<p className={`${styles.subheading} text-xl text-gray-300 mb-10`}>
					Connect to start vibing!
				</p>
				<div className='flex justify-center'>
					<SpotifyConnect />
				</div>
			</div>
		</div>
	);
}

export default ServicePage;
