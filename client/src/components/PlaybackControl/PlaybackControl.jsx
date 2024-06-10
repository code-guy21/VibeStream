import React, { useState, useEffect, useRef } from 'react';
import { playTrack, setDeviceAsActive } from '../../api/spotify';

function PlaybackControl({ track, isPaused, isActive, setActive, setPaused }) {
	const [player, setPlayer] = useState(null);
	const [accessToken, setAccessToken] = useState('');
	const [deviceID, setDeviceID] = useState('');
	const playerSetupRef = useRef(false);

	useEffect(() => {
		async function fetchToken() {
			try {
				const res = await fetch('/api/spotify/token');
				const { token } = await res.json();

				if (token) {
					setAccessToken(token);
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
	}, []);

	function setUpPlayer(token) {
		const script = document.createElement('script');
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		script.async = true;
		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = async () => {
			const sdkPlayer = new window.Spotify.Player({
				name: 'Web Playback SDK',
				getOAuthToken: cb => cb(token),
				volume: 0.5,
			});

			setPlayer(sdkPlayer);

			sdkPlayer.addListener('ready', async ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				setActive(true);
				setDeviceID(device_id);
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
		if (player && track?.uri && isActive) {
			player.addListener('player_state_changed', state => {
				setPaused(state.paused);
				console.log(state);
			});
			playTrackHandler();
		}
	}, [player, track, isActive, accessToken, deviceID, setPaused]);

	const playTrackHandler = async () => {
		try {
			let response = await playTrack(track.uri, accessToken, deviceID);
			let data = await response.json();
			console.log('Track playback started:', data);
		} catch (error) {
			console.error('Error starting playback:', error);
		}
	};

	return (
		<div>
			{track?.uri ? (
				<div>
					<img src={track.album.images[0].url} alt='' />
					<button
						className='btn-spotify'
						onClick={() => {
							player.togglePlay().catch(error => {
								console.error('Error toggling playback:', error);
							});
						}}>
						{isPaused ? 'PLAY' : 'PAUSE'}
					</button>
				</div>
			) : (
				<p>No track selected</p>
			)}
		</div>
	);
}

export default PlaybackControl;
