import SpotifyConnect from '../../components/SpotifyConnect';
import logo from '../../assets/images/vibestream-logo.svg';

function ServicePage() {
	return (
		<div className='container'>
			<>
				<div className='flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8'>
					<div className='sm:mx-auto sm:w-full sm:max-w-sm'>
						<img
							className='mx-auto h-10 w-auto'
							src={logo}
							alt='Your Company'
						/>
						<h2 className='mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900'>
							Link a Service
						</h2>
					</div>

					<SpotifyConnect />
				</div>
			</>
		</div>
	);
}

export default ServicePage;
