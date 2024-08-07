import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/vibestream-logo.svg';

const HomePage = () => {
	return (
		<div className='min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex flex-col items-center justify-center text-white p-4'>
			<div className='max-w-4xl text-center p-6 bg-opacity-50 bg-black rounded-lg shadow-lg'>
				<img
					className='mx-auto h-16 w-auto mb-4'
					src={logo}
					alt='VibeStream Logo'
				/>
				<h1 className='text-4xl font-bold mb-4'>Welcome to Vibestream!</h1>
				<p className='text-lg mb-8'>
					Your ultimate destination for music and visualizations.
				</p>
			</div>
			<div className='mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl'>
				<div className='bg-white text-black p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105'>
					<h2 className='text-2xl font-bold mb-2'>Discover Music</h2>
					<p>
						Find new music tailored to your taste with our advanced
						recommendation system.
					</p>
				</div>
				<div className='bg-white text-black p-6 rounded-lg shadow-lg transform transition-transform hover:scale-105'>
					<h2 className='text-2xl font-bold mb-2'>Create Visuals</h2>
					<p>
						Design and share amazing visualizations that move to the beat of
						your music.
					</p>
				</div>
			</div>
		</div>
	);
};

export default HomePage;
