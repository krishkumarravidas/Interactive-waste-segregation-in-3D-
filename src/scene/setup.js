import * as THREE from 'three';
export function setupScene(host) {
 const scene=new THREE.Scene(); scene.background=new THREE.Color('#d9e7dc'); scene.fog=new THREE.Fog('#d9e7dc',14,32);
 const camera=new THREE.PerspectiveCamera(38,1,.1,100); camera.position.set(0,7,13); camera.lookAt(0,1,0);
 const renderer=new THREE.WebGLRenderer({antialias:!matchMedia('(max-width: 700px)').matches,alpha:false}); renderer.setPixelRatio(Math.min(devicePixelRatio,matchMedia('(max-width: 700px)').matches?1.25:1.75)); renderer.shadowMap.enabled=false; renderer.setSize(host.clientWidth,host.clientHeight); host.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xffffff,0x627366,2)); const sun=new THREE.DirectionalLight(0xfff5df,2.1); sun.position.set(-5,10,7); scene.add(sun);
 const mat=(color,roughness=.8)=>new THREE.MeshStandardMaterial({color,roughness});
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(60,60),mat('#c8d5c9')); floor.rotation.x=-Math.PI/2; floor.position.y=-.08; scene.add(floor);
 const wall=new THREE.Mesh(new THREE.BoxGeometry(18,7,.3),mat('#edf0df')); wall.position.set(0,3,-5); scene.add(wall);
 const table=new THREE.Mesh(new THREE.BoxGeometry(4.5,.32,2.1),mat('#8d6546')); table.position.set(0,1.55,0); scene.add(table);
 const legs=new THREE.Group(); for(const x of [-1.9,1.9])for(const z of [-.75,.75]){const l=new THREE.Mesh(new THREE.BoxGeometry(.16,1.55,.16),mat('#624834'));l.position.set(x,.76,z);legs.add(l)}scene.add(legs);
 const colors={wet:'#17845f',dry:'#2366be',hazardous:'#c5493d'}, bins={};
 for(const [i,category] of ['wet','dry','hazardous'].entries()) {const g=new THREE.Group();g.position.set((i-1)*3.25,0,-2.4); const body=new THREE.Mesh(new THREE.BoxGeometry(1.55,1.85,1.25),mat(colors[category]));body.position.y=.93;g.add(body);const lid=new THREE.Mesh(new THREE.BoxGeometry(1.65,.16,1.35),mat('#202e2d'));lid.position.y=1.9;g.add(lid);const face=new THREE.Mesh(new THREE.BoxGeometry(1.05,.45,.06),mat('#fffdf5'));face.position.set(0,1.35,.66);g.add(face);g.userData.category=category;scene.add(g);bins[category]=g;}
 return {scene,camera,renderer,bins,table,host,THREE};
}
