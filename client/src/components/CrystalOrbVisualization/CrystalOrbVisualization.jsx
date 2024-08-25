import React, { useEffect, useRef, useCallback } from 'react';
import {
	FreeCamera,
	Vector3,
	HemisphericLight,
	PointLight,
	MeshBuilder,
	Animation,
	Color3,
	StandardMaterial,
	GlowLayer,
	Texture,
	ParticleSystem,
	Color4,
	EasingFunction,
	CubicEase,
} from '@babylonjs/core';
import SceneComponent from '../SceneComponent';
import { useSelector } from 'react-redux';
import { debounce } from 'lodash';
import styles from './CrystalOrbVisualization.module.css';

const CrystalOrbVisualization = () => {
	const { audioAnalysis, isPaused, trackState, analysisLoading } = useSelector(
		state => state.playback
	);
	const animationRef = useRef(null);
	const requestRef = useRef(null);
	const beatIndexRef = useRef(0);
	const sceneRef = useRef(null);
	const crystalOrbRef = useRef(null);
	const lastColorChangeRef = useRef(0);
	const colorTransitionProgressRef = useRef(0);

	// Define the colors to cycle through: blue, purple, red, pink, orange, green
	const colors = [
		new Color3(0.4, 0.6, 1), // Blue
		new Color3(0.6, 0.4, 1), // Purple
		new Color3(1, 0.4, 0.4), // Red
		new Color3(1, 0.6, 0.8), // Pink
		new Color3(1, 0.6, 0.4), // Orange
		new Color3(0.4, 1, 0.4), // Green
	];

	let colorIndex = 0;
	let currentColor = colors[colorIndex];
	let targetColor = colors[(colorIndex + 1) % colors.length];

	const onSceneReady = scene => {
		scene.clearColor = new Color4(0.1, 0.1, 0.2, 1.0);
		sceneRef.current = scene;

		const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
		camera.setTarget(Vector3.Zero());
		const canvas = scene.getEngine().getRenderingCanvas();
		camera.attachControl(canvas, true);

		const ambientLight = new HemisphericLight(
			'ambientLight',
			new Vector3(0, 1, 0),
			scene
		);
		ambientLight.intensity = 0.7;

		const pointLight = new PointLight(
			'pointLight',
			new Vector3(0, 10, 0),
			scene
		);
		pointLight.intensity = 1.0;
		pointLight.diffuse = new Color3(0.5, 0.5, 1);
		pointLight.specular = new Color3(1, 1, 1);

		crystalOrbRef.current = MeshBuilder.CreateSphere(
			'crystalOrb',
			{ diameter: 1, segments: 32 },
			scene
		);
		crystalOrbRef.current.position.y = 1;

		const orbMaterial = new StandardMaterial('orbMaterial', scene);
		orbMaterial.diffuseTexture = new Texture(
			'https://www.babylonjs-playground.com/textures/flare.png',
			scene
		);
		orbMaterial.emissiveColor = currentColor;
		orbMaterial.specularPower = 64;
		orbMaterial.roughness = 0.5;
		orbMaterial.diffuseColor = currentColor;
		crystalOrbRef.current.material = orbMaterial;

		const glowLayer = new GlowLayer('glow', scene);
		glowLayer.intensity = 0.7;
		glowLayer.addIncludedOnlyMesh(crystalOrbRef.current);

		const particleSystem = new ParticleSystem('particles', 2000, scene);
		particleSystem.particleTexture = new Texture(
			'https://www.babylonjs-playground.com/textures/flare.png',
			scene
		);
		particleSystem.emitter = crystalOrbRef.current;
		particleSystem.minEmitBox = new Vector3(0, 0, 0);
		particleSystem.maxEmitBox = new Vector3(0, 0, 0);

		particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0);
		particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0);
		particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0);

		particleSystem.minSize = 0.05;
		particleSystem.maxSize = 0.1;

		particleSystem.minLifeTime = 1.0;
		particleSystem.maxLifeTime = 2.0;

		particleSystem.emitRate = 500;

		particleSystem.blendMode = ParticleSystem.BLENDMODE_ONEONE;

		particleSystem.gravity = new Vector3(0, -0.2, 0);

		particleSystem.direction1 = new Vector3(-0.5, 1, -0.5);
		particleSystem.direction2 = new Vector3(0.5, 1, 0.5);

		particleSystem.minEmitPower = 0.5;
		particleSystem.maxEmitPower = 1.5;
		particleSystem.updateSpeed = 0.01;

		particleSystem.start();

		const bounceAnimation = new Animation(
			'crystalOrbBounce',
			'position.y',
			60,
			Animation.ANIMATIONTYPE_FLOAT,
			Animation.ANIMATIONLOOPMODE_CYCLE
		);

		// Use easing for smoother bounces
		const easingFunction = new CubicEase();
		easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

		const keys = [
			{ frame: 0, value: 1 },
			{ frame: 15, value: 1.8 }, // Adjusted bounce height for more dynamic feel
			{ frame: 30, value: 1 },
		];

		bounceAnimation.setKeys(keys);
		bounceAnimation.setEasingFunction(easingFunction); // Apply easing function to animation
		crystalOrbRef.current.animations.push(bounceAnimation);

		animationRef.current = bounceAnimation;
	};

	// Function to gradually change the orb's color over time with fade-in effect
	const updateColor = currentTime => {
		const timeSinceLastChange = currentTime - lastColorChangeRef.current;

		if (timeSinceLastChange > 5000) {
			// Change color every 5 seconds (Increase this for slower changes)
			colorIndex = (colorIndex + 1) % colors.length;
			currentColor = crystalOrbRef.current.material.emissiveColor;
			targetColor = colors[colorIndex];
			colorTransitionProgressRef.current = 0;
			lastColorChangeRef.current = currentTime;
		}

		// Gradually transition to the target color
		if (colorTransitionProgressRef.current < 1) {
			colorTransitionProgressRef.current += 0.005; // Adjust the speed of transition (Lower this for slower fading)
			const lerpedColor = Color3.Lerp(
				currentColor,
				targetColor,
				colorTransitionProgressRef.current
			);
			crystalOrbRef.current.material.emissiveColor = lerpedColor;
			crystalOrbRef.current.material.diffuseColor = lerpedColor;
		}
	};

	const handleAnimation = beatTimes => {
		if (beatIndexRef.current >= beatTimes.length || isPaused || analysisLoading)
			return;

		const nextBounceTime = beatTimes[beatIndexRef.current];
		const now = performance.now();

		updateColor(now); // Gradually update color with fade-in effect

		if (nextBounceTime <= now) {
			if (animationRef.current && !isPaused) {
				sceneRef.current.beginAnimation(crystalOrbRef.current, 0, 30, false);
			}
			beatIndexRef.current += 1;
		}

		requestRef.current = requestAnimationFrame(() =>
			handleAnimation(beatTimes)
		);
	};

	const stopAnimation = () => {
		cancelAnimationFrame(requestRef.current);
		if (sceneRef.current) {
			sceneRef.current.stopAnimation(crystalOrbRef.current);
		}
	};

	const syncAnimationWithTrack = () => {
		if (audioAnalysis?.beats?.length > 0) {
			stopAnimation();

			const currentTime = trackState.position || 0;
			const beatTimes = audioAnalysis.beats.map(
				beat => performance.now() + beat.start * 1000 - currentTime
			);

			const initialIndex = audioAnalysis.beats.findIndex(
				beat => beat.start * 1000 >= currentTime
			);
			beatIndexRef.current = initialIndex >= 0 ? initialIndex : 0;

			requestRef.current = requestAnimationFrame(() =>
				handleAnimation(beatTimes)
			);
		}
	};

	const debouncePauseHandling = useCallback(
		debounce(() => {
			if (isPaused || analysisLoading) {
				stopAnimation();
			} else {
				syncAnimationWithTrack();
			}
		}, 200),
		[isPaused, audioAnalysis, trackState.position, analysisLoading]
	);

	useEffect(() => {
		debouncePauseHandling();
	}, [
		isPaused,
		audioAnalysis,
		trackState.position,
		debouncePauseHandling,
		analysisLoading,
	]);

	useEffect(() => {
		if (!analysisLoading) {
			syncAnimationWithTrack();
		}
	}, [audioAnalysis, trackState.position, analysisLoading]);

	useEffect(() => {
		return () => {
			stopAnimation();
		};
	}, []);

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

export default CrystalOrbVisualization;
