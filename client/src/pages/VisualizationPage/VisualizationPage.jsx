import React, { useState, useRef, useEffect } from 'react';
import VisualizationSwitcher from '../../components/VisualizationSwitcher';
import WaveformVisualization from '../../components/WaveFormVisualization';
import CrystalOrbVisualization from '../../components/CrystalOrbVisualization';
import styles from './VisualizationPage.module.css';

const VisualizationPage = () => {
	const [currentVisualization, setVisualization] = useState('crystal');
	const [isFullScreen, setIsFullScreen] = useState(false);
	const visualizationRef = useRef(null);

	const toggleFullScreen = () => {
		if (!document.fullscreenElement) {
			visualizationRef.current.requestFullscreen().catch(err => {
				console.error(
					`Error attempting to enable full-screen mode: ${err.message}`
				);
			});
		} else {
			document.exitFullscreen();
		}
	};

	useEffect(() => {
		const handleFullScreenChange = () => {
			setIsFullScreen(!!document.fullscreenElement);
		};

		document.addEventListener('fullscreenchange', handleFullScreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullScreenChange);
		};
	}, []);

	return (
		<div
			className={`${styles.visualizationPage} ${
				isFullScreen ? styles.fullScreen : ''
			}`}
			ref={visualizationRef}>
			<VisualizationSwitcher
				currentVisualization={currentVisualization}
				setVisualization={setVisualization}
				isFullScreen={isFullScreen}
				toggleFullScreen={toggleFullScreen}
			/>
			<div className={styles.visualizationContainer}>
				{currentVisualization === 'crystal' && <CrystalOrbVisualization />}
				{currentVisualization === 'waveform' && <WaveformVisualization />}
			</div>
		</div>
	);
};

export default VisualizationPage;
