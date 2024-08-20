import React from 'react';
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
import SpotifyLogo from '../../assets/images/Spotify_Logo_CMYK_Green.png';
import { PlayIcon } from '@heroicons/react/24/solid';
import styles from './Playback.module.css';

const Playback = () => {
	const state = useSelector(state => state.playback);
	const dispatch = useDispatch();

	async function search() {
		try {
			const resp = await searchTracks(state.searchTerm);
			const { data, accessToken, tokenExpiration } = await resp.json();

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
		<div
			className={`flex flex-col py-10 px-6 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white ${styles.playbackContainer}`}>
			<Fieldset className='flex flex-col items-center'>
				<Field className='flex justify-center items-center w-full max-w-xl'>
					<Input
						className='rounded-l-full bg-gray-700 text-white px-4 py-2 w-full focus:ring-2 focus:ring-green-500 focus:outline-none'
						placeholder='Search songs, albums, artists'
						onChange={e => dispatch(setSearchTerm(e.target.value))}
						type='text'
					/>
					<Button className={styles.purpleButton} onClick={search}>
						Search
					</Button>
				</Field>
			</Fieldset>
			<div className='flex flex-col mt-8'>
				{state.trackList?.map((t, i) => (
					<div
						key={i}
						className='flex items-center w-full h-16 bg-gray-800 rounded-lg shadow-md m-1'>
						<Button
							className={styles.albumArtContainer}
							onClick={() => {
								dispatch(setCurrentTrack(t));
								dispatch(setUri(t.uri));
								dispatch(setToggle(true));
							}}
							key={i}>
							<img
								className='w-16 h-full rounded-lg shadow-lg'
								src={t.album.images[0].url}
								alt={t.name}
							/>
							<PlayIcon className={styles.playIconOverlay} />
						</Button>
						<div className='flex flex-1 flex-col px-2 overflow-hidden'>
							<div
								className={`${styles.textMd} font-medium text-white ${styles.textEllipsis} flex items-center`}>
								<a
									href={`https://open.spotify.com/track/${t.id}`}
									target='_blank'
									rel='noopener noreferrer'
									className='hover:text-green-500 flex-1'>
									{t.name}
								</a>
								<img
									src={SpotifyLogo}
									alt='Spotify Logo'
									className='inline-block h-4 ml-2 flex-shrink-0'
								/>
							</div>
							<div
								className={`${styles.textSm} text-gray-400 ${styles.textEllipsis}`}>
								<a
									href={`https://open.spotify.com/artist/${t.artists[0].id}`}
									target='_blank'
									rel='noopener noreferrer'
									className='hover:text-green-500'>
									{t.artists.map(art => art.name).join(', ')}
								</a>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default Playback;
