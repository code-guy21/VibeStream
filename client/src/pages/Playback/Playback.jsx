import { Input, Label, Field, Fieldset, Button } from '@headlessui/react';
import { useSelector, useDispatch } from 'react-redux';
import { searchTracks } from '../../api/spotify';
import {
	setSearchTerm,
	setTrackList,
	setCurrentTrack,
	setUri,
	setAccessToken,
	setToggle,
	setType,
	setTokenExpiration,
	setTokenExpired,
} from '../../redux/reducers/playbackSlice';

const Playback = () => {
	const state = useSelector(state => state.playback);
	const dispatch = useDispatch();

	async function search() {
		try {
			const resp = await searchTracks(state.searchTerm);
			const { data, accessToken, tokenExpiration } = await resp.json();

			console.log(data.tracks.items, accessToken);

			if (state.accessToken !== accessToken) {
				dispatch(setAccessToken(accessToken));
				dispatch(setTokenExpiration(tokenExpiration));
				dispatch(setTokenExpired(false));
			}

			dispatch(setTrackList(data.tracks.items));
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<div className='flex flex-col py-10 px-6 min-h-full'>
			<Fieldset>
				<Field className='flex justify-center'>
					<Input
						className='rounded-md flex-1'
						placeholder='Search songs, albums, artists'
						onChange={e => dispatch(setSearchTerm(e.target.value))}
						type='text'></Input>
					<Button
						className='flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
						onClick={search}>
						submit
					</Button>
				</Field>
			</Fieldset>
			<div className='flex flex-col mt-5'>
				{state.trackList?.map((t, i) => {
					return (
						<div key={i} className='flex w-full h-16 m-1  border-2'>
							<Button
								onClick={() => {
									dispatch(setCurrentTrack(t));
									dispatch(setUri(t.uri));
									dispatch(setToggle(true));
								}}
								key={i}>
								<img className='w-16 h-full' src={t.album.images[0].url}></img>
							</Button>
							<div className='flex flex-1 flex-col px-2'>
								<div className='text-md font-medium'>{t.name}</div>
								<div className='text-sm'>
									{t.artists
										.map(art => {
											return art.name;
										})
										.join(', ')}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Playback;
