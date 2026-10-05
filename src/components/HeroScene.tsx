"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";

const SPACING = 7;
const NEAR_Z = 8;
const GATE_Z = [NEAR_Z + 0.5, NEAR_Z - SPACING * 4, NEAR_Z - SPACING * 8];

const PILLAR_URL = "/models/pillar.glb";
useGLTF.preload(PILLAR_URL);

const CAT_URL = "/models/cat.glb";
useGLTF.preload(CAT_URL);

const ROCK_URL = "/models/rock.glb";
useGLTF.preload(ROCK_URL);

type Ptr = RefObject<{ x: number; y: number }>;

/** Small deterministic PRNG so the scattered layout is stable across loads. */
function seeded(seed: number) {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function makeSoftTexture() {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,0.5)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
}

type PillarPart = { geometry: THREE.BufferGeometry; material: THREE.Material | THREE.Material[]; local: THREE.Matrix4 };

/** A scattered field of the custom marble pillar GLB, instanced + casting/receiving soft shadows. */
function PillarField() {
    const { scene } = useGLTF(PILLAR_URL);
    const meshes = useMemo(() => {
        scene.updateWorldMatrix(true, true);
        const rootInv = new THREE.Matrix4().copy(scene.matrixWorld).invert();
        const parts: PillarPart[] = [];
        const box = new THREE.Box3();
        const tmpBox = new THREE.Box3();
        scene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!m.isMesh) return;
            const local = new THREE.Matrix4().multiplyMatrices(rootInv, m.matrixWorld);
            parts.push({ geometry: m.geometry, material: m.material, local });
            if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
            tmpBox.copy(m.geometry.boundingBox!).applyMatrix4(local);
            box.union(tmpBox);
        });
        const baseY = box.min.y; // lowest point of the assembled pillar (root space)

        const rnd = seeded(20260608);
        const COUNT = 24;
        const transforms: THREE.Matrix4[] = [];
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scl = new THREE.Vector3();
        const eul = new THREE.Euler();
        for (let i = 0; i < COUNT; i++) {
            const side = rnd() < 0.5 ? -1 : 1;
            const x = side * (3.5 + Math.pow(rnd(), 1.8) * 7); // flank the corridor, biased near
            const z = 9 - rnd() * 44; // spread from near to mid-depth
            const s = 2.1 + rnd() * 1.5; // tall, varied heights
            const ry = rnd() * Math.PI * 2;
            const tiltA = (rnd() - 0.5) * 0.07; // faint lean — ruin-like
            const tiltB = (rnd() - 0.5) * 0.07;
            pos.set(x, -baseY * s - 0.1, z);
            eul.set(tiltA, ry, tiltB);
            quat.setFromEuler(eul);
            scl.set(s, s, s);
            transforms.push(new THREE.Matrix4().compose(pos, quat, scl));
        }

        // Build InstancedMeshes with matrices already set, so they're correct in the very first frame.
        const tmp = new THREE.Matrix4();
        return parts.map((part) => {
            const im = new THREE.InstancedMesh(part.geometry, part.material, COUNT);
            transforms.forEach((t, i) => {
                tmp.multiplyMatrices(t, part.local);
                im.setMatrixAt(i, tmp);
            });
            im.instanceMatrix.needsUpdate = true;
            im.frustumCulled = false;
            im.castShadow = true;
            im.receiveShadow = true;
            im.computeBoundingSphere();
            return im;
        });
    }, [scene]);

    useEffect(() => () => meshes.forEach((m) => m.dispose()), [meshes]);

    return (
        <group>
            {meshes.map((m, i) => (
                <primitive key={i} object={m} />
            ))}
        </group>
    );
}

/**
 * Animated cat — the scene's focal point. The GLB is normalized at runtime (its
 * authored scale is arbitrary) to a target height, set on the ground, and placed in
 * the corridor where the camera holds it in clear view. Plays its looping clip.
 */
function Cat({ reduced, isMobile }: { reduced: boolean; isMobile: boolean }) {
    const ref = useRef<THREE.Group>(null);
    const { scene, animations } = useGLTF(CAT_URL);
    const { actions, names } = useAnimations(animations, ref);

    const norm = useMemo(() => {
        scene.updateWorldMatrix(true, true);
        scene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.isMesh) {
                m.castShadow = true;
                m.receiveShadow = true;
                m.frustumCulled = false; // skinned bounds drift during animation
                // lift the dark fur out of shadow so the cat reads as the focal point
                const mat = m.material as THREE.MeshStandardMaterial;
                if (mat && mat.map) {
                    mat.emissiveMap = mat.map;
                    mat.emissive = new THREE.Color(0xffffff);
                    mat.emissiveIntensity = 0.22;
                    mat.needsUpdate = true;
                }
            }
        });
        const box = new THREE.Box3().setFromObject(scene);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const targetH = isMobile ? 1.9 : 2.2; // world units tall
        const k = size.y > 0 ? targetH / size.y : 1;
        return { k, offset: [-k * center.x, -k * box.min.y, -k * center.z] as [number, number, number] };
    }, [scene, isMobile]);

    useEffect(() => {
        const action = actions["Take 001"] ?? (names[0] ? actions[names[0]] : undefined);
        if (!action) return;
        action.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.5).play();
        action.timeScale = reduced ? 0 : 1;
        return () => {
            action.fadeOut(0.2);
        };
    }, [actions, names, reduced]);

    const pos: [number, number, number] = isMobile ? [-1.5, 0, -4.5] : [-2.4, 0, -6];
    const rotY = isMobile ? -0.7 : -0.7;

    return (
        <group ref={ref} position={pos} rotation={[0, rotY, 0]}>
            <group scale={norm.k} position={norm.offset}>
                <primitive object={scene} />
            </group>
        </group>
    );
}

function Ground() {
    return (
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -34]}>
            <planeGeometry args={[140, 220]} />
            <meshStandardMaterial color="#696a45" roughness={0.95} />
        </mesh>
    );
}

/** Golden-hour grass — instanced tapered blades with a wind sway and a warm tip gradient. */
function Grass({ pointer, texture, reduced, count }: { pointer: Ptr; texture: THREE.Texture; reduced: boolean; count: number }) {
    const glowRef = useRef<THREE.Mesh>(null);
    const { mesh, material } = useMemo(() => {
        const COUNT = count;
        const blade = new THREE.PlaneGeometry(0.11, 0.6, 1, 4);
        blade.translate(0, 0.3, 0); // root at y = 0
        const bp = blade.attributes.position as THREE.BufferAttribute;
        for (let i = 0; i < bp.count; i++) {
            const tt = Math.max(0, bp.getY(i)) / 0.6;
            bp.setX(i, bp.getX(i) * (1 - tt * 0.85)); // taper to a point
        }
        bp.needsUpdate = true;

        const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { value: 0 },
                uCursor: { value: new THREE.Vector3(9999, 0, 9999) },
                uBend: { value: 0 },
                uTipColor: { value: new THREE.Color("#d2bb72") },
                uRootColor: { value: new THREE.Color("#5d6437") },
                uFog: { value: new THREE.Color("#fdf5ea") },
            },
            vertexShader: `
                uniform float uTime;
                uniform vec3 uCursor;
                uniform float uBend;
                varying float vH;
                varying float vDist;
                void main() {
                    float h = clamp(position.y / 0.6, 0.0, 1.0);
                    vH = h;
                    vec3 base = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
                    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
                    float phase = base.x * 0.6 + base.z * 0.6;
                    float sway = sin(uTime * 1.4 + phase) * 0.18 * h * h;
                    world.x += sway;
                    world.z += sway * 0.5;
                    // cursor wake — bend tops away from the cursor and press them down
                    vec2 to = base.xz - uCursor.xz;
                    float d = length(to);
                    float infl = smoothstep(3.4, 0.0, d) * uBend;
                    vec2 dir = to / max(d, 0.0001);
                    world.x += dir.x * infl * 0.95 * h * h;
                    world.z += dir.y * infl * 0.95 * h * h;
                    world.y -= infl * 0.5 * h * h;
                    vec4 mv = viewMatrix * world;
                    vDist = -mv.z;
                    gl_Position = projectionMatrix * mv;
                }
            `,
            fragmentShader: `
                uniform vec3 uTipColor;
                uniform vec3 uRootColor;
                uniform vec3 uFog;
                varying float vH;
                varying float vDist;
                void main() {
                    vec3 col = mix(uRootColor, uTipColor, vH);
                    float fog = clamp((vDist - 10.0) / 82.0, 0.0, 1.0);
                    col = mix(col, uFog, fog);
                    gl_FragColor = vec4(col, 1.0);
                }
            `,
        });

        const mesh = new THREE.InstancedMesh(blade, material, COUNT);
        mesh.frustumCulled = false;
        const rnd = seeded(424242);
        const m = new THREE.Matrix4();
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scl = new THREE.Vector3();
        const eul = new THREE.Euler();
        for (let i = 0; i < COUNT; i++) {
            const x = (rnd() - 0.5) * 50;
            const z = 16 - rnd() * 52; // extends behind/around the camera's close entry point
            // organic clump factor → varied height + perceived density, but full coverage (no bald ground)
            const n = Math.sin(x * 0.45 + z * 0.2) * Math.cos(z * 0.5 - x * 0.15) + 0.5 * Math.sin(x - z * 0.7);
            const clump = Math.min(1, Math.max(0, 0.5 + 0.5 * n));
            const h = (0.5 + Math.pow(rnd(), 0.85) * 1.5) * (0.6 + clump * 1.1);
            const w = 0.72 + rnd() * 0.6;
            pos.set(x, 0, z);
            eul.set(0, rnd() * Math.PI * 2, 0);
            quat.setFromEuler(eul);
            scl.set(w, h, w);
            m.compose(pos, quat, scl);
            mesh.setMatrixAt(i, m);
        }
        mesh.instanceMatrix.needsUpdate = true;
        return { mesh, material };
    }, [count]);

    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
    const ndc = useMemo(() => new THREE.Vector2(), []);
    const hitPt = useMemo(() => new THREE.Vector3(), []);
    const lastNdc = useRef({ x: 0, y: 0 });
    const bendRef = useRef(0);

    useEffect(() => () => {
        mesh.geometry.dispose();
        material.dispose();
    }, [mesh, material]);

    useFrame((state, delta) => {
        if (!reduced) material.uniforms.uTime.value += Math.min(delta, 0.05);
        const px = pointer.current?.x ?? 0;
        const py = pointer.current?.y ?? 0;
        // bend strength tracks cursor MOTION; relaxes back to upright (~0.5s) when the cursor holds still
        const speed = Math.hypot(px - lastNdc.current.x, py - lastNdc.current.y);
        lastNdc.current.x = px;
        lastNdc.current.y = py;
        const moving = speed > 0.003;
        bendRef.current += ((moving ? 1 : 0) - bendRef.current) * (moving ? 0.5 : 0.08);
        material.uniforms.uBend.value = bendRef.current;
        ndc.set(px, py);
        raycaster.setFromCamera(ndc, state.camera);
        const hit = raycaster.ray.intersectPlane(groundPlane, hitPt);
        if (hit) {
            material.uniforms.uCursor.value.copy(hitPt);
            if (glowRef.current) glowRef.current.position.set(hitPt.x, 0.06, hitPt.z);
        }
        if (glowRef.current) {
            (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.34 * bendRef.current;
            glowRef.current.visible = !!hit && bendRef.current > 0.01;
        }
    });

    return (
        <group>
            <primitive object={mesh} />
            <mesh ref={glowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, -10]}>
                <circleGeometry args={[4.5, 40]} />
                <meshBasicMaterial map={texture} color="#ffcb88" transparent opacity={0.3} depthWrite={false} fog={false} />
            </mesh>
        </group>
    );
}

/** Scattered rock models — the rock GLB instanced at random sizes/rotations (was debris cubes). */
function Rocks() {
    const { scene } = useGLTF(ROCK_URL);
    const mesh = useMemo(() => {
        scene.updateWorldMatrix(true, true);
        const rootInv = new THREE.Matrix4().copy(scene.matrixWorld).invert();
        let geo: THREE.BufferGeometry | null = null;
        let mat: THREE.Material | THREE.Material[] = new THREE.MeshStandardMaterial();
        scene.traverse((o) => {
            const m = o as THREE.Mesh;
            if (m.isMesh && !geo) {
                const local = new THREE.Matrix4().multiplyMatrices(rootInv, m.matrixWorld);
                const g = m.geometry.clone();
                g.applyMatrix4(local); // bake the model's orientation into the geometry
                geo = g;
                mat = m.material;
            }
        });
        if (!geo) return new THREE.InstancedMesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial(), 1);
        // recenter on x/z and drop the base to ground level so instances sit on the floor
        const base = geo as THREE.BufferGeometry;
        base.computeBoundingBox();
        const bb = base.boundingBox!;
        const c = new THREE.Vector3();
        bb.getCenter(c);
        base.translate(-c.x, -bb.min.y, -c.z);
        base.computeBoundingBox();
        const h = (base.boundingBox!.max.y - base.boundingBox!.min.y) || 1;

        const COUNT = 18;
        const im = new THREE.InstancedMesh(base, mat, COUNT);
        im.castShadow = true;
        im.receiveShadow = true;
        im.frustumCulled = false;
        const rnd = seeded(99887766);
        const m4 = new THREE.Matrix4();
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scl = new THREE.Vector3();
        const eul = new THREE.Euler();
        for (let i = 0; i < COUNT; i++) {
            const side = rnd() < 0.5 ? -1 : 1;
            const x = side * (2.4 + rnd() * 13);
            const z = 7 - rnd() * 32;
            const k = (0.4 + rnd() * 1.0) / h; // small/medium rocks scattered in the grass
            pos.set(x, -0.08 - rnd() * 0.18, z); // sit on the ground, slightly embedded
            eul.set((rnd() - 0.5) * 1.5, rnd() * Math.PI * 2, (rnd() - 0.5) * 1.5); // fully random tumble
            quat.setFromEuler(eul);
            scl.set(k * (0.8 + rnd() * 0.5), k * (0.85 + rnd() * 0.35), k * (0.8 + rnd() * 0.5));
            m4.compose(pos, quat, scl);
            im.setMatrixAt(i, m4);
        }
        im.instanceMatrix.needsUpdate = true;
        im.computeBoundingSphere();
        return im;
    }, [scene]);

    useEffect(() => () => {
        mesh.geometry.dispose();
    }, [mesh]);

    return <primitive object={mesh} />;
}

/**
 * Real sky from an EXR equirectangular HDRI, used as the scene BACKGROUND only —
 * NOT set as scene.environment, so it does not light the scene (the existing lights
 * are untouched). The HDRI's lower (ground) hemisphere is hidden behind the grass +
 * columns, so only its sky shows behind the scene. backgroundRotation aims the sky.
 */
function SkyHDRI() {
    const texture = useLoader(EXRLoader, "/hdri/the_sky_is_on_fire_2k.exr");
    const { scene } = useThree();
    useEffect(() => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        const prev = scene.background;
        scene.background = texture;
        scene.backgroundRotation = new THREE.Euler(0, Math.PI, 0);
        scene.backgroundIntensity = 1.0;
        scene.backgroundBlurriness = 0.0;
        return () => {
            scene.background = prev;
        };
    }, [scene, texture]);
    return null;
}

/** Soft warm "sun" glow in the background — a couple of stacked sprites, immune to fog. */
function WarmGlow({ texture }: { texture: THREE.Texture }) {
    return (
        <group position={[-22, 15, -50]}>
            <sprite scale={[130, 130, 1]}>
                <spriteMaterial map={texture} color="#ffd49a" transparent opacity={0.42} depthWrite={false} fog={false} />
            </sprite>
            <sprite scale={[58, 58, 1]}>
                <spriteMaterial map={texture} color="#ffe7c6" transparent opacity={0.5} depthWrite={false} fog={false} />
            </sprite>
        </group>
    );
}

/**
 * Champagne sparkles (custom shader): varied sizes, a glowing soft halo + bright core +
 * twinkling 4-point glint. Drifts gently and sways with the mouse. No post-processing —
 * the glow is baked per-sparkle so there's no extra render pass (safe on the GPU).
 */
function Sparkles({ pointer, reduced, count }: { pointer: Ptr; reduced: boolean; count: number }) {
    const ref = useRef<THREE.Points>(null);
    const COUNT = count;

    const geometry = useMemo(() => {
        const positions = new Float32Array(COUNT * 3);
        const sizes = new Float32Array(COUNT);
        const speeds = new Float32Array(COUNT);
        const phases = new Float32Array(COUNT);
        const colors = new Float32Array(COUNT * 3);
        const palette = ["#f7dcab", "#ffe2b0", "#f0cd8e", "#ffd89a", "#fff0d6", "#eccf9e"].map((c) => new THREE.Color(c));
        for (let i = 0; i < COUNT; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 54;
            positions[i * 3 + 1] = Math.random() * 24;
            positions[i * 3 + 2] = 8 - Math.random() * 70;
            sizes[i] = 6 + Math.pow(Math.random(), 2.0) * 30;
            speeds[i] = 0.15 + Math.random() * 0.6;
            phases[i] = Math.random();
            const col = palette[(Math.random() * palette.length) | 0];
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
        geo.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
        geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
        geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
        return geo;
    }, [count]);

    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                transparent: true,
                depthWrite: false,
                blending: THREE.NormalBlending,
                uniforms: {
                    uTime: { value: 0 },
                    uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1 },
                    uOpacity: { value: 0.95 },
                },
                vertexShader: `
                    uniform float uTime;
                    uniform float uPixelRatio;
                    attribute float aSize;
                    attribute float aSpeed;
                    attribute float aPhase;
                    attribute vec3 aColor;
                    varying vec3 vColor;
                    varying float vTw;
                    void main() {
                        vec3 p = position;
                        p.y = mod(position.y - uTime * aSpeed, 24.0);
                        p.x += sin(uTime * 0.25 + aPhase * 6.2831) * 0.7;
                        p.z += cos(uTime * 0.18 + aPhase * 6.2831) * 0.5;
                        vec4 mv = modelViewMatrix * vec4(p, 1.0);
                        float dist = max(1.5, -mv.z);
                        // sharp twinkle so the glints flash like sparkles
                        float tw = pow(0.5 + 0.5 * sin(uTime * 2.2 + aPhase * 12.566), 2.5);
                        vTw = tw;
                        vColor = aColor;
                        gl_PointSize = clamp(aSize * uPixelRatio * (7.5 / dist) * (0.45 + 0.75 * tw), 1.0, 46.0);
                        gl_Position = projectionMatrix * mv;
                    }
                `,
                fragmentShader: `
                    uniform float uOpacity;
                    varying vec3 vColor;
                    varying float vTw;
                    void main() {
                        vec2 uv = gl_PointCoord - 0.5;
                        float d = length(uv);
                        if (d > 0.5) discard;
                        float halo = pow(smoothstep(0.5, 0.0, d), 2.0);        // soft glow
                        float core = smoothstep(0.13, 0.0, d);                  // bright center
                        float gx = smoothstep(0.5, 0.0, abs(uv.x) * 8.0) * smoothstep(0.5, 0.0, abs(uv.y));
                        float gy = smoothstep(0.5, 0.0, abs(uv.y) * 8.0) * smoothstep(0.5, 0.0, abs(uv.x));
                        float glint = (gx + gy) * vTw;                          // twinkling 4-point star
                        float a = halo * 0.30 + core * 0.65 + glint * 0.7;
                        gl_FragColor = vec4(vColor, clamp(a, 0.0, 1.0) * uOpacity);
                    }
                `,
            }),
        []
    );

    useEffect(() => () => {
        geometry.dispose();
        material.dispose();
    }, [geometry, material]);

    useFrame((_, delta) => {
        if (!reduced) material.uniforms.uTime.value += Math.min(delta, 0.05);
        if (ref.current) {
            const px = pointer.current?.x ?? 0;
            const py = pointer.current?.y ?? 0;
            ref.current.position.x += (px * 2.0 - ref.current.position.x) * 0.02;
            ref.current.position.y += (py * 0.9 - ref.current.position.y) * 0.02;
        }
    });

    return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}

/** Faint warm glow drifting along the path — a subtle warm accent. */
function Smoke({ pointer, texture }: { pointer: Ptr; texture: THREE.Texture }) {
    const group = useRef<THREE.Group>(null);
    const puffs = useMemo(() => {
        const a: { base: [number, number, number]; s: number; ph: number }[] = [];
        GATE_Z.forEach((z, gi) => {
            for (let k = 0; k < 3; k++) {
                a.push({ base: [-3.2 + k * 3.2, 2.6 + k * 0.7, z], s: 8 + k * 1.8, ph: gi * 2.1 + k });
            }
        });
        return a;
    }, []);
    useFrame((state) => {
        if (!group.current) return;
        const t = state.clock.elapsedTime;
        const px = pointer.current?.x ?? 0;
        group.current.children.forEach((sp, i) => {
            const p = puffs[i];
            sp.position.x = p.base[0] + Math.sin(t * 0.08 + p.ph) * 1.6 + px * 2;
            sp.position.y = p.base[1] + Math.sin(t * 0.06 + p.ph) * 0.45 + 1.4;
            const mat = (sp as THREE.Sprite).material as THREE.SpriteMaterial;
            mat.rotation = t * 0.015 + p.ph;
        });
    });
    return (
        <group ref={group}>
            {puffs.map((p, i) => (
                <sprite key={i} position={p.base} scale={[p.s, p.s, 1]}>
                    <spriteMaterial map={texture} transparent opacity={0.08} depthWrite={false} color="#ffd49a" />
                </sprite>
            ))}
        </group>
    );
}

/** Several soft clouds slowly drifting across — a faint warm wash high in the scene. */
function SkyClouds({ pointer, texture }: { pointer: Ptr; texture: THREE.Texture }) {
    const group = useRef<THREE.Group>(null);
    const data = useMemo(() => {
        const a: { x: number; y: number; z: number; s: number; o: number; spd: number }[] = [];
        for (let i = 0; i < 9; i++) {
            a.push({
                x: (Math.random() - 0.5) * 64,
                y: 11 + Math.random() * 13,
                z: -18 - Math.random() * 44,
                s: 20 + Math.random() * 20,
                o: 0.12 + Math.random() * 0.12,
                spd: 0.45 + Math.random() * 0.55,
            });
        }
        return a;
    }, []);
    useFrame((state, delta) => {
        if (!group.current) return;
        const dt = Math.min(delta, 0.05);
        group.current.children.forEach((sp, i) => {
            sp.position.x += data[i].spd * dt;
            if (sp.position.x > 36) sp.position.x = -36;
        });
        const px = pointer.current?.x ?? 0;
        group.current.position.x += (px * 1.8 - group.current.position.x) * 0.015;
    });
    return (
        <group ref={group}>
            {data.map((c, i) => (
                <sprite key={i} position={[c.x, c.y, c.z]} scale={[c.s, c.s * 0.5, 1]}>
                    <spriteMaterial map={texture} transparent opacity={c.o} depthWrite={false} color="#ffe7c4" />
                </sprite>
            ))}
        </group>
    );
}

/** Original-speed (~5s) ease-in-out fly-through + barely-there parallax. */
function CameraRig({ pointer, reduced }: { pointer: Ptr; reduced: boolean }) {
    const t0 = useRef<number | null>(null);
    useFrame((state) => {
        const { camera, clock } = state;
        if (t0.current === null) t0.current = clock.elapsedTime;
        const elapsed = clock.elapsedTime - t0.current;
        const t = reduced ? 1 : Math.min(1, elapsed / 5);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        const baseZ = 24 + (7 - 24) * eased; // old fly-through — start far back, glide in to 7
        const breathe = reduced ? 0 : Math.sin(clock.elapsedTime * 0.16) * 0.5;
        const idle = reduced ? 0 : Math.sin(clock.elapsedTime * 0.22) * 0.1;

        const tx = (pointer.current?.x ?? 0) * 0.9;
        const ty = 3 + (pointer.current?.y ?? 0) * 0.5 + idle; // fly forward at roughly eye height
        camera.position.x += (tx - camera.position.x) * 0.02;
        camera.position.y += (ty - camera.position.y) * 0.02;
        camera.position.z += (baseZ + breathe - camera.position.z) * 0.03;
        camera.lookAt((pointer.current?.x ?? 0) * 0.8, 3.6 + (pointer.current?.y ?? 0) * 0.4, -36);
    });
    return null;
}

/**
 * Warm smoke veil the cursor wipes away with a soft, organic, wobbling brush along its
 * trail; the smoke slowly creeps back over ~2s. 2D canvas.
 */
function SmokeWipe({ containerRef, paused, reduced }: { containerRef: RefObject<HTMLDivElement | null>; paused: boolean; reduced: boolean }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
        const FOG = "rgba(253, 244, 232, 1)"; // warm-white haze
        let W = 0;
        let H = 0;
        let rect = container.getBoundingClientRect();

        const prime = () => {
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;
            ctx.fillStyle = FOG;
            ctx.fillRect(0, 0, W, H);
        };
        const resize = () => {
            rect = container.getBoundingClientRect();
            W = rect.width;
            H = rect.height;
            canvas.width = Math.max(1, Math.round(W * DPR));
            canvas.height = Math.max(1, Math.round(H * DPR));
            canvas.style.width = `${W}px`;
            canvas.style.height = `${H}px`;
            prime();
        };
        resize();
        const onResize = () => resize();
        const onScroll = () => {
            rect = container.getBoundingClientRect();
        };
        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", onScroll, { passive: true });

        const BS = 256;
        const brush = document.createElement("canvas");
        brush.width = brush.height = BS;
        const bctx = brush.getContext("2d")!;
        const g = bctx.createRadialGradient(BS / 2, BS / 2, 0, BS / 2, BS / 2, BS / 2);
        g.addColorStop(0, "rgba(0,0,0,0.95)");
        g.addColorStop(0.45, "rgba(0,0,0,0.42)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        bctx.fillStyle = g;
        bctx.fillRect(0, 0, BS, BS);

        const pt = { x: -9999, y: -9999, px: -9999, py: -9999, has: false, inside: false };
        const onMove = (e: PointerEvent) => {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            pt.inside = x >= 0 && y >= 0 && x <= W && y <= H;
            pt.x = x;
            pt.y = y;
            if (!pt.has) {
                pt.px = x;
                pt.py = y;
                pt.has = true;
            }
        };
        window.addEventListener("pointermove", onMove, { passive: true });

        let raf = 0;
        let t = 0;
        const loop = () => {
            t += 0.016;
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = 1;
            ctx.fillStyle = "rgba(253, 244, 232, 0.02)";
            ctx.fillRect(0, 0, W, H);

            if (pt.has && pt.inside) {
                ctx.globalCompositeOperation = "destination-out";
                const dx = pt.x - pt.px;
                const dy = pt.y - pt.py;
                const dist = Math.hypot(dx, dy);
                const steps = Math.min(16, Math.max(1, Math.round(dist / 14)));
                for (let i = 0; i <= steps; i++) {
                    const ix = pt.px + (dx * i) / steps;
                    const iy = pt.py + (dy * i) / steps;
                    for (let b = 0; b < 3; b++) {
                        const ang = t * 0.8 + b * 2.094;
                        const off = 24 + 16 * Math.sin(t * 1.4 + b * 1.7);
                        const rad = 130 + 38 * Math.sin(t * 0.9 + b * 2.3);
                        const ox = ix + Math.cos(ang) * off;
                        const oy = iy + Math.sin(ang) * off;
                        ctx.globalAlpha = 0.4;
                        ctx.drawImage(brush, ox - rad, oy - rad, rad * 2, rad * 2);
                    }
                }
                ctx.globalAlpha = 1;
            }
            pt.px = pt.x;
            pt.py = pt.y;
            raf = requestAnimationFrame(loop);
        };

        if (!reduced && !paused) raf = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("pointermove", onMove);
        };
    }, [containerRef, paused, reduced]);

    return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" style={{ opacity: 0.28 }} />;
}

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() {
        return { failed: true };
    }
    render() {
        return this.state.failed ? null : this.props.children;
    }
}

export default function HeroScene() {
    const [enabled, setEnabled] = useState(false);
    const [reduced, setReduced] = useState(false);
    const [paused, setPaused] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const pointer = useRef({ x: 0, y: 0 });
    const texture = useMemo(() => makeSoftTexture(), []);

    useEffect(() => {
        setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
        setIsMobile(
            window.matchMedia("(pointer: coarse)").matches ||
            window.matchMedia("(max-width: 767px)").matches
        );
        setEnabled(true); // render the scene on every viewport (mobile uses a lighter tier)
    }, []);

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            // ignore touch — only a real mouse/pen drives the camera + grass parallax
            if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
    }, []);

    useEffect(() => {
        if (!enabled || !ref.current) return;
        const obs = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { threshold: 0, rootMargin: "150px" });
        obs.observe(ref.current);
        return () => obs.disconnect();
    }, [enabled]);

    if (!enabled) return null;

    return (
        <div ref={ref} className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <SceneBoundary>
                <Canvas
                    shadows
                    dpr={[1, 1.5]}
                    camera={{ position: [0, 3, 24], fov: isMobile ? 72 : 58, near: 0.1, far: 220 }}
                    frameloop={paused ? "never" : "always"}
                    gl={{ antialias: true, alpha: true, powerPreference: "default" }}
                    style={{ width: "100%", height: "100%" }}
                    onCreated={({ gl }) => {
                        gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault(), false);
                    }}
                >
                    <color attach="background" args={["#ffffff"]} />
                    <fog attach="fog" args={["#fdf5ea", 20, 145]} />

                    {/* Golden-hour key — warm, low, raking from the left; casts soft shadows */}
                    <directionalLight
                        position={[-18, 11, 7]}
                        intensity={2.6}
                        color="#ff9d4f"
                        castShadow
                        shadow-mapSize={isMobile ? [1024, 1024] : [2048, 2048]}
                        shadow-camera-near={1}
                        shadow-camera-far={120}
                        shadow-camera-left={-38}
                        shadow-camera-right={38}
                        shadow-camera-top={38}
                        shadow-camera-bottom={-38}
                        shadow-bias={-0.0004}
                    />
                    {/* Cool soft fill from the right so shadows read as soft grey, not dead */}
                    <directionalLight position={[15, 10, 3]} intensity={0.5} color="#cdd8ff" />
                    {/* Low warm ambient + faint sky fill */}
                    <ambientLight intensity={0.26} color="#fff1e0" />
                    <hemisphereLight color="#fff2e2" groundColor="#ececec" intensity={0.32} />

                    <Suspense fallback={null}>
                        <SkyHDRI />
                    </Suspense>
                    <WarmGlow texture={texture} />
                    <Suspense fallback={null}>
                        <PillarField />
                    </Suspense>
                    <Ground />
                    <Grass pointer={pointer} texture={texture} reduced={reduced} count={isMobile ? 24000 : 45000} />
                    <Suspense fallback={null}>
                        <Rocks />
                    </Suspense>
                    <Suspense fallback={null}>
                        <Cat reduced={reduced} isMobile={isMobile} />
                    </Suspense>
                    <SkyClouds pointer={pointer} texture={texture} />
                    <Smoke pointer={pointer} texture={texture} />
                    <Sparkles pointer={pointer} reduced={reduced} count={isMobile ? 800 : 1900} />

                    <CameraRig pointer={pointer} reduced={reduced} />
                </Canvas>
            </SceneBoundary>
            {/* Warm haze the cursor wipes away — desktop only (needs a cursor to reveal) */}
            {!isMobile && <SmokeWipe containerRef={ref} paused={paused} reduced={reduced} />}
        </div>
    );
}
