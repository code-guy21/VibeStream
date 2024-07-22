export const logoutMiddleware = store => next => action => {
	if (action.type === 'user/logoutUser') {
		store.dispatch({ type: 'playback/clearPlayback' });
	}

	return next(action);
};
