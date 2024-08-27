import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { register } from '../../api/user';
import { ToastContainer, toast } from 'react-toastify';
import logo from '../../assets/images/vibestream-logo.svg';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import styles from './RegisterPage.module.css';
import 'react-toastify/dist/ReactToastify.css';

function RegisterPage() {
	const state = useSelector(state => state.user);
	const navigate = useNavigate();

	const [form, setForm] = useState({
		email: '',
		password: '',
		username: '',
		displayName: '',
		confirmPassword: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	useEffect(() => {
		if (!state.loading && state.loggedIn) {
			navigate('/');
		}
	}, [state.loggedIn, state.loading]);

	async function submitHandler(e) {
		e.preventDefault();

		if (form.password !== form.confirmPassword) {
			toast.error("Passwords don't match");
			return;
		}

		try {
			let res = await register(form);

			let data = await res.json();

			if (res.status === 400) {
				toast.error(data.message);
			} else if (res.status === 500) {
				toast.error(data.details);
			} else {
				navigate('/app/verify-instruction');
			}
		} catch (error) {
			console.log(error);
		}
	}

	function onChangeHandler(e) {
		setForm({
			...form,
			[e.target.name]: e.target.value,
		});
	}

	function togglePasswordVisibility(field) {
		if (field === 'password') {
			setShowPassword(!showPassword);
		} else if (field === 'confirmPassword') {
			setShowConfirmPassword(!showConfirmPassword);
		}
	}

	if (state.loading || state.loggedIn) {
		return null;
	}

	return (
		<>
			<div
				className={`flex min-h-screen flex-col justify-center items-center ${styles.pageBackground}`}>
				<div className='sm:mx-auto sm:w-full sm:max-w-md text-center'>
					<img
						className='mx-auto h-16 w-auto mb-8'
						src={logo}
						alt='VibeStream Logo'
					/>
					<h2
						className={`${styles.heading} text-3xl font-bold text-white mb-6`}>
						Sign up for an account
					</h2>
				</div>

				<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
					<form className='space-y-6' onSubmit={submitHandler}>
						<div>
							<label
								htmlFor='email'
								className='block text-sm font-medium text-gray-300'>
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
									className={`${styles.inputField}`}
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-gray-300'>
								Password
							</label>
							<div className='mt-2 relative'>
								<input
									onChange={onChangeHandler}
									id='password'
									name='password'
									type={showPassword ? 'text' : 'password'}
									autoComplete='new-password'
									required
									className={`${styles.inputField} pr-10`}
								/>
								<button
									type='button'
									onClick={() => togglePasswordVisibility('password')}
									className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5'>
									{showPassword ? (
										<EyeSlashIcon className='h-5 w-5 text-gray-400' />
									) : (
										<EyeIcon className='h-5 w-5 text-gray-400' />
									)}
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium text-gray-300'>
								Confirm Password
							</label>
							<div className='mt-2 relative'>
								<input
									onChange={onChangeHandler}
									id='confirmPassword'
									name='confirmPassword'
									type={showConfirmPassword ? 'text' : 'password'}
									autoComplete='new-password'
									required
									className={`${styles.inputField} pr-10`}
								/>
								<button
									type='button'
									onClick={() => togglePasswordVisibility('confirmPassword')}
									className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5'>
									{showConfirmPassword ? (
										<EyeSlashIcon className='h-5 w-5 text-gray-400' />
									) : (
										<EyeIcon className='h-5 w-5 text-gray-400' />
									)}
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor='username'
								className='block text-sm font-medium text-gray-300'>
								Username
							</label>
							<div className='mt-2'>
								<input
									onChange={onChangeHandler}
									id='username'
									name='username'
									type='text'
									autoComplete='username'
									required
									className={`${styles.inputField}`}
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor='displayName'
								className='block text-sm font-medium text-gray-300'>
								Display Name
							</label>
							<div className='mt-2'>
								<input
									onChange={onChangeHandler}
									id='displayName'
									name='displayName'
									type='text'
									autoComplete='name'
									required
									className={`${styles.inputField}`}
								/>
							</div>
						</div>

						<div>
							<button type='submit' className={styles.signUpButton}>
								Sign Up
							</button>
						</div>
					</form>

					<p className='mt-6 text-center text-sm text-gray-400'>
						Already have an account?{' '}
						<Link
							to='/app/login'
							className='font-semibold text-purple-400 hover:text-purple-300'>
							Sign In
						</Link>
					</p>
				</div>
				<ToastContainer />
			</div>
		</>
	);
}

export default RegisterPage;
