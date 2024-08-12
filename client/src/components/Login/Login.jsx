import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/reducers/userSlice';
import { login } from '../../api/user';
import { ToastContainer, toast } from 'react-toastify';
import logo from '../../assets/images/vibestream-logo.svg';
import { Link } from 'react-router-dom';

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
						Sign in to your account
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
							<button
								type='submit'
								className='flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'>
								Sign in
							</button>
						</div>
					</form>

					<p className='mt-10 text-center text-sm text-gray-500'>
						Don't have an account?{' '}
						<Link
							to='/app/register'
							className='font-semibold leading-6 text-indigo-600 hover:text-indigo-500'>
							Sign up
						</Link>
					</p>
				</div>

				<ToastContainer></ToastContainer>
			</div>
		</>
	);
}

export default Login;
