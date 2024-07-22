import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuthStatus, logoutUser } from './redux/reducers/userSlice';
import { getAuthStatus } from './api/user';
import Navbar from './components/Navbar';
import PlaybackControl from './components/PlaybackControl/PlaybackControl';

function App() {
	const user = useSelector(state => state.user);
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchAuthStatus());

		const checkAuthStatus = async () => {
			try {
				let response = await getAuthStatus();

				const userData = await response.json();

				if (!userData.loggedIn) {
					dispatch(logoutUser());
				}
			} catch (error) {
				console.log(error);
			}
		};

		let authInterval;

		if (user.loggedIn && !authInterval) {
			authInterval = setInterval(checkAuthStatus, 1000 * 60 * 5);
		}

		return () => {
			if (authInterval) {
				clearInterval(authInterval);
			}
		};
	}, [user.loggedIn]);

	return (
		<div>
			<Navbar />
			<Outlet />
			<PlaybackControl></PlaybackControl>
		</div>
	);
}

export default App;
