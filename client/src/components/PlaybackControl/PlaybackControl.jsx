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
	setContextURI,
} from '../../redux/reducers/playbackSlice';
import { playTrack, setDeviceAsActive } from '../../api/spotify';

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
		async function fetchToken() {
			if (state.user.loggedIn) {
				try {
					const res = await fetch('/api/spotify/token');
					const { token } = await res.json();

					if (token) {
						dispatch(setAccessToken(token));
						if (!playerSetupRef.current) {
							setUpPlayer(token);
							playerSetupRef.current = true;
						}
					}
				} catch (error) {
					console.log('Error fetching token:', error);
				}
			}
		}

		fetchToken();
	}, [state.user.loggedIn]);

	function setUpPlayer(token) {
		const script = document.createElement('script');
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		script.async = true;
		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = async () => {
			if (playerRef.current) return;

			const sdkPlayer = new window.Spotify.Player({
				name: 'Web Playback SDK',
				getOAuthToken: cb => cb(token),
				volume: 0.5,
			});

			playerRef.current = sdkPlayer;
			sdkPlayer.addListener('ready', async ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				dispatch(setActive(true));
				dispatch(setDeviceID(device_id));
				try {
					let response = await setDeviceAsActive(device_id);
					let data = await response.json();
					console.log('Device set as active:', data);
				} catch (error) {
					console.error('Error setting device as active:', error.message);
				}
			});

			sdkPlayer.addListener('player_state_changed', st => {
				console.log('changed');
				console.log(st);
				console.log(st.context.uri);
				console.log(stateRef.current);

				dispatch(setPaused(st?.paused));
				if (st.context.uri && stateRef.current.user.loggedIn) {
					dispatch(setContextURI(st.context.uri));
				}

				if (
					st.track_window.current_track.uri !==
						stateRef.current.playback.currentTrack?.uri &&
					stateRef.current.user.loggedIn
				) {
					if (!st.context.uri || st.context.uri === '-') {
						dispatch(setCurrentTrack(st.track_window.current_track));
					} else {
						dispatch(
							setCurrentTrack({ ...st.track_window.current_track, uri: null })
						);
					}
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
			(playerRef.current &&
				state.playback.isActive &&
				state.playback.currentTrack?.uri) ||
			(state.playback.contextURI && state.playback.contextURI !== '-')
		) {
			playTrackHandler();
		}
	}, [
		state.playback.currentTrack?.uri,
		state.playback.isActive,
		state.playback.contextURI,
	]);

	useEffect(() => {
		if (playerRef.current && state.playback.isPaused) {
			playerRef.current.pause();
		}
	}, [state.playback.isPaused]);

	useEffect(() => {
		if (playerRef.current && state.user.loggedIn) {
			dispatch(setActive(true));
		}
	}, [playerRef.current, state.user.loggedIn]);

	const playTrackHandler = async () => {
		try {
			let response = await playTrack(
				state.playback.currentTrack?.uri,
				state.deviceID,
				state.playback.contextURI
			);
			let data = await response.json();
			console.log('Track playback started:', data);
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
			{(state.playback?.currentTrack?.uri || state.playback.contextURI) &&
				state.playback.isActive && (
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
