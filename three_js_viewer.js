import('https://threejs.org/examples/jsm/loaders/OBJLoader.js');
$(document).ready(function () {

const QueryString = window.location.search; 
const urlParams = new URLSearchParams(QueryString); 
url = urlParams.get('file');

// Necessary for camera/plane rotation
var degree = Math.PI/180;
var  cameraTarget ,container;


container = document.createElement( 'div' );
document.body.appendChild( container );

// Setup
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set( 3, 0.15, 3 );
cameraTarget = new THREE.Vector3( 0, - 0.25, 0 );


var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;

//document.body.appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;
container.appendChild( renderer.domElement );


scene.background = new THREE.Color( 0x72645b );

// Resize after viewport-size-change



window.addEventListener( 'resize', onWindowResize, false );



// Adding controls
controls = new THREE.OrbitControls(camera, renderer.domElement);


  
// Ground (comment out line: "scene.add( plane );" if Ground is not needed...)
var plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(150, 150),
    new THREE.MeshPhongMaterial( { color: 0x999999, specular: 0x101010 } )
);

plane.rotation.x = - Math.PI / 2;
plane.position.y = - 4;
scene.add( plane );

var extension = url.split( '.' ).pop().toLowerCase();

switch(extension) {
    case 'stl':
        var loader = new THREE.STLLoader();

        loader.load( url, function ( geometry ) {
            var material = getMaterial('phong', 0xff5533, 0x111111, 200);
            var mesh = new THREE.Mesh( geometry, material );
            mesh.position.set( 0, - 0.25, 0.6 );
            mesh.rotation.set( - Math.PI / 2, 0, 0 );
            mesh.scale.set( 0.5, 0.5, 0.5 );
            scene.add( mesh );
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        } );
        break;

    case 'glb':
    case 'gltf':
        renderer.outputEncoding = THREE.sRGBEncoding;
        var dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('./lib/draco/gltf/');

        var loader = new THREE.GLTFLoader();

        loader.setDRACOLoader( dracoLoader );
		loader.load( url, function ( gltf ) {

			scene.add( gltf.scene );

		} );
        break;

    case 'fbx':
       var loader = new THREE.FBXLoader( );
       loader.load( url, function ( fbx ) {
          scene.add(fbx);
        } ); 
        break;

    case 'obj':
        var loader = new THREE.OBJLoader( );
        loader.load( url, function ( object ) {
            scene.add( object );
        } );
        break;

    default:
        alert("Unsupported file type "+extension);
}




// Camera positioning
camera.position.z = 120;
camera.position.y = 120;
camera.rotation.x = -45 * degree;

// Ambient light (necessary for Phong/Lambert-materials, not for Basic)
//var ambientLight = new THREE.AmbientLight( 0x00ff00, 1);  // model color
//scene.add(ambientLight);

// Add lights
var hemiLight = new THREE.HemisphereLight( 0x443333, 0x111122, 0.61 );
hemiLight.position.set( 0, 50, 0 );
// Add hemisphere light to scene   
scene.add( hemiLight );


addShadowedLight( 1, 1, 1, 0xffffff, 1.35 );
addShadowedLight( 0.5, 1, - 1, 0xffaa00, 1 );

//var dirLight = new THREE.DirectionalLight( 0x00ff00, 0.54 );
//    dirLight.position.set( -8, 12, 8 );
//    dirLight.castShadow = true;
//    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
// Add directional Light to scene    
//    scene.add( dirLight );



// Draw scene
var render = function () {

	//var timer = Date.now() * 0.0005;

	//camera.position.x = Math.cos( timer ) * 3;
	//camera.position.z = Math.sin( timer ) * 3;

	camera.lookAt( cameraTarget );
    renderer.render(scene, camera);
};

// Run game loop (render,repeat)
var GameLoop = function () {
   
    requestAnimationFrame(GameLoop);
    render();


};


function onWindowResize() {

camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
renderer.setSize( window.innerWidth, window.innerHeight );

}



function addShadowedLight( x, y, z, color, intensity ) {

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

function getMaterial(type, color) {
	var selectedMaterial;
	var materialOptions = {
		color: color === undefined ? 'rgb(255, 255, 255)' : color,
	};

	switch (type) {
		case 'basic':
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
			break;
		case 'lambert':
			selectedMaterial = new THREE.MeshLambertMaterial(materialOptions);
			break;
		case 'phong':
			selectedMaterial = new THREE.MeshPhongMaterial(materialOptions);
			break;
		case 'standard':
			selectedMaterial = new THREE.MeshStandardMaterial(materialOptions);
			break;
		default: 
			selectedMaterial = new THREE.MeshBasicMaterial(materialOptions);
			break;
	}

	return selectedMaterial;
}



GameLoop();


});
