export const playTrack = (uri, deviceID) =>
	fetch('/api/spotify/play', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ uris: [uri], device_id: deviceID }),
	});

export const setDeviceAsActive = device_id =>
	fetch('/api/spotify/set', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ device_id }),
	});
