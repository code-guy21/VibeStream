import SpotifyLogo from '../../assets/images/Spotify_Logo_CMYK_Green.png'; // For PNG usage

function SpotifyConnect() {
	const handleSpotifyLogin = async () => {
		window.location.replace(
			`${process.env.REACT_APP_CLIENT_URL}/api/auth/spotify`
		);
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
							className='inline-flex w-full items-center justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500'>
							<img
								src={SpotifyLogo}
								alt='Connect with Spotify'
								className='h-auto w-auto max-h-8 max-w-32 object-contain mr-2' // Maintains aspect ratio
							/>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default SpotifyConnect;
