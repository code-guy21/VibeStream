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
			const { currentTrack } = state.playback;
			if (
				playerRef.current &&
				state.playback.isActive &&
				state.user.loggedIn &&
				currentTrack
			) {
				try {
					let response = await fetchAudioAnalysis(currentTrack.id);

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

					const currentTrack = st.track_window.current_track;
					if (
						currentTrack &&
						currentTrack.id !== stateRef.current.playback.currentTrack?.id
					) {
						console.log('Track changed, setting analysis loading to true');
						dispatch(setCurrentTrack(currentTrack));

						dispatch(setAnalysisLoading(true));
					}

					dispatch(setTrackState(st));
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

	const trackNameRef = useRef(null);
	const artistNameRef = useRef(null);

	useEffect(() => {
		const setScrollWidth = element => {
			if (element && element.scrollWidth > element.clientWidth) {
				const scrollDistance = element.scrollWidth - element.clientWidth;
				element.style.setProperty('--scroll-width', `-${scrollDistance}px`);
			}
		};

		setScrollWidth(trackNameRef.current);
		setScrollWidth(artistNameRef.current);
	}, [state.playback.currentTrack]);

	return (
		<>
			{state.playback.isActive && state.user.loggedIn && (
				<div className={`${playerStyles.player} flex items-center px-2 py-1`}>
					<div className='flex items-center w-1/3 min-w-0'>
						{state.playback.currentTrack?.album?.images[0]?.url && (
							<img
								className='h-12 w-12 object-cover flex-shrink-0 mr-2'
								src={state.playback.currentTrack.album.images[0].url}
								alt=''
							/>
						)}
						<div className='flex flex-col justify-center overflow-hidden min-w-0'>
							<div
								className={`${playerStyles.scrollContainer} text-sm font-bold`}>
								<div ref={trackNameRef} className={playerStyles.scrollText}>
									{state.playback.currentTrack?.name || 'No Track Playing'}
								</div>
							</div>
							<div className={`${playerStyles.scrollContainer} text-xs`}>
								<div ref={artistNameRef} className={playerStyles.scrollText}>
									{state.playback.currentTrack?.artists
										?.map(item => item.name)
										.join(', ') || 'Unknown Artist'}
								</div>
							</div>
						</div>
					</div>

					<div className='flex justify-center items-center w-1/3'>
						<button
							className='btn-playback p-1'
							onClick={() => {
								playerRef.current.previousTrack().catch(error => {
									console.error('Error playing previous track:', error);
								});
							}}>
							<BackwardIcon className='h-5 w-5'></BackwardIcon>
						</button>
						<button
							className='btn-playback p-1 mx-2'
							onClick={handleTogglePlay}>
							{state.playback.isPaused ? (
								<PlayIcon className='h-8 w-8'></PlayIcon>
							) : (
								<PauseIcon className='h-8 w-8'></PauseIcon>
							)}
						</button>
						<button className='btn-playback p-1' onClick={handleNextTrack}>
							<ForwardIcon className='h-5 w-5'></ForwardIcon>
						</button>
					</div>

					<div className='flex justify-center items-center w-1/3 space-x-2'>
						<HandThumbUpIcon className='h-5 w-5'></HandThumbUpIcon>
						<HandThumbDownIcon className='h-5 w-5'></HandThumbDownIcon>
					</div>
				</div>
			)}
		</>
	);
}

export default PlaybackControl;
