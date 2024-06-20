export const playTrack = (uri, deviceID, context_uri) =>
	fetch('/api/spotify/play', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			uris: uri ? [uri] : null,
			device_id: deviceID,
			context_uri: context_uri !== '-' ? context_uri : '',
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
