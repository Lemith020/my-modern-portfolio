# Location map image

Save your supplied Dampella map image in this folder as:

`dampella-map.png`

The contact location card displays this file and opens your existing Google Maps link when clicked. The image keeps its full proportions so map labels remain visible. Refresh the local page after adding the file.

The image path, alternative text, location label, and Maps link can be changed in `src/data/location.ts`. Until the image is available, the card displays its existing illustration.

Add the original image here, rather than editing generated files in `dist/`; the production build copies it automatically.
