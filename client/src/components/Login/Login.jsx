import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/reducers/userSlice';
import { login } from '../../api/user';
import { ToastContainer, toast } from 'react-toastify';
import logo from '../../assets/images/vibestream-logo.svg';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Login() {
	const state = useSelector(state => state.user);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [form, setForm] = useState({
		email: '',
		password: '',
	});
	const [showPassword, setShowPassword] = useState(false);

	useEffect(() => {
		if (!state.loading && state.loggedIn) {
			navigate('/app');
		}
	}, [state.loggedIn, state.loading]);

	async function submitHandler(e) {
		e.preventDefault();

		try {
			let res = await login(form);
			let data = await res.json();

			if (res.status === 401 || res.status === 500) {
				toast.error(data.message);
			} else {
				dispatch(loginUser(data));
				navigate('/app');
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

	function togglePasswordVisibility() {
		setShowPassword(!showPassword);
	}

	if (state.loading || state.loggedIn) {
		return null;
	}

	return (
		<>
			<div
				className={`flex min-h-screen flex-col justify-center items-center ${styles.pageBackground}`}>
				<div className='sm:mx-auto sm:w-full sm:max-w-sm text-center'>
					<h2
						className={`${styles.heading} text-3xl font-bold text-white mb-6`}>
						Sign in to your account
					</h2>

					<p className='text-sm text-yellow-400 mb-4'>
						This is a demo. Use <strong>vibestreamtest@gmail.com</strong> and{' '}
						<strong>vibestreamtest123456</strong> to sign in.
					</p>
				</div>

				<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-sm'>
					<form className='space-y-6' onSubmit={submitHandler}>
						{/* Email Input */}
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

						{/* Password Input */}
						<div>
							<div className='flex items-center justify-between'>
								<label
									htmlFor='password'
									className='block text-sm font-medium text-gray-300'>
									Password
								</label>
							</div>
							<div className='mt-2 relative'>
								<input
									onChange={onChangeHandler}
									id='password'
									name='password'
									type={showPassword ? 'text' : 'password'}
									autoComplete='current-password'
									required
									className={`${styles.inputField} pr-10`}
								/>
								<button
									type='button'
									onClick={togglePasswordVisibility}
									className='absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5'>
									{showPassword ? (
										<EyeSlashIcon className='h-5 w-5 text-gray-400' />
									) : (
										<EyeIcon className='h-5 w-5 text-gray-400' />
									)}
								</button>
							</div>
						</div>

						{/* Sign-In Button */}
						<div>
							<button type='submit' className={`${styles.signInButton}`}>
								Sign in
							</button>
						</div>
					</form>

					<p className='mt-6 text-center text-sm text-gray-400'>
						Don't have an account?{' '}
						<Link
							to='/app/register'
							className='font-semibold text-purple-400 hover:text-purple-300'>
							Sign up
						</Link>
					</p>
				</div>

				<ToastContainer />
			</div>
		</>
	);
}

export default Login;
