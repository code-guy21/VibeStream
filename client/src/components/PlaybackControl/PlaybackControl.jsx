import React, { useState, useEffect, useRef } from 'react';
import {
	PlayIcon,
	PauseIcon,
	BackwardIcon,
	ForwardIcon,
	HandThumbUpIcon,
	HandThumbDownIcon,
} from '@heroicons/react/24/solid';
import playerStyles from './PlaybackControl.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {
	setCurrentTrack,
	setAccessToken,
	setDeviceID,
	setPaused,
	setActive,
	setUri,
	setToggle,
	setTokenExpiration,
	setTokenExpired,
	setAudioAnalysis,
} from '../../redux/reducers/playbackSlice';
import {
	fetchToken,
	playTrack,
	setDeviceAsActive,
	fetchAudioAnalysis,
} from '../../api/spotify';

function PlaybackControl() {
	const state = useSelector(state => state);
	const dispatch = useDispatch();
	const playerRef = useRef(null);
	const playerSetupRef = useRef(false);
	const stateRef = useRef(state);

	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	useEffect(() => {
		async function getToken() {
			if (state.user.loggedIn) {
				try {
					const res = await fetchToken();
					const { token, tokenExpiration } = await res.json();

					if (token) {
						dispatch(setAccessToken(token));
						dispatch(setTokenExpiration(tokenExpiration));
						dispatch(setTokenExpired(false));
						if (!playerSetupRef.current) {
							setUpPlayer();
							playerSetupRef.current = true;
						} else if (playerRef.current) {
							playerRef.current._options.getOAuthToken = cb => cb(token);
						}
					}
				} catch (error) {
					console.log('Error fetching token:', error);
				}
			}
		}

		getToken();
	}, [state.user.loggedIn, state.playback.tokenExpired]);

	useEffect(() => {
		async function getAudioAnalysis() {
			if (playerRef.current && state.playback.isActive && state.user.loggedIn) {
				try {
					let response = await fetchAudioAnalysis(
						state.playback.currentTrack.id
					);

					let analysis = await response.json();

					dispatch(setAudioAnalysis(analysis));
				} catch (error) {
					console.log('Error fetching audio analysis', error);
				}
			}
		}

		getAudioAnalysis();
	}, [state.playback.currentTrack]);

	function setUpPlayer() {
		const script = document.createElement('script');
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		script.async = true;
		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = async () => {
			if (playerRef.current) return;

			const sdkPlayer = new window.Spotify.Player({
				name: 'Web Playback SDK',
				getOAuthToken: cb => cb(stateRef.current.playback.accessToken),
				volume: 0.5,
			});

			playerRef.current = sdkPlayer;

			sdkPlayer.addListener('ready', async ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				dispatch(setActive(true));
				dispatch(setDeviceID(device_id));
				try {
					let response = await setDeviceAsActive(device_id);
					let { message, accessToken, tokenExpiration } = await response.json();

					if (stateRef.current.playback.accessToken !== accessToken) {
						dispatch(setAccessToken(accessToken));
						dispatch(setTokenExpiration(tokenExpiration));
						dispatch(setTokenExpiration(false));
					}
					console.log(message, accessToken);
				} catch (error) {
					console.error('Error setting device as active:', error.message);
				}
			});

			sdkPlayer.addListener('player_state_changed', st => {
				console.log('changed');
				console.log(st);

				if (new Date(stateRef.current.playback.tokenExpiration) < new Date()) {
					dispatch(setTokenExpired(true));
				}

				if (st.context?.uri) {
					dispatch(setUri(st.context.uri));
				}

				dispatch(setPaused(st.paused));

				if (
					st.track_window.current_track.id !==
					stateRef.current.playback.currentTrack.id
				) {
					dispatch(setCurrentTrack(st.track_window.current_track));
				}
			});

			sdkPlayer.addListener('not_ready', ({ device_id }) => {
				console.log('Device ID has gone offline', device_id);
			});

			sdkPlayer.connect();
		};
	}

	useEffect(() => {
		if (
			playerRef.current &&
			state.playback.isActive &&
			state.playback.togglePlayback
		) {
			playTrackHandler();
		}
	}, [state.playback.togglePlayback, state.user.loggedIn]);

	useEffect(() => {
		if (playerRef.current && state.user.loggedIn) {
			dispatch(setActive(true));
		}
	}, [playerRef.current, state.user.loggedIn]);

	useEffect(() => {
		let stopPlayback = async () => {
			if (playerRef.current && !state.user.loggedIn) {
				try {
					await playerRef.current.pause();
					console.log('player is paused!');
				} catch (error) {
					console.log(error);
				}
			}
			dispatch(setPaused(true));
		};

		stopPlayback();
	}, [state.user.loggedIn]);

	const playTrackHandler = async () => {
		try {
			let response = await playTrack(
				state.playback.deviceID,
				state.playback.uri,
				state.playback.togglePlayback
			);
			let { message, accessToken, tokenExpiration } = await response.json();

			if (state.playback.accessToken !== accessToken) {
				dispatch(setAccessToken(accessToken));
				dispatch(setTokenExpiration(tokenExpiration));
				dispatch(setTokenExpiration(false));
			}

			if (state.playback.togglePlayback) {
				dispatch(setToggle(false));
			}
			console.log(message);
		} catch (error) {
			console.error('Error starting playback:', error);
		}
	};

	const handleNextTrack = async () => {
		try {
			let res = await playerRef.current.nextTrack();
			console.log(res);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<>
			{state.playback.isActive && state.user.loggedIn && (
				<div className={playerStyles.player}>
					<div className='flex h-16 flex-1'>
						<img
							className='p-2'
							src={state.playback.currentTrack?.album?.images[0].url}
							alt=''
						/>
						<div className='flex flex-col justify-center'>
							<div className='text-sm font-bold'>
								{state.playback.currentTrack.name}
							</div>
							<div className='text-sm'>
								{state.playback.currentTrack?.artists
									?.map(item => item.name)
									.join(',')}
							</div>
						</div>
					</div>

					<div className='flex flex-1 h-16 justify-center'>
						<button
							className='btn-spotify'
							onClick={() => {
								playerRef.current.previousTrack().catch(error => {
									console.error('Error playing previous track:', error);
								});
							}}>
							<BackwardIcon className='h-6 w-6'></BackwardIcon>
						</button>
						<button
							className='btn-spotify'
							onClick={() => {
								playerRef.current.togglePlay().catch(error => {
									console.error('Error toggling playback:', error);
								});
							}}>
							{state.playback.isPaused ? (
								<PlayIcon className='h-12 w-12'></PlayIcon>
							) : (
								<PauseIcon className='h-12 w-12'></PauseIcon>
							)}
						</button>
						<button className='btn-spotify' onClick={handleNextTrack}>
							<ForwardIcon className='h-6 w-6'></ForwardIcon>
						</button>
					</div>

					<div className='flex flex-1 h-16 justify-center items-center gap-x-6'>
						<HandThumbUpIcon className='h-6 w-6'></HandThumbUpIcon>
						<HandThumbDownIcon className='h-6 w-6'></HandThumbDownIcon>
					</div>
				</div>
			)}
		</>
	);
}

export default PlaybackControl;
