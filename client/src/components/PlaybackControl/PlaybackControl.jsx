import React, { useState, useEffect } from 'react';

function PlaybackControl({
	track,
	isPaused,
	isActive,
	player,
	setActive,
	setPaused,
	setPlayer,
}) {
	const [accessToken, setAccessToken] = useState('');

	useEffect(() => {
		async function fetchToken() {
			try {
				let res = await fetch('/api/spotify/token');
				let { token } = await res.json();
				console.log(token);
				setAccessToken(token);
				setUpPlayer(token);
			} catch (error) {
				console.log(error);
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

			sdkPlayer.addListener('ready', async ({ device_id }) => {
				console.log('Ready with Device ID', device_id);
				setActive(true);
				await setDeviceAsActive(device_id, token);
			});

			sdkPlayer.connect();
			setPlayer(sdkPlayer);
		};
	}

	useEffect(() => {
		if (player && track?.uri && isActive) {
			player.addListener('player_state_changed', state => {
				setPaused(state.paused);
				console.log(state);
			});

			playTrack(track.uri, accessToken);
		}
	}, [player, track, isActive]);

	async function playTrack(uri, token) {
		player._options.getOAuthToken(async access_token => {
			try {
				let response = await fetch(
					`https://api.spotify.com/v1/me/player/play`,
					{
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${access_token}`,
						},
						body: JSON.stringify({ uris: [uri] }),
					}
				);

				if (response.ok) {
					console.log('Track playback started');
				} else {
					console.error('Failed to start playback');
				}
			} catch (error) {
				console.error('Error playing track:', error);
			}
		});
	}

	async function setDeviceAsActive(device_id, token) {
		console.log(token);
		await fetch(`https://api.spotify.com/v1/me/player`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				device_ids: [device_id],
				play: false,
			}),
		});
	}

	return (
		<div>
			{track?.uri ? (
				<div>
					<img src={track.album.images[0].url} alt='' />
					<button
						className='btn-spotify'
						onClick={() => {
							player.togglePlay();
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
