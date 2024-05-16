import { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback';

function Search() {
	const [searchTerm, setSearchTerm] = useState('');
	const [results, setResults] = useState([]);
	const [track, setTrack] = useState({});
	const [token, setToken] = useState('');

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

	useEffect(() => {
		let storedToken = localStorage.getItem('access_token');

		setToken(storedToken);
	});

	return (
		<>
			<label>search</label>
			<input onChange={e => setSearchTerm(e.target.value)} type='text'></input>
			<button onClick={searchTracks}>submit</button>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				{results?.map((t, i) => {
					return (
						<button onClick={() => setTrack(t)} key={i}>
							{t.name}
						</button>
					);
				})}
				<WebPlayback track={track} token={token} />
			</div>
		</>
	);
}

export default Search;
