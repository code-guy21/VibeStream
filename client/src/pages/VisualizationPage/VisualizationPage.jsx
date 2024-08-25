import React, { useState } from 'react';
import VisualizationSwitcher from '../../components/VisualizationSwitcher';
import WaveformVisualization from '../../components/WaveFormVisualization';
import CrystalOrbVisualization from '../../components/CrystalOrbVisualization';
import styles from './VisualizationPage.module.css';

const VisualizationPage = () => {
	const [currentVisualization, setVisualization] = useState('crystal');

	return (
		<div className={styles.visualizationPage}>
			<VisualizationSwitcher
				currentVisualization={currentVisualization}
				setVisualization={setVisualization}
			/>
			<div className={styles.visualizationContainer}>
				{currentVisualization === 'crystal' && <CrystalOrbVisualization />}
				{currentVisualization === 'waveform' && <WaveformVisualization />}
			</div>
		</div>
	);
};

export default VisualizationPage;
