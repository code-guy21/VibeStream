import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import logo from '../../assets/images/vibestream-logo.svg';

function VerifyStatusPage() {
	const location = useLocation();
	const [status, setStatus] = useState(null);

	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		setStatus(queryParams.get('status'));
	}, [location]);

	const renderMessage = () => {
		switch (status) {
			case 'success':
				return 'Your email has been successfully verified!';
			case 'failure':
				return 'Verification failed. The token may be invalid or expired.';
			case 'error':
				return 'An error occurred during the verification process. Please try again later.';
			default:
				return 'Processing your verification...';
		}
	};

	return (
		<div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
			<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
				<img className='mx-auto h-10 w-auto' src={logo} alt='Your Company' />
				<h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
					Email Verification
				</h2>
				<p className='mt-5 text-center text-sm text-gray-500'>
					{renderMessage()}
				</p>
				{status === 'success' && (
					<div className='mt-10 text-center'>
						<Link
							to='/login'
							className='font-semibold leading-6 text-indigo-600 hover:text-indigo-500'>
							Proceed to Login
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}

export default VerifyStatusPage;
