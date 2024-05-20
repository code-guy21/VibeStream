import React, { useState, useEffect } from 'react';

function PlaybackControl({
	token,
	track,
	isPaused,
	isActive,
	player,
	setActive,
	setPaused,
	setPlayer,
}) {
	useEffect(() => {
		const script = document.createElement('script');
		script.src = 'https://sdk.scdn.co/spotify-player.js';
		script.async = true;
		document.body.appendChild(script);

		window.onSpotifyWebPlaybackSDKReady = () => {
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
	}, [token]);

	useEffect(() => {
		if (player && track?.uri && isActive) {
			player.addListener('player_state_changed', state => {
				setPaused(state.paused);
				console.log(state);
			});

			playTrack(track.uri, token);
		}
	}, [player, track, isActive, token]);

	async function setDeviceAsActive(device_id, token) {
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

	async function playTrack(uri, token) {
		player._options.getOAuthToken(access_token => {
			fetch(`https://api.spotify.com/v1/me/player/play`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${access_token}`,
				},
				body: JSON.stringify({ uris: [uri] }),
			})
				.then(response => {
					if (response.ok) {
						console.log('Track playback started');
					} else {
						console.error('Failed to start playback');
					}
				})
				.catch(error => console.error('Error playing track:', error));
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
