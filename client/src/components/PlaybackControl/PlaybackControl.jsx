import React, { useState, useEffect, useRef } from 'react';
import {
	PlayIcon,
	PauseIcon,
	BackwardIcon,
	ForwardIcon,
} from '@heroicons/react/24/solid';
import playerStyles from './PlaybackControl.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {
	setAccessToken,
	setDeviceID,
	setPaused,
	setActive,
} from '../../redux/reducers/playbackSlice';
import { playTrack, setDeviceAsActive } from '../../api/spotify';

function PlaybackControl() {
	const state = useSelector(state => state);
	const dispatch = useDispatch();
	const playerRef = useRef(null);
	const playerSetupRef = useRef(false);

	useEffect(() => {
		async function fetchToken() {
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

			sdkPlayer.addListener('not_ready', ({ device_id }) => {
				console.log('Device ID has gone offline', device_id);
			});

			sdkPlayer.connect();
		};
	}

	useEffect(() => {
		if (
			playerRef.current &&
			state.playback.currentTrack?.uri &&
			state.playback.isActive
		) {
			playerRef.current.addListener('player_state_changed', st => {
				dispatch(setPaused(st?.paused));
				console.log(st);
			});
			playTrackHandler();
		}
	}, [
		state.playback.currentTrack,
		state.playback.isActive,
		state.playback.accessToken,
		state.playback.deviceID,
	]);

	const playTrackHandler = async () => {
		try {
			let response = await playTrack(
				state.playback.currentTrack.uri,
				state.deviceID
			);
			let data = await response.json();
			console.log('Track playback started:', data);
		} catch (error) {
			console.error('Error starting playback:', error);
		}
	};

	return (
		<>
			{state.playback.currentTrack?.uri && (
				<div className={playerStyles.player}>
					<img src={state.playback.currentTrack.album.images[0].url} alt='' />
					<div className={playerStyles.control}>
						<button
							className='btn-spotify p-1 m-1'
							onClick={() => {
								playerRef.current.previousTrack().catch(error => {
									console.error('Error playing previous track:', error);
								});
							}}>
							<BackwardIcon className='h-6 w-6'></BackwardIcon>
						</button>
						<button
							className='btn-spotify p-2 m-2'
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
						<button
							className='btn-spotify p-1 m-1'
							onClick={() => {
								playerRef.current.nextTrack().catch(error => {
									console.error('Error playing next track:', error);
								});
							}}>
							<ForwardIcon className='h-6 w-6'></ForwardIcon>
						</button>
					</div>
				</div>
			)}
		</>
	);
}

export default PlaybackControl;
