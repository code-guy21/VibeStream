import React from 'react';
import SpotifyConnect from '../../components/SpotifyConnect';
import logo from '../../assets/images/vibestream-logo.svg';

const ServicePage = () => {
	return (
		<div className='min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex flex-col items-center justify-center relative overflow-hidden'>
			{/* Animated Background Elements */}
			<div className='absolute top-0 left-0 w-full h-full pointer-events-none'>
				<div className='w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000'></div>
				<div className='w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000'></div>
				<div className='w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-6000'></div>
			</div>

			{/* Main Content */}
			<div className='relative z-10 text-center'>
				<img
					className='mx-auto h-20 w-auto mb-6'
					src={logo}
					alt='VibeStream Logo'
				/>
				<h2 className='text-4xl font-extrabold text-white mb-4'>
					Link a Service
				</h2>
				<p className='text-lg text-gray-200 mb-6'>Connect to start vibing!</p>
				<div className='flex justify-center'>
					<SpotifyConnect />
				</div>
			</div>

			{/* Animated Blob Styles */}
			<style jsx>{`
				.animate-blob {
					animation: blob 7s infinite;
				}
				@keyframes blob {
					0%,
					100% {
						transform: translate(0px, 0px) scale(1);
					}
					33% {
						transform: translate(30px, -50px) scale(1.1);
					}
					66% {
						transform: translate(-20px, 20px) scale(0.9);
					}
				}
				.animation-delay-2000 {
					animation-delay: 2s;
				}
				.animation-delay-4000 {
					animation-delay: 4s;
				}
				.animation-delay-6000 {
					animation-delay: 6s;
				}
			`}</style>
		</div>
	);
};

export default ServicePage;
