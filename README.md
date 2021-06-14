== DRI Javascript 3D viewer

This repository contains a lightweight version of the JavaScript 3D viewer from the [DRI Repository appliation](https://github.com/Digital-Repository-of-Ireland/dri-app) and [DRI 3D Viewer](https://github.com/Digital-Repository-of-Ireland/DRI-3DViewer).

This version contains just the Javascript and a minimal html file, to make it easier to integrate into your own code.

The viewer currently works for stl, glb and gltf files. Support for more coming soon!

== Running

To run, copy the files to your webserver and open the index.html file.

Pass in a 3D data file in a url parameter named file.

E.g. http://127.0.0.1:8080/index.html?file=data/my3dmodel.stl


