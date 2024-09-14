import React from 'react';
import logo from '../../assets/images/vibestream-logo.svg';
import { Link } from 'react-router-dom';

function VerifyInstructionPage() {
	return (
		<>
			<div className='flex min-h-full flex-1 flex-col mt-12 justify-center px-6 py-12 lg:px-8'>
				<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
					<img className='mx-auto h-10 w-auto' src={logo} alt='VibeStream' />
					<h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
						Verify Your Email
					</h2>
				</div>

				<div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
					<p className='text-center text-sm text-gray-500'>
						We have sent a verification email to your registered email address.
						Please check your inbox and follow the instructions to verify your
						account.
					</p>
					<p className='mt-4 text-center text-sm text-gray-500'>
						If you have already verified your email, you can go back to the
						login page.
					</p>
					<div className='mt-6'>
						<Link
							to='/app/login'
							className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
							Back to Login
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}

export default VerifyInstructionPage;
