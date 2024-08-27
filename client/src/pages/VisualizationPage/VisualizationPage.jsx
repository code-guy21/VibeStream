import React, { useState, useRef, useEffect } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import VisualizationSwitcher from '../../components/VisualizationSwitcher';
import WaveformVisualization from '../../components/WaveFormVisualization';
import CrystalOrbVisualization from '../../components/CrystalOrbVisualization';
import styles from './VisualizationPage.module.css';

const VisualizationPage = () => {
	const [currentVisualization, setVisualization] = useState('crystal');
	const visualizationRef = useRef(null);
	const fullScreenHandle = useFullScreenHandle();

	useEffect(() => {
		const handleOrientationChange = () => {
			if (fullScreenHandle.active) {
				// Force a re-render to adjust layout
				fullScreenHandle.exit();
				fullScreenHandle.enter();
			}
		};

		window.addEventListener('orientationchange', handleOrientationChange);
		return () =>
			window.removeEventListener('orientationchange', handleOrientationChange);
	}, [fullScreenHandle]);

	return (
		<FullScreen handle={fullScreenHandle}>
			<div
				className={`${styles.visualizationPage} ${
					fullScreenHandle.active ? styles.fullScreen : ''
				}`}
				ref={visualizationRef}>
				{!fullScreenHandle.active && (
					<VisualizationSwitcher
						currentVisualization={currentVisualization}
						setVisualization={setVisualization}
						isFullScreen={fullScreenHandle.active}
						toggleFullScreen={fullScreenHandle.enter}
					/>
				)}
				<div
					className={styles.visualizationContainer}
					onTouchStart={e => e.stopPropagation()}
					onTouchMove={e => e.stopPropagation()}>
					{currentVisualization === 'crystal' && <CrystalOrbVisualization />}
					{currentVisualization === 'waveform' && <WaveformVisualization />}
				</div>
				{fullScreenHandle.active && (
					<button
						className={styles.exitFullScreenButton}
						onClick={fullScreenHandle.exit}
						aria-label='Exit full screen'>
						Exit
					</button>
				)}
			</div>
		</FullScreen>
	);
};

export default VisualizationPage;
