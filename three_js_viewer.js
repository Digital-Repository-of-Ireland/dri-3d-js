$(document).ready(function () {

const QueryString = window.location.search; 
const urlParams = new URLSearchParams(QueryString);
url = urlParams.get('file');
urlMat = urlParams.get('material');

container = document.createElement( 'div' );
document.body.appendChild( container );

// Scene setup 
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
	50, 
	window.innerWidth / window.innerHeight, 
	0.1, 
	5000
);

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio); 
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
container.appendChild( renderer.domElement );

//resize view as user change windows size
window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
}


// Add controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 0, 0);

var extension = url.split( '.' ).pop().toLowerCase();
var boxSize = new Array();
const absMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x1111111, 
    wireframe: false, 
    flatShading: false, 
    transparent: true,
});

var isCustomMaterial = false;

switch(extension) {
    case 'stl':
        var stlLoader = new THREE.STLLoader();
        stlLoader.load( url, function ( geometry ) {
            var mesh = new THREE.Mesh( geometry, absMaterial);
            renderObject(mesh);
            guiInitializer(absMaterial, mesh);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        });
        break;

    case 'ply':
        const plyLoader = new THREE.PLYLoader();
        plyLoader.load( url, function ( ply ) {
            ply.computeVertexNormals()
            const mesh = new THREE.Mesh(ply, absMaterial)
            renderObject(mesh);
            guiInitializer(absMaterial, mesh);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        } ); 
        break;

    case 'glb':
    case 'gltf':
        var dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('/lib/three/examples/js/libs/draco/')
        var gltfLoader = new THREE.GLTFLoader();
        gltfLoader.setDRACOLoader( dracoLoader );
		gltfLoader.load( url, function (gltf) {
            materialConfig(gltf.scene);
            renderObject(gltf.scene);
            guiInitializer(absMaterial, gltf.scene);
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
            materialConfig(fbx);
            renderObject(fbx);
            guiInitializer(absMaterial, fbx);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        } ); 
        break;

    case 'obj':
        if(urlMat == null)
        {
            var objLoader = new THREE.OBJLoader( );
            objLoader.load( url, function (obj) {
                materialConfig(obj);
                renderObject(obj);
                guiInitializer(absMaterial, obj);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
            },
            (error) => {
                console.log(error);
            } );
        } else {
            const mtlLoader = new THREE.MTLLoader();
            mtlLoader.load(
                urlMat,
                (materials) => {
                    materials.preload();
                    const objLoader = new THREE.OBJLoader();
                    objLoader.setMaterials(materials);
                    objLoader.load(
                        url,
                        (objMTL) => {
                            renderObject(objMTL);
                            guiInitializer(absMaterial, objMTL);
                        },
                        (xhr) => {
                            console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
                        },
                        (error) => {
                            console.log(error);
                        }
                    )
                },
                (xhr) => {
                    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
                },
                (error) => {
                    console.log(error);
                }
            );
        }
        break;

    case 'dae':
        const colladaL = new THREE.ColladaLoader();
        colladaL.load( url, function(dae){
            materialConfig(dae.scene);
            renderObject(dae.scene);
            guiInitializer(absMaterial, dae.scene);
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
        },
        (error) => {
            console.log(error)
        } );
        
        break;

    default:
        alert("Unsupported file type: " + extension);
}

function guiInitializer(material, object){

    const options = { 
        wireframe: false,
        object: 0x1111111,
        background: 0xfffff0,
        lights: true,
        transparent: true,
    }
    const gui = new dat.GUI();

    const materialFolder = gui.addFolder('Material Control');
    materialFolder.add(material, 'transparent').onChange(() => material.needsUpdate = true);
    materialFolder.add(material, 'opacity', 0, 1, 0.01);
    materialFolder.add(material, 'wireframe').onChange(() => material.needsUpdate = true);
    materialFolder.add(material, 'flatShading').onChange(() => material.needsUpdate = true);
    materialFolder.add(object, 'visible');
    // materialFolder.open();

    const cameraFolder = gui.addFolder('Camera Control');
    cameraFolder.add(object.rotation, 'x', 0, Math.PI * 2);
    cameraFolder.add(object.rotation, 'y', 0, Math.PI * 2);
    cameraFolder.add(object.rotation, 'z', 0, Math.PI * 2);
    // cameraFolder.open();

    const colorFolder = gui.addFolder('Color Control');
    colorFolder.addColor(options, 'background').onChange( col => {
        scene.background = new THREE.Color(col);
    });
    colorFolder.addColor(options, 'object').onChange( col => {
        isCustomMaterial = true;
        absMaterial.color = new THREE.Color(col);
        if(['fbx', 'glb', 'gltf', 'obj', 'dae' ].includes(extension)) {
            object.traverse( function(child){
                if(child.isMesh){
                    materialConfig(child);
                }
            });
        }
    });
    // colorFolder.open();
    gui.close();

}

function materialConfig(object){
    object.traverse( function(child){
        if(child.isMesh){
            if(isCustomMaterial == true){
                child.material = absMaterial;
            }
            child.shadow = true;
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
}

function renderObject(object){
    scene.add(object);
    object.position.set(0, 0, 0);
    object.castShadow = true;
    object.receiveShadow = true;
    boxSize = getBoxSize(object);
    setCamera(boxSize);
}

function getBoxSize(object){
    let boundingBox = new THREE.Box3().setFromObject( object );
    let boxSize = new THREE.Vector3();
    boundingBox.getSize(boxSize);
    return [Math.round(boxSize.x),Math.round(boxSize.y),Math.round(boxSize.z)];
}

function setCamera(objectSize){
    scene.background = new THREE.Color(0xfffff0);
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

    // Add lights
    var hemiLight = new THREE.HemisphereLight( 0x443333, 0x111122, 0.61 );
    hemiLight.position.set( 0, 50, 0 );
    scene.add( hemiLight );
    addShadowedLight( 1, -1,  1, 0xffaa00, 1.35 );
    addShadowedLight( 1,  1, -1, 0xffaa00, 1 );
    const light1 = new THREE.PointLight();
    const light2 = new THREE.PointLight();
    light1.position.set(0, 0, z+x+y);
    light2.position.set(0, 0, -z-x-y);
    scene.add(light1);
    scene.add(light2);
    const ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);
	cameraTarget = new THREE.Vector3( 0, 0, 0 );
}

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

//recursive function to update scene continuously
animate()
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

});
