import React, { useState, useRef, useEffect } from 'react';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import VisualizationSwitcher from '../../components/VisualizationSwitcher';
import WaveformVisualization from '../../components/WaveFormVisualization';
import CrystalOrbVisualization from '../../components/CrystalOrbVisualization';
import styles from './VisualizationPage.module.css';

const VisualizationPage = () => {
	const [currentVisualization, setVisualization] = useState('crystal');
	const [isIOSFullScreen, setIsIOSFullScreen] = useState(false);
	const visualizationRef = useRef(null);
	const fullScreenHandle = useFullScreenHandle();

	const isIOS =
		/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

	const toggleFullScreen = () => {
		if (isIOS) {
			setIsIOSFullScreen(!isIOSFullScreen);
		} else {
			if (fullScreenHandle.active) {
				fullScreenHandle.exit();
			} else {
				fullScreenHandle.enter();
			}
		}
	};

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
					fullScreenHandle.active || isIOSFullScreen ? styles.fullScreen : ''
				}`}
				ref={visualizationRef}>
				{!(fullScreenHandle.active || isIOSFullScreen) && (
					<VisualizationSwitcher
						currentVisualization={currentVisualization}
						setVisualization={setVisualization}
						isFullScreen={fullScreenHandle.active || isIOSFullScreen}
						toggleFullScreen={toggleFullScreen}
					/>
				)}
				<div
					className={styles.visualizationContainer}
					onTouchStart={e => e.stopPropagation()}
					onTouchMove={e => e.stopPropagation()}>
					{currentVisualization === 'crystal' && <CrystalOrbVisualization />}
					{currentVisualization === 'waveform' && <WaveformVisualization />}
				</div>
				{(fullScreenHandle.active || isIOSFullScreen) && (
					<button
						className={styles.exitFullScreenButton}
						onClick={toggleFullScreen}
						aria-label='Exit full screen'>
						Exit
					</button>
				)}
			</div>
		</FullScreen>
	);
};

export default VisualizationPage;
