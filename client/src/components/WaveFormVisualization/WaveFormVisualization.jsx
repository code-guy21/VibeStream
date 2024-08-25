import React, { useEffect, useRef, useCallback } from 'react';
import {
	FreeCamera,
	Vector3,
	HemisphericLight,
	MeshBuilder,
	Color3,
	StandardMaterial,
	Color4,
	VertexBuffer,
	GlowLayer,
	Scalar,
	CubicEase,
	EasingFunction,
} from '@babylonjs/core';
import SceneComponent from '../SceneComponent';
import { useSelector } from 'react-redux';
import styles from './WaveFormVisualization.module.css';

const WaveformVisualization = () => {
	const { audioAnalysis, isPaused, trackState, analysisLoading } = useSelector(
		state => state.playback
	);
	const requestRef = useRef(null);
	const sceneRef = useRef(null);
	const waveformLineRef = useRef(null);
	const glowLayerRef = useRef(null);
	const shouldStopRef = useRef(false); // New flag to control immediate stop

	const stopAnimation = useCallback(() => {
		shouldStopRef.current = true; // Set flag to stop any ongoing animation
		if (requestRef.current) {
			cancelAnimationFrame(requestRef.current);
			requestRef.current = null;
		}
		if (sceneRef.current) {
			sceneRef.current.stopAnimation(waveformLineRef.current);
		}
	}, []);

	const updateWaveform = (audioAnalysis, currentTime) => {
		if (shouldStopRef.current) return; // Immediately return if stop flag is set

		if (
			!waveformLineRef.current ||
			!audioAnalysis ||
			!audioAnalysis.segments ||
			analysisLoading ||
			isPaused
		) {
			stopAnimation();
			return;
		}

		const positions = waveformLineRef.current.getVerticesData(
			VertexBuffer.PositionKind
		);
		if (!positions) return;

		const segments = audioAnalysis.segments;
		const currentSegment = segments.find(
			segment =>
				segment.start <= currentTime &&
				currentTime < segment.start + segment.duration
		);

		if (currentSegment) {
			const loudness = currentSegment.loudness_max;
			const pitch =
				currentSegment.pitches.reduce((a, b) => a + b, 0) /
				currentSegment.pitches.length;
			const timbre =
				currentSegment.timbre.reduce((a, b) => a + b, 0) /
				currentSegment.timbre.length;

			const isMobile = window.innerWidth <= 640;
			const amplitudeMultiplier = isMobile ? 0.3 : 0.2;

			const colorFactor = Scalar.Clamp(loudness / 60 + 0.5, 0, 1);
			const color = new Color3(
				0.5 + 0.5 * Math.sin(currentTime * 0.5),
				0.5 + 0.5 * Math.sin(currentTime * 0.7 + Math.PI / 3),
				1 - 0.5 * Math.sin(currentTime * 0.9 + Math.PI / 2)
			);
			waveformLineRef.current.material.emissiveColor = color;

			glowLayerRef.current.intensity = 1.5 + colorFactor;

			const easingFunction = new CubicEase();
			easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

			for (let i = 0; i < positions.length / 3; i++) {
				const x = positions[i * 3];
				const wave =
					easingFunction.ease(Math.sin(x * 2 + currentTime * 2) * 0.5) +
					easingFunction.ease(Math.sin(x * 3 + currentTime * 1.5) * 0.25);
				positions[i * 3 + 1] = Scalar.Lerp(
					positions[i * 3 + 1],
					wave * (loudness / 60 + 1) * pitch * timbre * amplitudeMultiplier,
					0.15
				);
			}

			waveformLineRef.current.updateVerticesData(
				VertexBuffer.PositionKind,
				positions,
				true
			);
		}

		if (!isPaused && !shouldStopRef.current) {
			requestRef.current = requestAnimationFrame(() =>
				updateWaveform(audioAnalysis, currentTime + 0.016)
			);
		}
	};

	const syncAnimationWithTrack = () => {
		shouldStopRef.current = false; // Reset stop flag before starting
		if (isPaused || !audioAnalysis || !audioAnalysis.segments) {
			stopAnimation(); // Ensure the animation stops immediately if paused
			return;
		}

		const currentTime = trackState.position / 1000 || 0;
		updateWaveform(audioAnalysis, currentTime);
	};

	useEffect(() => {
		if (isPaused || analysisLoading) {
			stopAnimation();
		} else {
			syncAnimationWithTrack();
		}
	}, [
		isPaused,
		audioAnalysis,
		trackState.position,
		analysisLoading,
		stopAnimation,
	]);

	const onSceneReady = scene => {
		scene.clearColor = new Color4(0.05, 0.05, 0.15, 1.0);
		sceneRef.current = scene;

		const isMobile = window.innerWidth <= 640;
		const camera = new FreeCamera(
			'camera1',
			new Vector3(0, 1, isMobile ? -5 : -10),
			scene
		);
		camera.setTarget(Vector3.Zero());
		const canvas = scene.getEngine().getRenderingCanvas();
		camera.attachControl(canvas, true);

		const ambientLight = new HemisphericLight(
			'ambientLight',
			new Vector3(0, 1, 0),
			scene
		);
		ambientLight.intensity = 0.8;

		const points = [];
		for (let i = 0; i <= 400; i++) {
			points.push(new Vector3(i / 40 - 5, 0, 0));
		}
		waveformLineRef.current = MeshBuilder.CreateLines(
			'waveformLine',
			{ points, updatable: true },
			scene
		);

		const lineMaterial = new StandardMaterial('lineMaterial', scene);
		lineMaterial.emissiveColor = new Color3(0.2, 0.7, 1);
		lineMaterial.specularColor = new Color3(1, 1, 1);
		lineMaterial.diffuseColor = new Color3(0, 0, 0);
		waveformLineRef.current.material = lineMaterial;

		glowLayerRef.current = new GlowLayer('glow', scene);
		glowLayerRef.current.intensity = isMobile ? 2.5 : 2.0;
		glowLayerRef.current.addIncludedOnlyMesh(waveformLineRef.current);

		syncAnimationWithTrack();
	};

	useEffect(() => {
		return () => {
			stopAnimation();
			if (sceneRef.current) {
				sceneRef.current.dispose();
			}
		};
	}, [stopAnimation]);

	return (
		<div className={styles.visualizationWrapper}>
			{analysisLoading ? (
				<div className={styles.loader}></div>
			) : (
				<SceneComponent antialias onSceneReady={onSceneReady} id='my-canvas' />
			)}
		</div>
	);
};

export default WaveformVisualization;
