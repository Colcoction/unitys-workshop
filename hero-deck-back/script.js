/*
============================================================================
Loading and app prep-work
============================================================================
*/


// Get and load graphics
// Note: Google Drive simple view link: https://drive.google.com/uc?id=FILE_ID
let imagesToPreload = [
  ['Burst', '../_resources/Hero deck back burst.png'],
  ['Bars', '../_resources/Hero deck back bars.png'],
  ['Border', '../_resources/Hero deck back border.png'],
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
HERO_DECK_BACK_IMAGES.forEach(key => loadedUserImages[key] = null);

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

  let graphicFilter = 'grayscale(100%)              contrast(30%) brightness(145%)';
  let artFilter = 'grayscale(100%) brightness(150%) contrast(30%) brightness(145%)';

  // 1-grayscale: makes monochromatic (when combined with color filter farther down in code)
  // 2-brightness: (artFilter only) compresses high end of value range (brings everything closer to "white")
  // 3-contrast: compresses whole value range (brings everything closer to a middle "gray")
  // 4-brightness: raises whole value range

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
  drawArtInCroppedArea('hdb_leftArt');
  drawArtInCroppedArea('hdb_rightArt');
  drawArtInCroppedArea('hdb_bottomArt');

  // Return to graphic filter
  ctx.filter = graphicFilter;

  // Bars graphic
  ctx.drawImage(loadedGraphics['Bars'], 0, 0, canvas.width, canvas.height);

  // Remove the drawing filter
  ctx.filter = 'none';
  ctx.save();

  // Get user input color settings
  let hue = $('#inputColorHueSlider').val();
  let saturation = $('#inputColorSaturationSlider').val();

  // Colorize the whole background
  ctx.globalCompositeOperation = 'color';
  ctx.fillStyle = `hsl(${hue}, ${saturation}%, 50%)`; // Max values: (360, 100%, 100%)
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'source-over'; // Reset to normal drawing mode

  // Draw the hero's name graphic
  drawArtInCroppedArea('hdb_heroNameArt');

  // Last of all, draw the card border
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(loadedGraphics['Border'], 0, 0, canvas.width, canvas.height);

}









/* NOTEPAD




*/