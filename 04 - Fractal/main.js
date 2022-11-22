import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const container = document.getElementById('canvas-container');
const width = container.clientWidth;
const height = container.clientHeight;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height);
const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(140, 140, 140);
controls.update();

const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 300),
    new THREE.MeshStandardMaterial({ color: 0x888888, side: THREE.DoubleSide })
);
plane.rotation.x = 0.5 * Math.PI;
plane.position.y = -50;
scene.add(plane);

// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(81, 81, 81),
//     new THREE.MeshBasicMaterial({ color: 0x00ff00 })
// );
// scene.add(cube);

function createCube(size) {
    return new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    );
}

const group = new THREE.Group();
function mengerSponge(cubeSize, gap, level, position, group) {
    if (level == 0) {
        //group.add(createCube(cubeSize));
        //scene.add(group);
        const cube = createCube(cubeSize);
        cube.position.set(...position);
        group.add(cube);

        return;
    }
    //group.position.set(level * -30, level * -30, level * -30);

    const n = 3;
    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            for (let z = 0; z < n; z++) {
                let count = 0;
                if (x == 1) count++;
                if (y == 1) count++;
                if (z == 1) count++;

                if (count >= 2) continue;

                const pos = cubeSize / 3 + gap / 3;
                const [lastPosX, lastPosY, lastPosZ] = position;
                mengerSponge(
                    cubeSize / 3,
                    gap / 3,
                    level - 1,
                    [
                        lastPosX + pos * x,
                        lastPosY + pos * y,
                        lastPosZ + pos * z,
                    ],
                    group
                );
            }
        }
    }
}
group.name = 'sponge';
scene.add(group);
const cubeSize = 81;
const gap = 1;
const level = 0;

mengerSponge(cubeSize, gap, level, [0, 0, 0], group);

const light1 = new THREE.DirectionalLight(0xffffff, 1);
scene.add(light1);
light1.position.set(40, 110, 60);

const light2 = new THREE.DirectionalLight(0xffffff, 1);
scene.add(light2);
light2.position.set(-40, 110, -60);

function animate() {
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
console.log(scene);

document.getElementById('form-level').addEventListener('change', (e) => {
    const level = e.target.value;
    let oldSponge = scene.getObjectByName('sponge');
    scene.remove(oldSponge);

    const group = new THREE.Group();
    group.name = 'sponge';
    mengerSponge(cubeSize, 1, level, [0, 0, 0], group);
    scene.add(group);
});
