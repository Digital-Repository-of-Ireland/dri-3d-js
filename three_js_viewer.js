$(document).ready(function () {

const QueryString = window.location.search; 
const urlParams = new URLSearchParams(QueryString); 
url = urlParams.get('file');

// Necessary for camera/plane rotation
// var degree = Math.PI/180;
// var  cameraTarget ,container;


container = document.createElement( 'div' );
document.body.appendChild( container );

// Setup
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
	50, 
	window.innerWidth / window.innerHeight, 
	0.1, 
	2000
);

// camera.position.set( 3, 0.15, 3 );
cameraTarget = new THREE.Vector3( 0, 0, 0 );

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);
container.appendChild( renderer.domElement );

//resize view as user change windows size
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.render(scene, camera)
}

// Adding controls
const controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0, 0)

var extension = url.split( '.' ).pop().toLowerCase();
var boxSize = new Array()
const absMaterial = new THREE.MeshNormalMaterial

switch(extension) {
    case 'stl':
        var stlLoader = new THREE.STLLoader();
        stlLoader.load( url, function ( geometry ) {
            var mesh = new THREE.Mesh( geometry, absMaterial);
            mesh.position.set( 0, 0, 0 );
            scene.add( mesh );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
			boxSize = getBoxSize(mesh);
            setCamera(boxSize);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        });
        break;

    case 'glb':
    case 'gltf':
        var dracoLoader = new THREE.DRACOLoader();
        var gltfLoader = new THREE.GLTFLoader();
        gltfLoader.setDRACOLoader( dracoLoader );
		gltfLoader.load( url, function (gltf) {
			scene.add( gltf.scene );
		    boxSize = getBoxSize(gltf.scene);
            setCamera(boxSize);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        } );
        break;

    case 'fbx':
       var fbxLoader = new THREE.FBXLoader( );
       fbxLoader.load( url, function ( fbx ) {
            scene.add(fbx);
		    boxSize = getBoxSize(fbx);
		    setCamera(boxSize);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        } ); 
        break;

    case 'obj':
        var objLoader = new THREE.OBJLoader( );
        objLoader.load( url, function (object) {
            scene.add( object );
            boxSize = getBoxSize(object);
            setCamera(boxSize);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        } );
        break;

    default:
        alert("Unsupported file type " + extension);
}

// Add lights
var hemiLight = new THREE.HemisphereLight( 0x443333, 0x111122, 0.61 );
hemiLight.position.set( 0, 50, 0 );

// Add hemisphere light to scene   
scene.add( hemiLight );
addShadowedLight( 1, -1, 1, 0xffaa00, 1.35 );
addShadowedLight( 1, 1, - 1, 0xffaa00, 1 );

function getBoxSize(object){
    let boundingBox = new THREE.Box3().setFromObject( object );
    let boxSize = new THREE.Vector3();
    boundingBox.getSize(boxSize);
    return [Math.round(boxSize.x),Math.round(boxSize.y),Math.round(boxSize.z)];
}

// Set background color, verify size of object, set camera position, ambient light and insert axes in the scene 
function setCamera(objectSize){
    // scene.background = new THREE.Color(0xfffff0);
    scene.background = new THREE.Color(0x000000);
    camera.lookAt(new THREE.Vector3(0,0,0));
    let x,y,z;

    if(objectSize[0] != undefined && objectSize[1] != undefined && objectSize[1] != undefined){
        x = objectSize[0];
        y = objectSize[1];
        z = objectSize[2];
    } else {
        var degree = Math.PI/180;
        z = 120;
        y = 120;
        x = -45 * degree;
    }

    camera.position.set(y, x, z+x+y);
    const light = new THREE.PointLight();
    light.position.set(0, 0, z+x+y);
    light.position.set(0, 0, -z);
    scene.add(light);
    const ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);
	cameraTarget = new THREE.Vector3( 0, 0, 0 );
}

// Draw scene
var render = function () {
	camera.lookAt( cameraTarget );
    renderer.render(scene, camera);
};

function onWindowResize() {
camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize( window.innerWidth, window.innerHeight );
}

function addShadowedLight( x, y, z, color, intensity ) {``
    var directionalLight = new THREE.DirectionalLight( color, intensity );
	directionalLight.position.set( x, y, z );
    scene.add( directionalLight );
    directionalLight.castShadow = true;

    var d = 1;
    directionalLight.shadow.camera.left = - d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = - d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;
    directionalLight.shadow.bias = - 0.002;
}

animate()

//recursive function to update scene continuously
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

});
