import { useState, useEffect } from 'react';
import PlayBackPage from '../../pages/PlaybackPage';

const PlayBack = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [results, setResults] = useState([]);
	const [track, setTrack] = useState({});
	const [token, setToken] = useState('');
	const [isPaused, setPaused] = useState(false);
	const [isActive, setActive] = useState(false);
	const [player, setPlayer] = useState(null);

	async function searchTracks() {
		try {
			const resp = await fetch(
				`/api/spotify/search?term=${searchTerm}&type=track`
			);
			const data = await resp.json();

			console.log(data.tracks.items);

			setResults(data.tracks.items);
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<>
			<PlayBackPage
				setPaused={setPaused}
				setActive={setActive}
				setPlayer={setPlayer}
				isPaused={isPaused}
				isActive={isActive}
				player={player}
				setSearchTerm={setSearchTerm}
				searchTracks={searchTracks}
				results={results}
				setTrack={setTrack}
				track={track}></PlayBackPage>
		</>
	);
};

export default PlayBack;
