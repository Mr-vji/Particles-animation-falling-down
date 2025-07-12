import { Gltf, OrbitControls, PositionalAudio, useGLTF, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { degToRad, lerp } from "three/src/math/MathUtils.js";

import { VFXEmitter, VFXParticles } from "wawa-vfx";
import { useMagic } from "../hooks/useMagic";
import { Orc } from "./Orc";
import { Wizard } from "./Wizard";
import { Vji } from "./Vji";

export const Magic = ({ ...props }) => {
   const update = useMagic((state) => state.update);
   const spell = useMagic((state) => state.spell);
   const addSpell = useMagic((state) => state.addSpell);

   const pointerPosition = useRef(new Vector3(0, 0.001, 0));
   const pointer = useRef();
   const wizard = useRef();

   useFrame(({ clock }, delta) => {
      update(delta);
      const elapsedTime = clock.getElapsedTime();
      if (pointer.current && pointerPosition.current) {
         pointer.current.position.lerp(pointerPosition.current, 0.1);

         pointer.current.scale.x =
            pointer.current.scale.y =
            pointer.current.scale.z =
               lerp(pointer.current.scale.x, 2 + (Math.sin(elapsedTime * 4) + 0.5) * 1, 0.1);
      }
      wizard.current.lookAt(pointerPosition.current);
   });

   return (
      <group {...props}>
         <Vji />
         <OrbitControls />
         {/* <VFXS />
         <Spells /> */}
         <mesh
            receiveShadow
            rotation-x={-Math.PI / 2}
            position-y={0.001}
            onPointerMove={(e) =>
               pointerPosition.current.set(e.point.x, e.point.y + 0.001, e.point.z)
            }
            onClick={() => {
               addSpell({
                  ...spell,
                  position: pointerPosition.current.clone(),
               });
            }}
         >
            <planeGeometry args={[100, 100]} />
            <shadowMaterial opacity={0.4} transparent />
         </mesh>
         <mesh ref={pointer} rotation-x={degToRad(-90)}>
            <circleGeometry args={[0.1, 32]} />
            <meshStandardMaterial emissive={spell.colors[0]} emissiveIntensity={2.5} />
         </mesh>
         <Orcs />
         <group position-z={5} ref={wizard}>
            {/* <Wizard model="Animated Wizard" scale={0.4} /> */}
         </group>
         {/* <Gltf scale={0.5} src="/models/WizardTraining.glb" receiveShadow /> */}
      </group>
   );
};

const Orcs = () => {
   const orcs = useMagic((state) => state.orcs);

   return orcs.map((orc) => <Orc key={orc.id} orc={orc} scale={0.4} />);
};

const VFXS = () => {
   const texture = useTexture("textures/magic_01.png");
   const { nodes } = useGLTF("/models/Icicle.glb");

   return (
      <>
         <VFXParticles
            name="sparks"
            geometry={<coneGeometry args={[0.5, 1, 8, 1]} />}
            settings={{
               nbParticles: 100000,
               renderMode: "billboard",
               intensity: 3,
               fadeSize: [0.1, 0.1],
            }}
         />
         <VFXParticles
            name="spheres"
            geometry={<sphereGeometry args={[1, 32, 32]} />}
            settings={{
               nbParticles: 1000,
               renderMode: "mesh",
               intensity: 5,
               fadeSize: [0.7, 0.9],
               fadeAlpha: [0, 1],
            }}
         />
         <VFXParticles
            name="writings"
            geometry={<circleGeometry args={[1, 32]} />}
            alphaMap={texture}
            settings={{
               nbParticles: 100,
               renderMode: "mesh",
               fadeAlpha: [0.9, 1.0],
               fadeSize: [0.3, 0.9],
            }}
         />
         <VFXParticles
            name="icicle"
            geometry={<primitive object={nodes.icicle.geometry} />}
            settings={{
               nbParticles: 100,
               renderMode: "mesh",
               fadeAlpha: [0, 1.0],
               fadeSize: [0.2, 0.8],
            }}
         />
      </>
   );
};

const Spells = () => {
   const spells = useMagic((state) => state.spells);
   return spells.map((spell) =>
      spell.name === "void" ? (
         <Void key={spell.id} position={spell.position} />
      ) : spell.name === "fire" ? (
         <Fire key={spell.id} position={spell.position} />
      ) : (
         <Ice key={spell.id} position={spell.position} />
      )
   );
};
const Void = ({ ...props }) => {
   const spellEmitter = useRef();
   const time = useRef(0);

   useFrame((_, delta) => {
      time.current += delta;
      if (spellEmitter.current) {
         // Optional: emitter bobbing up and down
         spellEmitter.current.position.y = Math.cos(time.current * Math.PI) * 5;
      }
   });

   const blastAudio = useRef();
   useEffect(() => {
      setTimeout(() => {
         blastAudio.current?.play();
      }, 500);
   }, []);

   return (
      <group {...props}>
         {/* Falling down sparks with V shape */}
         <VFXEmitter emitter="sparks" ref={spellEmitter} debug />
      </group>
   );
};

const Ice = ({ ...props }) => {
   const spellEmitter = useRef();
   const time = useRef(0);
   useFrame((_, delta) => {
      time.current += delta;
      if (spellEmitter.current) {
         spellEmitter.current.position.y = Math.cos(time.current * Math.PI) * 5;
      }
   });

   const blastAudio = useRef();
   useEffect(() => {
      setTimeout(() => {
         blastAudio.current.play();
      }, 500);
   }, []);

   return (
      <group {...props}>
         {/* SFXs */}
         {/* <PositionalAudio url="/sfxs/fire.mp3" autoplay distance={20} loop={false} />
         <PositionalAudio url="/sfxs/freeze.mp3" distance={30} loop={false} ref={blastAudio} /> */}

         {/* Buildup */}
         <VFXEmitter
            emitter="writings"
            position-y={0.1}
            rotation-x={-Math.PI / 2}
            settings={{
               duration: 1,
               delay: 0,
               nbParticles: 1,
               spawnMode: "burst",
               loop: false,
               startPositionMin: [0, 0, 0],
               startPositionMax: [0, 0, 0],
               startRotationMin: [0, 0, 0],
               startRotationMax: [0, 0, 0],
               particlesLifetime: [0.6, 0.6],
               speed: [5, 20],
               directionMin: [0, 0, 0],
               directionMax: [0, 0, 0],
               rotationSpeedMin: [0, 0, 1],
               rotationSpeedMax: [0, 0, 1],
               colorStart: ["skyblue"],
               colorEnd: ["skyblue"],
               size: [1, 1],
            }}
         />

         <VFXEmitter
            emitter="spheres"
            ref={spellEmitter}
            settings={{
               duration: 1,
               delay: 0,
               nbParticles: 100,
               spawnMode: "time",
               loop: false,
               startPositionMin: [0, 0, 0],
               startPositionMax: [0, 0, 0],
               startRotationMin: [0, 0, 0],
               startRotationMax: [0, 0, 0],
               particlesLifetime: [0.1, 0.1],
               speed: [5, 20],
               directionMin: [0, 0, 0],
               directionMax: [0, 0, 0],
               rotationSpeedMin: [0, 0, 0],
               rotationSpeedMax: [0, 0, 0],
               colorStart: ["white", "skyblue"],
               colorEnd: ["white"],
               size: [0.05, 0.2],
            }}
         >
            <VFXEmitter
               emitter="sparks"
               settings={{
                  duration: 0.5,
                  delay: 0,
                  nbParticles: 1000,
                  spawnMode: "time",
                  loop: false,
                  startPositionMin: [-0.1, 0, -0.1],
                  startPositionMax: [0.1, 0, 0.1],
                  startRotationMin: [0, 0, 0],
                  startRotationMax: [0, 0, 0],
                  particlesLifetime: [0.5, 1],
                  speed: [0.1, 5],
                  directionMin: [-1, 1, -1],
                  directionMax: [1, 1, 1],
                  rotationSpeedMin: [0, 0, 0],
                  rotationSpeedMax: [0, 0, 0],
                  colorStart: ["white", "skyblue"],
                  colorEnd: ["white", "skyblue"],
                  size: [0.01, 0.1],
               }}
            />
         </VFXEmitter>

         {/* Blast */}
         <VFXEmitter
            emitter="sparks"
            settings={{
               duration: 0.5,
               delay: 0.5,
               nbParticles: 120,
               spawnMode: "burst",
               loop: false,
               startPositionMin: [-0.5, 0, -0.5],
               startPositionMax: [0.5, 1, 0.5],
               startRotationMin: [0, 0, 0],
               startRotationMax: [0, 0, 0],
               particlesLifetime: [0.1, 1.5],
               speed: [0.5, 2],
               directionMin: [-1, 0, -1],
               directionMax: [1, 1, 1],
               rotationSpeedMin: [0, 0, 0],
               rotationSpeedMax: [0, 0, 0],
               colorStart: ["white", "skyblue"],
               colorEnd: ["white", "skyblue"],
               size: [0.01, 0.1],
            }}
         />
         <VFXEmitter
            emitter="icicle"
            position-y={0.1}
            settings={{
               duration: 1,
               delay: 0.5,
               nbParticles: 5,
               spawnMode: "burst",
               loop: false,
               startPositionMin: [-0.5, 0, -0.5],
               startPositionMax: [0.5, 0, 0.5],
               startRotationMin: [degToRad(180 - 20), 0, degToRad(-30)],
               startRotationMax: [degToRad(180 + 20), 0, degToRad(30)],
               particlesLifetime: [1, 1],
               speed: [5, 20],
               directionMin: [0, 0, 0],
               directionMax: [0, 0, 0],
               rotationSpeedMin: [0, 0, 0],
               rotationSpeedMax: [0, 0, 0],
               colorStart: ["skyblue", "white"],
               colorEnd: ["skyblue", "white"],
               size: [0.5, 1],
            }}
         />
      </group>
   );
};

const Fire = ({ ...props }) => {
   const spellEmitter = useRef();
   const time = useRef(0);
   useFrame((_, delta) => {
      time.current += delta;
      if (spellEmitter.current) {
         spellEmitter.current.position.y = Math.cos(time.current * Math.PI) * 5;
      }
   });

   const blastAudio = useRef();
   useEffect(() => {
      setTimeout(() => {
         blastAudio.current.play();
      }, 500);
   }, []);
   return (
      <group {...props}>
         {/* SFXs */}
         <PositionalAudio url="/sfxs/fire.mp3" autoplay distance={20} loop={false} />
         <PositionalAudio url="/sfxs/blast.mp3" distance={30} loop={false} ref={blastAudio} />

         {/* Buildup  */}
         <VFXEmitter
            emitter="spheres"
            ref={spellEmitter}
            settings={{
               duration: 1,
               delay: 0,
               nbParticles: 100,
               spawnMode: "time",
               loop: false,
               startPositionMin: [0, 0, 0],
               startPositionMax: [0, 0, 0],
               startRotationMin: [0, 0, 0],
               startRotationMax: [0, 0, 0],
               particlesLifetime: [0.1, 0.1],
               speed: [5, 20],
               directionMin: [0, 0, 0],
               directionMax: [0, 0, 0],
               rotationSpeedMin: [0, 0, 0],
               rotationSpeedMax: [0, 0, 0],
               colorStart: ["red", "orange", "yellow"],
               colorEnd: ["red"],
               size: [0.05, 0.2],
            }}
         >
            <VFXEmitter
               emitter="sparks"
               settings={{
                  duration: 0.5,
                  delay: 0,
                  nbParticles: 1000,
                  spawnMode: "time",
                  loop: false,
                  startPositionMin: [-0.1, 0, -0.1],
                  startPositionMax: [0.1, 0, 0.1],
                  startRotationMin: [0, 0, 0],
                  startRotationMax: [0, 0, 0],
                  particlesLifetime: [0.5, 1],
                  speed: [0.1, 5],
                  directionMin: [-1, 1, -1],
                  directionMax: [1, 1, 1],
                  rotationSpeedMin: [0, 0, 0],
                  rotationSpeedMax: [0, 0, 0],
                  colorStart: ["red", "orange"],
                  colorEnd: ["red", "orange"],
                  size: [0.01, 0.1],
               }}
            />
         </VFXEmitter>
         <VFXEmitter
            emitter="writings"
            position-y={0.1}
            rotation-x={-Math.PI / 2}
            settings={{
               duration: 1,
               delay: 0,
               nbParticles: 1,
               spawnMode: "burst",
               loop: false,
               startPositionMin: [0, 0, 0],
               startPositionMax: [0, 0, 0],
               startRotationMin: [0, 0, 0],
               startRotationMax: [0, 0, 0],
               particlesLifetime: [0.6, 0.6],
               speed: [5, 20],
               directionMin: [0, 0, 0],
               directionMax: [0, 0, 0],
               rotationSpeedMin: [0, 0, 5],
               rotationSpeedMax: [0, 0, 5],
               colorStart: ["yellow"],
               colorEnd: ["red"],
               size: [1, 1],
            }}
         />

         {/* Blast */}
         <VFXEmitter
            emitter="sparks"
            settings={{
               duration: 1,
               delay: 0.5,
               nbParticles: 1200,
               spawnMode: "burst",
               loop: false,
               startPositionMin: [-0.25, -0.1, -0.25],
               startPositionMax: [0.25, 1, 0.25],
               startRotationMin: [0, 0, 0],
               startRotationMax: [0, 0, 0],
               particlesLifetime: [0.1, 1],
               speed: [1, 3],
               directionMin: [-1, 0, -1],
               directionMax: [1, 5, 1],
               rotationSpeedMin: [0, 0, 0],
               rotationSpeedMax: [0, 0, 0],
               colorStart: ["red", "orange"],
               colorEnd: ["red", "orange"],
               size: [0.01, 0.16],
            }}
         />
      </group>
   );
};
