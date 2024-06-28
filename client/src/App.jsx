import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAuthStatus } from './redux/reducers/userSlice';
import Navbar from './components/Navbar';
import PlaybackControl from './components/PlaybackControl/PlaybackControl';

function App() {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(fetchAuthStatus());
	}, [dispatch]);
	return (
		<div>
			<Navbar />
			<Outlet />
			<PlaybackControl></PlaybackControl>
		</div>
	);
}

export default App;
