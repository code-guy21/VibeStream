import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import PlaybackControl from './components/PlaybackControl/PlaybackControl';

function App() {
	return (
		<div>
			<Navbar />
			<Outlet />
			<PlaybackControl></PlaybackControl>
		</div>
	);
}

export default App;
