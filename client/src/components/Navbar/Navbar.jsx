import { Fragment, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/reducers/userSlice';
import { logout } from '../../api/user';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/images/vibestream-logo.svg';
import defaultProfileIcon from '../../assets/images/default-profile-icon.svg';

function classNames(...classes) {
	return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
	const dispatch = useDispatch();
	const state = useSelector(state => state.user);
	const location = useLocation();
	const [navigation, setNavigation] = useState([]);

	useEffect(() => {
		console.log(location);
		if (!state.loading) {
			setNavigation([
				{
					name: 'Home',
					href: '/app',
					current: location.pathname === '/app',
					active: state.loggedIn,
				},

				{
					name: 'Search',
					href: '/app/playback',
					current: location.pathname === '/app/playback',
					active: state.loggedIn,
				},
				{
					name: 'Visual',
					href: '/app/visual',
					current: location.pathname === '/app/visual',
					active: state.loggedIn,
				},
				{
					name: 'Services',
					href: '/app/service',
					current: location.pathname === '/app/service',
					active: state.loggedIn,
				},

				{
					name: 'Login',
					href: '/app/login',
					current: location.pathname === '/app/login',
					active: !state.loggedIn,
				},
				{
					name: 'Register',
					href: '/app/register',
					current: location.pathname === '/app/register',
					active: !state.loggedIn,
				},
				{
					name: 'Logout',
					href: false,
					active: state.loggedIn,
					action: async () => {
						try {
							const response = await logout();
							const data = await response.json();
							dispatch(logoutUser());
						} catch (error) {
							console.log(error);
						}
					},
				},
			]);
		}
	}, [location.pathname, state.loggedIn, state.loading]);

	// Hide Navbar on Landing Page

	if (location.pathname === '/') {
		return null;
	}

	return (
		<Disclosure as='nav' className='bg-gray-800 fixed top-0 left-0 w-full z-50'>
			{({ open }) => (
				<>
					<div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
						<div className='relative flex h-16 items-center justify-between'>
							<div className='absolute inset-y-0 left-0 flex items-center sm:hidden'>
								{/* Mobile menu button*/}
								<Disclosure.Button className='relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white'>
									<span className='absolute -inset-0.5' />
									<span className='sr-only'>Open main menu</span>
									{open ? (
										<XMarkIcon className='block h-6 w-6' aria-hidden='true' />
									) : (
										<Bars3Icon className='block h-6 w-6' aria-hidden='true' />
									)}
								</Disclosure.Button>
							</div>
							<div className='flex flex-1 items-center justify-center sm:items-stretch sm:justify-start'>
								<Link to='/app'>
									<div className='flex flex-shrink-0 items-center'>
										<img className='h-8 w-auto' src={logo} alt='VibeStream' />
									</div>
								</Link>

								<div className='hidden sm:ml-6 sm:block'>
									<div className='flex space-x-4'>
										{navigation.map(
											item =>
												item.active &&
												(item.href ? (
													<Link
														key={item.name}
														to={item.href}
														className={classNames(
															item.current
																? 'bg-gray-900 text-white'
																: 'text-gray-300 hover:bg-gray-700 hover:text-white',
															'rounded-md px-3 py-2 text-sm font-medium'
														)}
														aria-current={item.current ? 'page' : undefined}>
														{item.name}
													</Link>
												) : (
													<button
														key={item.name}
														onClick={item.action}
														className={classNames(
															item.current
																? 'bg-gray-900 text-white'
																: 'text-gray-300 hover:bg-gray-700 hover:text-white',
															'rounded-md px-3 py-2 text-sm font-medium'
														)}
														aria-current={item.current ? 'page' : undefined}>
														{item.name}
													</button>
												))
										)}
									</div>
								</div>
							</div>

							{state.loggedIn && (
								<div className='absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0'>
									<button
										type='button'
										className='relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'>
										<span className='absolute -inset-1.5' />
										<span className='sr-only'>View notifications</span>
										<BellIcon className='h-6 w-6' aria-hidden='true' />
									</button>

									{/* Profile dropdown */}
									<Menu as='div' className='relative ml-3'>
										<div>
											<Menu.Button className='relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800'>
												<span className='absolute -inset-1.5' />
												<span className='sr-only'>Open user menu</span>
												{state.user && state.user.profileImage ? (
													<img
														className='h-8 w-8 rounded-full'
														src={state.user.profileImage}
														alt=''
													/>
												) : (
													<img
														className='h-8 w-8 rounded-full'
														src={defaultProfileIcon}
														alt=''
													/>
												)}
											</Menu.Button>
										</div>
										<Transition
											as={Fragment}
											enter='transition ease-out duration-100'
											enterFrom='transform opacity-0 scale-95'
											enterTo='transform opacity-100 scale-100'
											leave='transition ease-in duration-75'
											leaveFrom='transform opacity-100 scale-100'
											leaveTo='transform opacity-0 scale-95'>
											<Menu.Items className='absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
												<Menu.Item>
													{({ active }) => (
														<a
															href='#'
															className={classNames(
																active ? 'bg-gray-100' : '',
																'block px-4 py-2 text-sm text-gray-700'
															)}>
															Your Profile
														</a>
													)}
												</Menu.Item>
												<Menu.Item>
													{({ active }) => (
														<a
															href='#'
															className={classNames(
																active ? 'bg-gray-100' : '',
																'block px-4 py-2 text-sm text-gray-700'
															)}>
															Settings
														</a>
													)}
												</Menu.Item>
												<Menu.Item>
													{({ active }) => (
														<a
															href='#'
															className={classNames(
																active ? 'bg-gray-100' : '',
																'block px-4 py-2 text-sm text-gray-700'
															)}>
															Sign out
														</a>
													)}
												</Menu.Item>
											</Menu.Items>
										</Transition>
									</Menu>
								</div>
							)}
						</div>
					</div>

					<Disclosure.Panel className='sm:hidden'>
						<div className='space-y-1 px-2 pb-3 pt-2'>
							{navigation.map(
								(item, i) =>
									item.active &&
									(item.href ? (
										<Link
											key={i}
											to={item.href}
											className={classNames(
												item.current
													? 'bg-gray-900 text-white'
													: 'text-gray-300 hover:bg-gray-700 hover:text-white',
												'block rounded-md px-3 py-2 text-base font-medium'
											)}
											aria-current={item.current ? 'page' : undefined}>
											{item.name}
										</Link>
									) : (
										<button
											key={item.name}
											as='a'
											onClick={item.action}
											className={classNames(
												item.current
													? 'bg-gray-900 text-white'
													: 'text-gray-300 hover:bg-gray-700 hover:text-white',
												'block rounded-md px-3 py-2 text-base font-medium'
											)}
											aria-current={item.current ? 'page' : undefined}>
											{item.name}
										</button>
									))
							)}
						</div>
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	);
}
