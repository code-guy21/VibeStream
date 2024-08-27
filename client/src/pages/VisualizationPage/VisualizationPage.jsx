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
			if (visualizationRef.current.requestFullscreen) {
				visualizationRef.current.requestFullscreen();
			} else if (visualizationRef.current.webkitRequestFullscreen) {
				// iOS Safari
				visualizationRef.current.webkitRequestFullscreen();
			} else {
				// Fallback for browsers that don't support fullscreen API
				setIsFullScreen(true);
			}
		} else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.webkitExitFullscreen) {
				// iOS Safari
				document.webkitExitFullscreen();
			} else {
				// Fallback for browsers that don't support fullscreen API
				setIsFullScreen(false);
			}
		}
	};

	useEffect(() => {
		const handleFullScreenChange = () => {
			setIsFullScreen(
				!!(
					document.fullscreenElement ||
					document.webkitFullscreenElement ||
					document.mozFullScreenElement ||
					document.msFullscreenElement
				)
			);
		};

		document.addEventListener('fullscreenchange', handleFullScreenChange);
		document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
		document.addEventListener('mozfullscreenchange', handleFullScreenChange);
		document.addEventListener('MSFullscreenChange', handleFullScreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullScreenChange);
			document.removeEventListener(
				'webkitfullscreenchange',
				handleFullScreenChange
			);
			document.removeEventListener(
				'mozfullscreenchange',
				handleFullScreenChange
			);
			document.removeEventListener(
				'MSFullscreenChange',
				handleFullScreenChange
			);
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
