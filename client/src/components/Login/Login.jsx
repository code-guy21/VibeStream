import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/reducers/userSlice';
import { login } from '../../api/user';
import { ToastContainer, toast } from 'react-toastify';
import logo from '../../assets/images/vibestream-logo.svg';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';

function Login() {
	const state = useSelector(state => state.user);
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [form, setForm] = useState({
		email: '',
		password: '',
	});

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
				navigate('/');
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

	if (state.loading || state.loggedIn) {
		return null;
	}

	return (
		<>
			<div
				className={`flex min-h-screen flex-col justify-center items-center ${styles.pageBackground}`}>
				<div className='sm:mx-auto sm:w-full sm:max-w-sm text-center'>
					<img
						className='mx-auto h-16 w-auto mb-8'
						src={logo}
						alt='VibeStream Logo'
					/>
					<h2
						className={`${styles.heading} text-3xl font-bold text-white mb-6`}>
						Sign in to your account
					</h2>
				</div>

				<div className='mt-8 sm:mx-auto sm:w-full sm:max-w-sm'>
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
							<div className='flex items-center justify-between'>
								<label
									htmlFor='password'
									className='block text-sm font-medium text-gray-300'>
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
									className={`${styles.inputField}`}
								/>
							</div>
						</div>

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
