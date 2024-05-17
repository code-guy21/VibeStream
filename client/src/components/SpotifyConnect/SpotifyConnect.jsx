import { ReactComponent as SpotifyIcon } from '../../assets/images/spotify-logo.svg';

function SpotifyConnect() {
	const handleSpotifyLogin = async () => {
		window.location.href = 'http://localhost:3001/api/auth/spotify';
	};

	return (
		<div className='mt-10 sm:mx-auto sm:w-full sm:max-w-sm'>
			<div className='mt-10'>
				<div className='relative'>
					<div className='absolute inset-0 flex items-center'>
						<div className='w-full border-t border-gray-300' />
					</div>
				</div>
				<div className='mt-6 grid grid-cols-1 gap-3'>
					<div>
						<button
							onClick={handleSpotifyLogin}
							className='inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
							<SpotifyIcon className='h-5 w-5' />

							<span className='ml-2'>Spotify</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SpotifyConnect;
