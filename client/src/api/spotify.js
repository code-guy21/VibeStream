export const playTrack = (deviceID, uri, togglePlayback, type) =>
	fetch('/api/spotify/play', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uris: uri ? [uri] : null,
			device_id: deviceID ? deviceID : null,
			togglePlayback,
		}),
	});

export const setDeviceAsActive = device_id =>
	fetch('/api/spotify/set', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ device_id }),
	});
