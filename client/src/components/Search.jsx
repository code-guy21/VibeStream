import { useState } from 'react';
import WebPlayback from './WebPlayback';

function Search() {
	const [searchTerm, setSearchTerm] = useState('');
	const [results, setResults] = useState([]);
	const [track, setTrack] = useState({});

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
				<WebPlayback
					track={track}
					token='BQBC6Sffg3dn0_d4ylQDX5ONB4R6062rlvVRkec9U9Cass2280SZKU4PKtcBP57xOxsXGVNFZXT8I_9IkBRacefdgfhd_dbXPwmbRPV4pPFSFRzuZr7KcyFF8i_y-ATemtseRr4Nxugw7UA9VCSSUCSSGrWPrkjpZedArX8ZjblnZJDUgT4jVws-_0mGGWjeoK67gQ'
				/>
			</div>
		</>
	);
}

export default Search;
