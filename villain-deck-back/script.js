/*
============================================================================
Loading and app prep-work
============================================================================
*/


// Get and load graphics
// Note: Google Drive simple view link: https://drive.google.com/uc?id=FILE_ID
let imagesToPreload = [
  ['Burst', '../_resources/Villain deck back background.png'],
  ['Bars', '../_resources/Villain deck back bars.png'],
  ['Border', '../_resources/Villain deck back border.png'],
  ['test_ball', '../_resources/test_ball.png'],
  ['test_gyro', '../_resources/test_gyro.png'],
  ['test_shell', '../_resources/test_shell.png'],
  ['test_hyperspin', '../_resources/test_hyperspin.png'],
  ['test_name', '../_resources/test_namelogo.png']
]

// Make an object where each item is key = image name, value = Image element
let loadedGraphics = {};
for (let i = 0; i < imagesToPreload.length; i++) {
  let imageInfo = imagesToPreload[i];
  let newImage = new Image();
  newImage.src = imageInfo[1];
  loadedGraphics[imageInfo[0]] = newImage;
  // Draw the canvas once the final image has loaded
  if (i === imagesToPreload.length - 1) {
    newImage.onload = function (e) {
      drawCardCanvas();
    }
  }
}

// This object is where user input images (specifically Image objects) are stored
VILLAIN_DECK_BACK_IMAGES.forEach(key => loadedUserImages[key] = null);

// Handle user image uploading
$('.inputImageFile').on('input', function () {
  // Get the uploaded file
  let uploadedImage = this.files[0];
  // If a file has been uploaded...
  if (uploadedImage) {
    // Turn that file into a useable Image object
    let imagePurpose = this.dataset.imagePurpose;
    loadedUserImages[imagePurpose] = new Image();
    loadedUserImages[imagePurpose].src = URL.createObjectURL(uploadedImage);
    loadedUserImages[imagePurpose].onload = function () {
      // Once the Image has loaded, redraw the canvas so it immediately appears
      drawCardCanvas();
    }
  }
})


/*
============================================================================
Drawing the canvas
============================================================================
*/

// Draw the canvas from scratch (this function gets called whenever an input changes)
function drawCardCanvas() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Reset context states
  ctx.restore();
  ctx.save();

  // Draw a blank white rectangle background (for if no image so it's not awkwardly transparent)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Reset context states
  ctx.restore();
  ctx.save();

  // Draw the card background

  // Filter the colors of the background pieces that will be drawn

  /* old values
  let graphicFilter = 'grayscale(100%)              contrast(26%) brightness(150%)';
  let artFilter = 'grayscale(100%) brightness(150%) contrast(26%) brightness(150%)';
  */

  // I might want to try adding in a contrast(120%) filter to the artFilter, before the first brightness filter, to try to bring more consistent darks into the render

  let graphicFilter = 'grayscale(100%)';
  let artFilter = 'grayscale(100%) brightness(75%)';

  // Attempt at a more official-looking filter:
  // let artFilter = 'grayscale(100%) contrast(120%) brightness(270%) brightness(60%)';
  // 1-grayscale: self explanatory
  // 2-contrast >100%: move the dark end of the value range lower, to make near-blacks true black
  // 3-brightness >100%: move the light end of the value range higher, to make everything except true blacks lighter and flatter.
  // 4-brightness <100%: move the light end of the value range lower, to make everything except true blacks darker

  // It seems that...
  // Brightness moves the light end of the value range (to be mathematically higher in value)
  // Contrast moves both ends of the value range (away or towards the center)
  // The value range framework is normalized after every transformation

  // Start with graphic filter
  ctx.filter = graphicFilter;

  // Blank background default
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Burst graphic
  ctx.drawImage(loadedGraphics['Burst'], 0, 0, canvas.width, canvas.height);

  // Switch to art filter (only slightly different)
  ctx.filter = artFilter;

  // Draw each art image in its cropped space
  drawArtInCroppedArea('vdb_topArt');
  drawArtInCroppedArea('vdb_leftArt');
  drawArtInCroppedArea('vdb_rightArt');

  // Return to graphic filter
  ctx.filter = graphicFilter;

  // Remove the drawing filter
  ctx.filter = 'none';
  ctx.save();

  // (Here is where the color choice would come in, but it was removed from this page since villains are always pure grayscale.)

  // Last of all, draw the card border
  ctx.globalCompositeOperation = 'source-over';
  // Bars graphic
  ctx.drawImage(loadedGraphics['Bars'], 0, 0, canvas.width, canvas.height);
  ctx.drawImage(loadedGraphics['Border'], 0, 0, canvas.width, canvas.height);

  // Draw the hero's name graphic
  drawArtInCroppedArea('vdb_villainNameArt');
}









/* NOTEPAD




*/