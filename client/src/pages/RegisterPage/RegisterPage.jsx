import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { register } from '../../api/user';
import { ToastContainer, toast } from 'react-toastify';
import logo from '../../assets/images/vibestream-logo.svg';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

function RegisterPage() {
	const state = useSelector(state => state.user);
	const navigate = useNavigate();

	const [form, setForm] = useState({
		email: '',
		password: '',
		username: '',
		displayName: '',
	});

	useEffect(() => {
		if (!state.loading && state.loggedIn) {
			navigate('/');
		}
	}, [state.loggedIn, state.loading]);

	async function submitHandler(e) {
		e.preventDefault();

		try {
			let res = await register(form);

			console.log(res);

			let data = await res.json();

			console.log(data);

			if (res.status === 400) {
				console.log('popping');
				toast.error(data.message);
			} else {
				navigate('/verify-instruction');
			}
		} catch (error) {
			console.log(error);
		}
	}

	function onChangeHandler(e) {
		if (e.target.name === 'email') {
			setForm({
				...form,
				email: e.target.value,
			});
		} else if (e.target.name === 'password') {
			setForm({
				...form,
				password: e.target.value,
			});
		} else if (e.target.name === 'username') {
			setForm({
				...form,
				username: e.target.value,
			});
		} else if (e.target.name === 'displayName') {
			setForm({
				...form,
				displayName: e.target.value,
			});
		}
	}

	if (state.loading || state.loggedIn) {
		return null;
	}

	return (
		<>
			<div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
				<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
					<img className='mx-auto h-10 w-auto' src={logo} alt='Your Company' />
					<h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
						Sign up for an account
					</h2>
				</div>

				<div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
					<form className='space-y-6' onSubmit={submitHandler}>
						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium leading-6 text-gray-900'>
								Email address
							</label>
							<div className='mt-2'>
								<input
									onChange={onChangeHandler}
									id='email'
									name='email'
									type='email'
									autoComplete='email'
									required
									className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
								/>
							</div>
						</div>

						<div>
							<div className='flex items-center justify-between'>
								<label
									htmlFor='password'
									className='block text-sm font-medium leading-6 text-gray-900'>
									Password
								</label>
							</div>
							<div className='mt-2'>
								<input
									onChange={onChangeHandler}
									id='password'
									name='password'
									type='password'
									autoComplete='current-password'
									required
									className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
								/>
							</div>
						</div>

						<div>
							<div className='flex items-center justify-between'>
								<label
									htmlFor='username'
									className='block text-sm font-medium leading-6 text-gray-900'>
									Username
								</label>
							</div>
							<div className='mt-2'>
								<input
									onChange={onChangeHandler}
									id='username'
									name='username'
									type='text'
									autoComplete='username'
									required
									className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
								/>
							</div>
						</div>

						<div>
							<div className='flex items-center justify-between'>
								<label
									htmlFor='displayName'
									className='block text-sm font-medium leading-6 text-gray-900'>
									Display Name
								</label>
							</div>
							<div className='mt-2'>
								<input
									onChange={onChangeHandler}
									id='displayName'
									name='displayName'
									type='text'
									autoComplete='Display Name'
									required
									className='block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6'
								/>
							</div>
						</div>

						<div>
							<button
								type='submit'
								className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
								Sign Up
							</button>
						</div>
					</form>

					<p className='mt-10 text-center text-sm text-gray-500'>
						Already have an account?{' '}
						<Link
							to='/login'
							className='font-semibold leading-6 text-indigo-600 hover:text-indigo-500'>
							Sign In
						</Link>
					</p>
				</div>
				<ToastContainer></ToastContainer>
			</div>
		</>
	);
}

export default RegisterPage;
