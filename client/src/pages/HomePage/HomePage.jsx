// src/pages/UserHomePage.js

import React from 'react';
import { useSelector } from 'react-redux';

const UserHomePage = () => {
	const user = useSelector(state => state.user);

	return (
		<div className='min-h-screen bg-gray-100 flex flex-col items-center justify-center'>
			<h1 className='text-4xl font-bold mb-6'>
				Welcome Back, {user.user.username}!
			</h1>
			<p className='text-lg'>Here’s what’s happening on VibeStream:</p>
			{/* Additional content for logged-in users */}
		</div>
	);
};

export default UserHomePage;
