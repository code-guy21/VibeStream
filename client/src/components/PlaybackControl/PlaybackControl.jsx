import React, { useEffect, useRef } from 'react';
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
	setTrackState,
	setAnalysisLoading,
} from '../../redux/reducers/playbackSlice';
import {
	fetchToken,
	playTrack,
	setDeviceAsActive,
	fetchAudioAnalysis,
} from '../../api/spotify';
import { debounce } from 'lodash';

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
					dispatch(setAnalysisLoading(false));
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

			sdkPlayer.addListener(
				'player_state_changed',
				debounce(st => {
					console.log('changed');
					console.log(st);

					if (
						new Date(stateRef.current.playback.tokenExpiration) < new Date()
					) {
						dispatch(setTokenExpired(true));
					}

					if (st.context?.uri) {
						dispatch(setUri(st.context.uri));
					}

					// Update paused state only if it has changed
					if (st.paused !== stateRef.current.playback.isPaused) {
						dispatch(setPaused(st.paused));
					}

					if (
						st.track_window.current_track.id !==
						stateRef.current.playback.currentTrack.id
					) {
						console.log('Track changed, setting analysis loading to true');
						dispatch(setCurrentTrack(st.track_window.current_track));

						dispatch(setAnalysisLoading(true));
					}

					dispatch(setTrackState(st));

					// // Immediate sync for animation timing
					// if (st.paused !== stateRef.current.playback.isPaused) {
					// 	syncAnimationState(st.paused);
					// }
				}, 300)
			);

			sdkPlayer.addListener('not_ready', ({ device_id }) => {
				console.log('Device ID has gone offline', device_id);
			});

			sdkPlayer.connect();
		};
	}

	// const syncAnimationState = async isPaused => {
	// 	if (playerRef.current) {
	// 		const state = await playerRef.current.getCurrentState();
	// 		if (state) {
	// 			dispatch(setPaused(state.paused));
	// 		}
	// 	}
	// };

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

	const handleTogglePlay = async () => {
		try {
			await playerRef.current.togglePlay();
			// Explicitly handle state after toggling play
			// setTimeout(() => {
			// 	playerRef.current.getCurrentState().then(state => {
			// 		if (state && state.paused !== stateRef.current.playback.isPaused) {
			// 			dispatch(setPaused(state.paused));
			// 		}
			// 	});
			// }, 500);
		} catch (error) {
			console.error('Error toggling playback:', error);
		}
	};

	// Enhanced fallback mechanism to check paused state more frequently after track change or play/pause toggle
	// useEffect(() => {
	// 	const checkState = () => {
	// 		if (playerRef.current) {
	// 			playerRef.current.getCurrentState().then(state => {
	// 				if (state && state.paused !== stateRef.current.playback.isPaused) {
	// 					dispatch(setPaused(state.paused));
	// 				}
	// 			});
	// 		}
	// 	};

	// 	const interval = setInterval(checkState, 500);

	// 	return () => clearInterval(interval);
	// }, []);

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
						<div className='flex flex-col justify-center overflow-hidden'>
							<div className={`${playerStyles.info} text-sm font-bold track`}>
								<p className={playerStyles.scrollText}>
									{state.playback.currentTrack.name}
								</p>
							</div>
							<div className={`${playerStyles.info} text-sm`}>
								<p className={playerStyles.scrollText}>
									{state.playback.currentTrack?.artists
										?.map(item => item.name)
										.join(',')}
								</p>
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
						<button className='btn-spotify' onClick={handleTogglePlay}>
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
