/*
============================================================================
Common listeners
============================================================================
*/
// Canvas preview size button
$('.previewSizeButton').on('click', function (e) {
  // Get the button's text
  let buttonText = e.target.textContent;
  // This should never happen, but if the text content doesn't match an expected type, log a warning and set it to medium
  if (!CARD_PREVIEW_SIZES.includes(buttonText)) {
      console.warn(`Someone tried to set the size to ${buttonText}, but the only available sizes are [${CARD_PREVIEW_SIZES.join(", ")}]. Setting the size to ${MEDIUM}.`);
      buttonText = MEDIUM;
  }
  // Based on the button's text (the name of the size), determine the new canvas size
  setCanvasWidth(buttonText);
});


// Range sliders with text box - when one changes, copy its value to the other
$('.rangeSlider').on('input', function (e) {
  $(this).next().val($(this).val());
});
$('.rangeText').on('input', function (e) {
  $(this).prev().val($(this).val());
});
// Also, when the page loads, copy the default value from the slider into the text box
$('.rangeText').each(function (e) {
  $(this).val($(this).prev().val());
});


// Populate inputs with default values on startup
$('*[data-image-purpose]').each(function () {
  if (this.dataset.default) {
      this.value = this.dataset.default;
  }
});


// Resets art adjustments and removes an image for buttons that are tagged with both relevant classes. This allows us to avoid
// making multiple redundant calsl to drawCardCanvas after the reset functions are complete.
$('.adjustmentResetButton.clearImageButton').on('click', function () {
  const areaName = this.dataset.imagePurpose;
  resetDataImageSettings(areaName);
  // Remove uploaded image
  $(`.contentInput[data-image-purpose="${areaName}"][type="file"]`).each(function () {
      this.value = '';
      loadedUserImages[areaName] = null;
  });
  // Redraw canvas (since "on input" event didn't trigger)
  drawCardCanvas();
});
$('.adjustmentResetButton:not(.clearImageButton)').on('click', function () {
  const areaName = this.dataset.imagePurpose;
  resetDataImageSettings(areaName)
  // Redraw canvas (since "on input" event didn't trigger)
  drawCardCanvas();
});


// Info buttons
$('.infoButton').on('click', function (e) {
  // Make screen overlay visible
  $('.screenOverlay').css({ 'display': 'block' });
  // Make specific info box visible
  let buttonText = e.target.textContent;
  let boxId = '';
  if (buttonText == 'Documentation') {
      boxId = 'documentation';
  }
  else if (buttonText == 'Credits') {
      boxId = 'credits';
  }
  $('.' + boxId).css({ 'display': 'block' });
});


// Close buttons (in info boxes)
$('.closeButton, .screenOverlayNegativeSpace').on('click', function (e) {
  // Make screen overlay and info boxes invisible
  $('.screenOverlay, .overlayBox').css({ 'display': 'none' });
});


// Download button
$('#downloadButton').on('click', function () {
  // Use the title input for the default file name
  const link = document.createElement('a');
  link.download = `${$("#inputTitle")?.val()?.trim() || DEFAULT_DOWNLOAD_NAME}.png`;
  link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  link.click();
  link.remove();
});


// Listeners that trigger a call to draw the card. We draw once on load to help with testing things like hardcoded effect text, and once on any content input (including each
// time a character is typed in a text input).
$(window).on('load', drawCardCanvas);
$('.contentInput').on('input', drawCardCanvas);

// Toggle high contrast phase labels and re-draw
$('#inputUseHighConstrast').on('input', function () {
  useHighContrastPhaseLabels = this.checked;
  drawCardCanvas();
});

// Toggle Suddenly! and re-draw
$('#suddenly').on('input', function () {
  suddenly = this.checked;
  drawCardCanvas();
});

// Toggle card border and re-draw
$('#inputDisplayBorder').on('input', function () {
  showBorder = this.checked;
  drawCardCanvas();
});

// Toggle variant
$('#inputVariantToggle').on('input', function () {
  isVariant = this.checked;
  drawCardCanvas();
});

// Toggle variant text color
$('#inputVariantColor').on('input', function () {
  variantTextColor = this.checked;
  drawCardCanvas();
});

// Parse JSON input buttom
$('#parseJsonInputButton').on('click', function () {
  // attempt to parse the JSON
  let jsonString = $('#jsonInput').prop('value');
  // get rid of extra commas that happen when pasting from array
  if (jsonString.slice(-1) == ',') {
    jsonString = jsonString.slice(0,-1)
  }
  try {
    let jsonData = JSON.parse(jsonString);
    parseJSONData(jsonData);
  } catch(err) {
    $('#jsonError').text("JSON Parse error:" + err.message);
    return;
  }
  $('#jsonError').text("");
})

// Output JSON Input button
$('#outputJsonButton').on('click', function () {
  outputJSONData(CARD_FORM, ORIENTATION);
});

/*
============================================================================
Regions for Image Drawing
============================================================================
*/
imageAreas = {
  /*==========================================================
  Hero Character Card Front
  ==========================================================*/
  // Hero Name
  hccf_heroNameArt: {
    pathShape: coordinatesToPathShape([
      [2.5, 2],
      [97.5, 2],
      [97.5, 30],
      [2.5, 30]
    ]),
    scaleStyle: 'fit',
    vAlign: 'top',
    getImage: function () {
      return getUserImage(NAME_LOGO);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(NAME_LOGO);
    }
  },
  // Art in Foreground
  hccf_foregroundArt: {
    pathShape: coordinatesToPathShape([
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(FOREGROUND_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(FOREGROUND_ART);
    }
  },
  hccf_backgroundArt: {
    pathShape: coordinatesToPathShape([
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      //return loadedGraphics['test_herocc'];
      return getUserImage(BACKGROUND_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(BACKGROUND_ART);
    }
  },
  hccf_nemesisIcon: {
    pathShape: coordinatesToPathShape([
      [12, 91.5],
      [13, 90.5],

      [24, 90.5],
      [25, 91.5],

      [19, 96.25],
      [18, 96.25]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(NEMESIS_ICON);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(NEMESIS_ICON);
    }
  },
  /*==========================================================
  Villain Character Card
  ==========================================================*/
  // Villain Name
  vcc_nameLogo: {
    pathShape: coordinatesToPathShape([
      [0.5, 2],
      [99.5, 2],
      [99.5, 40],
      [0.5, 40]
    ]),
    scaleStyle: 'fit',
    vAlign: 'top',
    getImage: function () {
      return getUserImage(NAME_LOGO);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(NAME_LOGO);
    }
  },
  // Art in Foreground
  vcc_foregroundArt: {
    pathShape: coordinatesToPathShape([
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(FOREGROUND_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(FOREGROUND_ART);
    }
  },
  vcc_backgroundArt: {
    pathShape: coordinatesToPathShape([
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      //return loadedGraphics['test_herocc'];
      return getUserImage(BACKGROUND_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(BACKGROUND_ART);
    }
  },
  vcc_nemesisIcon: {
    pathShape: coordinatesToPathShape([
      [48.9, 89.8],
      [49.4, 88.7],

      [55.0, 88.7],
      [55.5, 89.8],

      [52.5, 96.5],
      [51.9, 96.5]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(NEMESIS_ICON);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(NEMESIS_ICON);
    }
  },
  /*==========================================================
  Hero Deck Back
  ==========================================================*/
  // Hero Name Art
  hdb_heroNameArt: {
    pathShape: coordinatesToPathShape([
      [2.5, 2],
      [97.5, 2],
      [97.5, 45],
      [2.5, 45]
    ]),
    scaleStyle: 'fit',
    vAlign: 'top',
    getImage: function () {
      return getUserImage(NAME_LOGO);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(NAME_LOGO);
    }
  },
  // Left Art
  hdb_leftArt: {
    pathShape: coordinatesToPathShape([
      [2.5, 32],
      [46, 25.5],
      [60.5, 65],
      [2.5, 77]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(BACK_LEFT_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(BACK_LEFT_ART);
    }
  },
  // Right Art
  hdb_rightArt: {
    pathShape: coordinatesToPathShape([
      [46.5, 25.5],
      [97.5, 17],
      [97.5, 57.5],
      [61, 65]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(BACK_RIGHT_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(BACK_RIGHT_ART);
    }
  },
  // Bottom Art
  hdb_bottomArt: {
    pathShape: coordinatesToPathShape([
      [2.5, 78],
      [97.5, 58],
      [97.5, 98],
      [2.5, 98]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(BACK_BOTTOM_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(BACK_BOTTOM_ART);
    }
  },
  /*==========================================================
  Villain Deck Back
  ==========================================================*/
  // Villain Name Art
  vdb_villainNameArt: {
    pathShape: coordinatesToPathShape([
      [2.5, 80],
      [97.5, 80],
      [97.5, 100],
      [2.5, 100]
    ]),
    scaleStyle: 'fit',
    vAlign: 'top',
    getImage: function () {
      return getUserImage(NAME_LOGO);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(NAME_LOGO);
    }
  },
  // Top Art
  vdb_topArt: {
    pathShape: coordinatesToPathShape([
      [2.5, 2.5],
      [97.5, 2.5],
      [97.5, 33],
      [65, 41],
      [2.5, 32]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(BACK_TOP_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(BACK_TOP_ART);
    }
  },
  // Right Art
  vdb_leftArt: {
    pathShape: coordinatesToPathShape([
      [65, 41],
      [97.5, 33],
      [97.5, 90],
      [40, 81]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(BACK_RIGHT_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(BACK_RIGHT_ART);
    }
  },
  // Left Art
  vdb_rightArt: {
    pathShape: coordinatesToPathShape([
      [2.5, 32],
      [65, 41],
      [40, 81],
      [2.5, 77]
    ]),
    scaleStyle: 'fill',
    vAlign: 'center',
    getImage: function () {
      return getUserImage(BACK_LEFT_ART);
    },
    getAdjustments: function () {
      return getUserImageAdjustments(BACK_LEFT_ART);
    }
  }
}

// Helper function to get selection strings for input image variables
function getImagePurposeSelector(className, purpose = "") {
  if(purpose == "") {
    return `.${className}`;
  } else {
    return `.${className}[data-image-purpose="${purpose}"]`;
  }
}

// Get the input image
function getUserImage(areaName) {
  return loadedUserImages[areaName];
}

// Get the input image adjustments
function getUserImageAdjustments(areaName) {
  let xOffset, yOffset, scale;
  // Get the user input percentages
  xOffset = $(getImagePurposeSelector(IMAGE_X, areaName)).val() / 100;
  yOffset = $(getImagePurposeSelector(IMAGE_Y, areaName)).val() / 100 * -1;
  scale = $(getImagePurposeSelector(IMAGE_ZOOM, areaName)).val() / 100;
  // Return a nice object with those values
  let adjustments = {
    xOffset: xOffset,
    yOffset: yOffset,
    scale: scale
  }
  return adjustments;
}

// Function to handle creating and providing information about a region to draw an image inside
function coordinatesToPathShape(coordinates) {

  let pathShape = new Path2D(), rightmostX = pw(0), leftmostX = pw(100), bottommostY = ph(0), topmostY = ph(100);

  // Create the path shape by iterating through the coordinates
  for (let i = 0; i < coordinates.length; i++) {
    // Grab the pair of coordinates (and convert them from percentage values to canvas values)
    let x = pw(coordinates[i][0]), y = ph(coordinates[i][1]);

    // If first pair of coordinates, use moveTo to start shape
    if (i === 0) {
      pathShape.moveTo(x, y);
    }
    // Otherwise, use lineTo to continue shape
    else {
      pathShape.lineTo(x, y);
    }
    // Keep track of path extremes for centering the image later
    if (x > rightmostX) {
      rightmostX = x;
    }
    if (x < leftmostX) {
      leftmostX = x;
    }
    if (y > bottommostY) {
      bottommostY = y;
    }
    if (y < topmostY) {
      topmostY = y;
    }
  }
  // Close the path
  pathShape.closePath();

  // Deduce some more information to be used later
  let centerX = (leftmostX + rightmostX) / 2;
  let centerY = (topmostY + bottommostY) / 2;
  let width = rightmostX - leftmostX;
  let height = bottommostY - topmostY;
  let ratio = width / height;

  // Output an object containing the path shape and some information about it
  return {
    pathShape: pathShape,

    leftmostX: leftmostX,
    rightmostX: rightmostX,
    topmostY: topmostY,
    bottommostY: bottommostY,

    centerX: centerX,
    centerY: centerY,
    width: width,
    height: height,
    ratio: ratio
  };
}

function drawArtInCroppedArea(areaName) {

  // Get image area information
  let imageArea = imageAreas[areaName];
  let image = imageArea.getImage();
  let areaPathShape = imageArea.pathShape;
  let adjustments = imageArea.getAdjustments();
  let scaleStyle = imageArea.scaleStyle;
  let vAlign = imageArea.vAlign;

  // Stroke path - useful to toggle on when working on a new image area
  // ctx.strokeStyle = 'red';
  // ctx.lineWidth = ps(0.5);
  // ctx.stroke(areaPathShape.pathShape);

  if (!image) { return } // Cancel function if there's no image to draw (placed here to allow test stroke to be drawn)

  // Save context before clip
  ctx.save();

  // Dynamically adjust nemesis icon placement on villain character cards
  if (areaName == 'vcc_nemesisIcon') {
    ctx.translate(bodyWidthAdjustment, advancedBoxYAdjustment);
  }

  // Clip path shape
  ctx.clip(areaPathShape.pathShape);

  // Get image information
  let imageWidth = image.width;
  let imageHeight = image.height;
  let imageRatio = imageWidth / imageHeight;

  // Determine default scale of image by comparing image ratio to area shape ratio
  let initialScale = 1;
  if ((scaleStyle == 'fill' && imageRatio > areaPathShape.ratio) ||
    (scaleStyle == 'fit' && imageRatio < areaPathShape.ratio)) {
    // If image ratio is wider than image area ratio, fit to height
    initialScale = areaPathShape.height / imageHeight;
  }
  else {
    // Otherwise, fit to width
    initialScale = areaPathShape.width / imageWidth;
  }

  // Determine final scale of image based on user input
  let finalScale = initialScale * adjustments.scale;

  // Determine draw width and height
  let drawWidth = imageWidth * finalScale;
  let drawHeight = imageHeight * finalScale;

  // Determine draw X by centering, then adding user input offset
  let drawX = areaPathShape.centerX - drawWidth / 2;
  drawX += adjustments.xOffset * drawWidth;

  // Align image to that area's starting alignment, then add user input offset
  let drawY = 0;
  if (vAlign == 'center') {
    drawY = areaPathShape.topmostY + areaPathShape.height / 2 - drawHeight / 2;
    drawY += adjustments.yOffset * drawHeight;
  }
  else if (vAlign == 'top') {
    drawY = areaPathShape.topmostY;
    drawY += adjustments.yOffset * drawHeight;
  }

  // Finally, draw the image to the canvas!
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  // Release clip
  ctx.restore();
  ctx.save();
}

/*
============================================================================
JSON Parsing
============================================================================
*/

function parseJSONData(data) {
  // Common fields
  if('HP' in data) {
    $('#inputHP').val(data.HP);
  } else {
    $('#inputHP').val('');
  }
  if('Keywords' in data) {
    $('#inputKeywords').val(data.Keywords);
  } else {
    $('#inputKeywords').val('');
  }
  if('BoldedTerms' in data) {
    $('#inputBoldWords').val(data.BoldedTerms);
  } else {
    $('#inputBoldWords').val('');
  }
  if('GameText' in data) {
    $('#inputEffect').val(data.GameText);
  } else {
    $('#inputEffect').val('');
  }
  if('GameTextSize' in data && data.GameTextSize.length != 0) {
    $('#inputEffectTextSize').val(data.GameTextSize);
  } else {
    $('#inputEffectTextSize').val(100);
  }
  // Deck fields
  if('Title' in data) {
    $('#inputTitle').val(data.Title);
  } else {
    $('#inputTitle').val('');
  }
  if('Quote' in data) {
    $('#inputQuote').val(data.Quote);
  } else {
    $('#inputQuote').val('');
  }
  if('QuoteTextSize' in data && data.QuoteTextSize.length != 0) {
    $('#inputQuoteTextSize').val(data.QuoteTextSize);
  } else {
    $('#inputQuoteTextSize').val(100);
  }
  if('Attribution' in data) {
    $('#inputAttribution').val(data.Attribution);
  } else {
    $('#inputAttribution').val('');
  }
  if('ImageURL' in data && data.ImageURL.length != 0) {
    cardArtImage = new Image();
    cardArtImage.src = data.ImageURL;
    cardArtImage.onload = function (e) {
      // Once the Image has loaded, redraw the canvas so it immediately appears
      drawCardCanvas();
    }
  } else {
    cardArtImage = null;
  }
  if('ImageX' in data) {
    $('.inputImageOffsetX').val(data.ImageX);
  } else {
    $('.inputImageOffsetX').val(0);
  }
  if('ImageY' in data) {
    $('.inputImageOffsetY').val(data.ImageY);
  } else {
    $('.inputImageOffsetY').val(0);
  }
  if('ImageZoom' in data) {
    // special parsing for the zoom value, as if it's fed a non-number, it will
    // default to the middle of the bar, which is not the default
    // ImageZoom is used for card fronts, so it defaults to 100
    let zoomVal = parseInt(data.ImageZoom);
    if (zoomVal == NaN) {
      zoomVal = 100;
    }
    $('.inputImageScale').val(zoomVal);
  } else {
    $('.inputImageScale').val(100);
  }

  // this is complicated to allow for the fact that suddenly can be either a string or a boolean, depending on how people input it
  if ($('#suddenly').length > 0) {
    if ('Suddenly' in data) {
      const isSuddenlyTrue = (typeof data.Suddenly === 'boolean' && data.Suddenly) ||
                             (typeof data.Suddenly === 'string' && data.Suddenly.toUpperCase() === 'TRUE');
      $('#suddenly')[0].checked = isSuddenlyTrue;
      suddenly = isSuddenlyTrue;
    } else {
      $('#suddenly')[0].checked = false;
      suddenly = false;
    }
  }

  // Hero Character card fields
  if('PowerName' in data) {
    $('#inputPowerName').val(data.PowerName);
  } else {
    $('#inputPowerName').val('');
  }

  // Common Character card fields
  if('NemesisIconURL' in data && data.NemesisIconURL.length != 0) {
    loadedUserImages[NEMESIS_ICON] = new Image();
    loadedUserImages[NEMESIS_ICON].src = data.NemesisIconURL;
    loadedUserImages[NEMESIS_ICON].onload = function () {
      // Once the Image has loaded, redraw the canvas so it immediately appears
      drawCardCanvas();
    }
  } else {
    loadedUserImages[NEMESIS_ICON] = null;
  }
  if('NemesisX' in data) {
    $(getImagePurposeSelector(IMAGE_X, NEMESIS_ICON)).val(data.NemesisX);
  } else {
    $(getImagePurposeSelector(IMAGE_X, NEMESIS_ICON)).val(0);
  }
  if('NemesisY' in data) {
    $(getImagePurposeSelector(IMAGE_Y, NEMESIS_ICON)).val(data.NemesisY);
  } else {
    $(getImagePurposeSelector(IMAGE_Y, NEMESIS_ICON)).val(0);
  }
  if('NemesisZoom' in data) {
    let zoomVal = parseInt(data.NemesisZoom);
    if (zoomVal == NaN) {
      zoomVal = 0;
    }
    $(getImagePurposeSelector(IMAGE_ZOOM, NEMESIS_ICON)).val(zoomVal);
  } else {
    $(getImagePurposeSelector(IMAGE_ZOOM, NEMESIS_ICON)).val(0);
  }
  if('BackgroundArtURL' in data && data.BackgroundArtURL.length != 0) {
    loadedUserImages[BACKGROUND_ART] = new Image();
    loadedUserImages[BACKGROUND_ART].src = data.BackgroundArtURL;
    loadedUserImages[BACKGROUND_ART].onload = function () {
      // Once the Image has loaded, redraw the canvas so it immediately appears
      drawCardCanvas();
    }
  } else {
    loadedUserImages[BACKGROUND_ART] = null;
  }
  if('BackgroundArtX' in data) {
    $(getImagePurposeSelector(IMAGE_X, BACKGROUND_ART)).val(data.BackgroundArtX);
  } else {
    $(getImagePurposeSelector(IMAGE_X, BACKGROUND_ART)).val(0);
  }
  if('BackgroundArtY' in data) {
    $(getImagePurposeSelector(IMAGE_Y, BACKGROUND_ART)).val(data.BackgroundArtY);
  } else {
    $(getImagePurposeSelector(IMAGE_Y, BACKGROUND_ART)).val(0);
  }
  if('BackgroundArtZoom' in data) {
    let zoomVal = parseInt(data.BackgroundArtZoom);
    if (zoomVal == NaN) {
      zoomVal = 0;
    }
    $(getImagePurposeSelector(IMAGE_ZOOM, BACKGROUND_ART)).val(zoomVal);
  } else {
    $(getImagePurposeSelector(IMAGE_ZOOM, BACKGROUND_ART)).val(0);
  }
  if('ForegroundArtURL' in data && data.ForegroundArtURL.length != 0) {
    loadedUserImages[FOREGROUND_ART] = new Image();
    loadedUserImages[FOREGROUND_ART].src = data.ForegroundArtURL;
    loadedUserImages[FOREGROUND_ART].onload = function () {
      // Once the Image has loaded, redraw the canvas so it immediately appears
      drawCardCanvas();
    }
  } else {
    loadedUserImages[FOREGROUND_ART] = null;
  }
  if('ForegroundArtX' in data) {
    $(getImagePurposeSelector(IMAGE_X, FOREGROUND_ART)).val(data.ForegroundArtX);
  } else {
    $(getImagePurposeSelector(IMAGE_X, FOREGROUND_ART)).val(0);
  }
  if('ForegroundArtY' in data) {
    $(getImagePurposeSelector(IMAGE_Y, FOREGROUND_ART)).val(data.ForegroundArtY);
  } else {
    $(getImagePurposeSelector(IMAGE_Y, FOREGROUND_ART)).val(0);
  }
  if('ForegroundArtZoom' in data) {
    let zoomVal = parseInt(data.ForegroundArtZoom);
    if (zoomVal == NaN) {
      zoomVal = 0;
    }
    $(getImagePurposeSelector(IMAGE_ZOOM, FOREGROUND_ART)).val(zoomVal);
  } else {
    $(getImagePurposeSelector(IMAGE_ZOOM, FOREGROUND_ART)).val(0);
  }
  if('NameLogoURL' in data && data.NameLogoURL.length != 0) {
    loadedUserImages[NAME_LOGO] = new Image();
    loadedUserImages[NAME_LOGO].src = data.NameLogoURL;
    loadedUserImages[NAME_LOGO].onload = function () {
      // Once the Image has loaded, redraw the canvas so it immediately appears
      drawCardCanvas();
    }
  } else {
    loadedUserImages[NAME_LOGO] = null;
  }
  if('NameLogoX' in data) {
    $(getImagePurposeSelector(IMAGE_X, NAME_LOGO)).val(data.NameLogoX);
  } else {
    $(getImagePurposeSelector(IMAGE_X, NAME_LOGO)).val(0);
  }
  if('NameLogoY' in data) {
    $(getImagePurposeSelector(IMAGE_Y, NAME_LOGO)).val(data.NameLogoY);
  } else {
    $(getImagePurposeSelector(IMAGE_Y, NAME_LOGO)).val(0);
  }
  if('NameLogoZoom' in data) {
    let zoomVal = parseInt(data.NameLogoZoom);
    if (zoomVal == NaN) {
      zoomVal = 0;
    }
    $(getImagePurposeSelector(IMAGE_ZOOM, NAME_LOGO)).val(zoomVal);
  } else {
    $(getImagePurposeSelector(IMAGE_ZOOM, NAME_LOGO)).val(0);
  }

  // Villain Character card fields
  if('Description' in data) {
    $('#inputDescription').val(data.Description);
  } else {
    $('#inputDescription').val('');
  }
  if('VerticalAlignment' in data) {
    $('#inputBelowNameLogoAlignment').val(data.VerticalAlignment);
  } else {
    $('#inputBelowNameLogoAlignment').val(0);
  }
  if('SetupText' in data) {
    $('#inputSetup').val(data.SetupText);
  } else {
    $('#inputSetup').val('');
  }
  if('GameTextBoxWidth' in data) {
    $('#inputEffectBoxWidth').val(data.GameTextBoxWidth);
  } else {
    $('#inputEffectBoxWidth').val(0);
  }
  if('AdvancedPhase' in data) {
    $('#inputAdvancedPhase').val(data.AdvancedPhase);
  } else {
    $('#inputAdvancedPhase').val('none');
  }
  if('AdvancedGameText' in data) {
    $('#inputAdvanced').val(data.AdvancedGameText);
  } else {
    $('#inputAdvanced').val('');
  }
  if('AdvancedGameTextBoxWidth' in data) {
    $('#inputAdvancedBoxWidth').val(data.AdvancedGameTextBoxWidth);
  } else {
    $('#inputAdvancedBoxWidth').val(0);
  }
  drawCardCanvas();
}

function outputJSONData(form="deck", orientation="vertical") {
  var outputJSON = '';
  if(form == "deck") {
    outputJSON = `{
      "Title": ${JSON.stringify($('#inputTitle').val())},
      "HP": ${JSON.stringify($('#inputHP').val())},
      "Keywords": ${JSON.stringify($('#inputKeywords').val())},
      "BoldedTerms": ${JSON.stringify($('#inputBoldWords').val())},
      "GameText": ${JSON.stringify($('#inputEffect').val())},
      "GameTextSize": ${JSON.stringify($('#inputEffectTextSize').val())},
      "Quote": ${JSON.stringify($('#inputQuote').val())},
      "QuoteTextSize": ${JSON.stringify($('#inputQuoteTextSize').val())},
      "Attribution": ${JSON.stringify($('#inputAttribution').val())},
      "ImageURL": ${JSON.stringify(extractImageURL())},
      "ImageX": ${JSON.stringify($('.inputImageOffsetX').val())},
      "ImageY": ${JSON.stringify($('.inputImageOffsetY').val())},
      "ImageZoom": ${JSON.stringify($('.inputImageScale').val())},
      "Suddenly": ${isChecked('#suddenly')}
    },`;
  } else if (form == "character") {
    if (orientation == "vertical") {
      outputJSON = `{
        "HP": ${JSON.stringify($('#inputHP').val())},
        "Keywords": ${JSON.stringify($('#inputKeywords').val())},
        "BoldedTerms": ${JSON.stringify($('#inputBoldWords').val())},
        "PowerName": ${JSON.stringify($('#inputPowerName').val())},
        "GameText": ${JSON.stringify($('#inputEffect').val())},
        "GameTextSize": ${JSON.stringify($('#inputEffectTextSize').val())},
        "NemesisIconURL": ${JSON.stringify(extractImageURL(NEMESIS_ICON))},
        "NemesisX": ${JSON.stringify($(getImagePurposeSelector(IMAGE_X, NEMESIS_ICON)).val())},
        "NemesisY": ${JSON.stringify($(getImagePurposeSelector(IMAGE_Y, NEMESIS_ICON)).val())},
        "NemesisZoom": ${JSON.stringify($(getImagePurposeSelector(IMAGE_ZOOM, NEMESIS_ICON)).val())},
        "BackgroundArtURL": ${JSON.stringify(extractImageURL(BACKGROUND_ART))},
        "BackgroundArtX": ${JSON.stringify($(getImagePurposeSelector(IMAGE_X, BACKGROUND_ART)).val())},
        "BackgroundArtY": ${JSON.stringify($(getImagePurposeSelector(IMAGE_Y, BACKGROUND_ART)).val())},
        "BackgroundArtZoom": ${JSON.stringify($(getImagePurposeSelector(IMAGE_ZOOM, BACKGROUND_ART)).val())},
        "ForegroundArtURL": ${JSON.stringify(extractImageURL(FOREGROUND_ART))},
        "ForegroundArtX": ${JSON.stringify($(getImagePurposeSelector(IMAGE_X, FOREGROUND_ART)).val())},
        "ForegroundArtY": ${JSON.stringify($(getImagePurposeSelector(IMAGE_Y, FOREGROUND_ART)).val())},
        "ForegroundArtZoom": ${JSON.stringify($(getImagePurposeSelector(IMAGE_ZOOM, FOREGROUND_ART)).val())},
        "CharacterLogoURL": ${JSON.stringify(extractImageURL(NAME_LOGO))},
        "CharacterLogoX": ${JSON.stringify($(getImagePurposeSelector(IMAGE_X, NAME_LOGO)).val())},
        "CharacterLogoY": ${JSON.stringify($(getImagePurposeSelector(IMAGE_Y, NAME_LOGO)).val())},
        "CharacterLogoZoom": ${JSON.stringify($(getImagePurposeSelector(IMAGE_ZOOM, NAME_LOGO)).val())},
        "ShowBorder": ${isChecked('#inputDisplayBorder')},
        "VariantToggle": ${isChecked('#inputVariantToggle')},
        "WhiteVariantText": ${isChecked('#inputVariantColor')}
      }`
    } else if (orientation == "horizontal") {
      outputJSON = `{
        "HP": ${JSON.stringify($('#inputHP').val())},
        "Description": ${JSON.stringify($('#inputDescription').val())},
        "Keywords": ${JSON.stringify($('#inputKeywords').val())},
        "VerticalAlignment": ${JSON.stringify($('#inputBelowNameLogoAlignment').val())},
        "NemesisIconURL": ${JSON.stringify(extractImageURL(NEMESIS_ICON))},
        "NemesisX": ${JSON.stringify($(getImagePurposeSelector(IMAGE_X, NEMESIS_ICON)).val())},
        "NemesisY": ${JSON.stringify($(getImagePurposeSelector(IMAGE_Y, NEMESIS_ICON)).val())},
        "NemesisZoom": ${JSON.stringify($(getImagePurposeSelector(IMAGE_ZOOM, NEMESIS_ICON)).val())},
        "BackgroundArtURL": ${JSON.stringify(extractImageURL(BACKGROUND_ART))},
        "BackgroundArtX": ${JSON.stringify($(getImagePurposeSelector(IMAGE_X, BACKGROUND_ART)).val())},
        "BackgroundArtY": ${JSON.stringify($(getImagePurposeSelector(IMAGE_Y, BACKGROUND_ART)).val())},
        "BackgroundArtZoom": ${JSON.stringify($(getImagePurposeSelector(IMAGE_ZOOM, BACKGROUND_ART)).val())},
        "ForegroundArtURL": ${JSON.stringify(extractImageURL(FOREGROUND_ART))},
        "ForegroundArtX": ${JSON.stringify($(getImagePurposeSelector(IMAGE_X, FOREGROUND_ART)).val())},
        "ForegroundArtY": ${JSON.stringify($(getImagePurposeSelector(IMAGE_Y, FOREGROUND_ART)).val())},
        "ForegroundArtZoom": ${JSON.stringify($(getImagePurposeSelector(IMAGE_ZOOM, FOREGROUND_ART)).val())},
        "NameLogoURL": ${JSON.stringify(extractImageURL(NAME_LOGO))},
        "NameLogoX": ${JSON.stringify($(getImagePurposeSelector(IMAGE_X, NAME_LOGO)).val())},
        "NameLogoY": ${JSON.stringify($(getImagePurposeSelector(IMAGE_Y, NAME_LOGO)).val())},
        "NameLogoZoom": ${JSON.stringify($(getImagePurposeSelector(IMAGE_ZOOM, NAME_LOGO)).val())},
        "SetupText": ${JSON.stringify($('#inputSetup').val())},
        "GameText": ${JSON.stringify($('#inputEffect').val())},
        "GameTextSize": ${JSON.stringify($('#inputEffectTextSize').val())},
        "GameTextBoxWidth": ${JSON.stringify($('#inputEffectBoxWidth').val())},
        "AdvancedPhase": ${JSON.stringify($('#inputAdvancedPhase').val())},
        "AdvancedGameText": ${JSON.stringify($('#inputAdvanced').val())},
        "AdvancedGameTextBoxWidth": ${JSON.stringify($('#inputAdvancedBoxWidth').val())},
        "BoldedTerms": ${JSON.stringify($('#inputBoldWords').val())},
        "ShowBorder": ${isChecked('#inputDisplayBorder')}
      }`
    }
  }
  $('#jsonInput').val(outputJSON);
}

// Helper method to get if a checkbox is checked without breaking if it doesn't exist
function isChecked(jquery_id) {
  return $(jquery_id).length? JSON.stringify($(jquery_id)[0].checked) : 'false'
}

function extractImageURL(purpose="") {
  var url = "";
  if (purpose == "") {
    if (cardArtImage) {
      url = cardArtImage.src;
    }
  } else {
    var image = loadedUserImages[purpose];
    if (image) {
      url = image.src;
    }
  }
  return url;
}

/*
============================================================================
Functions for rendering card quotes
============================================================================
*/

function drawCardQuote() {
  // Get input value
  let inputValue = $('#inputQuote').prop('value');
  // Quote style properties
  ctx.fillStyle = colorBlack;
  let quoteFontScale = $('#inputQuoteTextSize').prop('value') / 100;
  let quoteFontSize = QUOTE_FONT_SIZE * quoteFontScale;
  ctx.font = "400 normal " + quoteFontSize + "px Unmasked BB";
  ctx.textAlign = "center";
  let quoteMaxWidth = QUOTE_WIDTH;
  let quoteCenterX = QUOTE_START_X;
  let quoteCenterY = QUOTE_START_Y;
  let quoteLineHeight = quoteFontSize * 0.93;

  // Set the string of text to work with
  let quoteString = inputValue;

  // Extract all the words
  let words = quoteString.split(' ');

  // Detect when there should be a line break
  let lines = [''];
  let currentLineIndex = 0;
  for (let i = 0; i < words.length; i++) {
    // First word of quote is easy
    if (i === 0) {
      lines[currentLineIndex] = words[i];
      continue;
    }
    // For all other words...
    // Check if adding this word would cause the line width to exceed the maximum
    let lineWithWordAdded = lines[currentLineIndex] + ' ' + words[i];
    if (ctx.measureText(lineWithWordAdded).width < quoteMaxWidth) {
      // Add word to current line
      lines[currentLineIndex] += ' ' + words[i];
    }
    else {
      // Break into new line
      currentLineIndex++;
      lines[currentLineIndex] = words[i];
    }
  }

  // Iterate through lines
  let quoteTotalHeight = quoteLineHeight * lines.length;
  for (let i = 0; i < lines.length; i++) {
    // Determine drawing origin
    let drawX = quoteCenterX;
    let drawY = quoteCenterY - (quoteTotalHeight / 2) + (quoteLineHeight * i);
    // Draw the line of text
    ctx.fillText(lines[i], drawX, drawY);
  }
}

/*
============================================================================
Functions for rendering card bodies
============================================================================
*/
/**
 * Determines the indent label in a line of game text. If one exists, this method returns the label and the length of the specifier that was used to identify it. If not
 * label can be extracted, this returns null, which indicates that this line is not an indent block.
 */
function determineIndentLabel(line) {
  for (const specifier of INDENT_LABEL_SPECIFIERS) {
    if (line.startsWith(specifier)) {
      return [INDENT_LABEL_MAP.get(specifier), specifier.length];
    }
  }
  return [null, null];
}

/** Parses a line of text inside a card's body, returning an array of blocks to draw when rendering that card. */
function parseBodyText(originalLine) {
  // Trivial case: an empty line should create a block that only serves to add spacing
  if (originalLine.length === 0) {
    return {
      type: SPACE_BLOCK,
    };
  }

  // We may butcher the string a bit. In case the caller needs to reuse that string (maybe unnecessary), we perform
  // a deep copy. ECMAScript string-copying implementations vary, with Chrome being the most well-known offender
  // (see https://bugs.chromium.org/p/v8/issues/detail?id=2869), but this method should work on all browsers.
  let line = `${originalLine}`;

  // Multiple blocks may be generated during the parsing process. We save them here.
  const blocks = [];

  // First, check for the presence of a phase block at the start of the string using a regular expression.
  // If we find one, extract it out before proceeding with text parsing
  const phaseRegexResult = PHASE_REGEX.exec(line.toLowerCase());
  if (phaseRegexResult) {
    // The result should always contain an entry in PHASE_LABELS, but we check just in case.
    const phaseLabel = phaseRegexResult[PHASE_INDEX]
    if (!PHASE_LABELS.includes(phaseLabel)) {
      throw new Error(`The phase regex identified a phase, but it wasn't in the array of known phase labels. This should never happen. Acceptable labels: [${PHASE_LABELS.join(", ")}]; Identified: ${phaseLabel}`);
    }
    blocks.push({
      type: PHASE_BLOCK,
      label: phaseLabel,
    });
    // Remove the contents of the phase string from the line.
    line = line.substring(phaseRegexResult[0].length);
  }

  // Check if there is anything else to render. If not, only the phase block will be returned.
  if (line.length == 0) {
    return blocks;
  }

  // Check if what remains is an indented block. If this parser were propertly opinionated, it would
  // not allow powers and reactions after phase labels. But who knows if that will be useful at some
  // point later on?
  const [indentLabel, specifierLength] = determineIndentLabel(line.toLowerCase());
  if (indentLabel) {
    // The result should always contain an entry in INDENT_LABELS, but we check just in case
    if (!INDENT_LABELS.includes(indentLabel)) {
      throw new Error(`The indent regex identified an indentation label, but it wasn't in the array of known indent labels. This should never happen. Acceptable labels: [${INDENT_LABELS.join(", ")}; Identified: ${indentLabel}]`);
    }
    // Remove the label from the content and trim any starting spaces before adding it to the block.
    // Then return all blocks, because simple blocks can't follow indented blocks.
    blocks.push({
      type: INDENT_BLOCK,
      label: indentLabel,
      content: line.substring(Math.min(specifierLength, line.length)).trimStart(),
    });
    return blocks;
  }

  // If there is no indentated block, the remainder of the line is a simple block.
  blocks.push({
    type: SIMPLE_BLOCK,
    content: line,
  })
  return blocks;
}

/** Parses and returns the body text for a card. */
function parseCardBody() {
  // Get the text the user entered into the textarea
  let inputValue;
  if (drawingAdvanced) {
    inputValue = $('#inputAdvanced').prop('value');
  }
  else {
    inputValue = $('#inputEffect').prop('value');
  }

  // Split at line returns, then iterate through the array to build an ordered list of blocks
  const parsedBlocks = inputValue
    .split("\n")
    .map(line => parseBodyText(line))
    .flat();
  return parsedBlocks;
}

/**
 * Given an array of parsed blocks, calculate the box height offset of a card.
 *
 * drawBodyText() alters the currentOffsetY, so we draw once and subtract that value from EFFECT_START_Y to determine the height of the drawn body content. We add 137
 * (the closest round number representing the height of 3 lines drawn in the same paragraph) to this in order to determine the offset that a hero body box would need in
 * order to fit all of the blocks that we parsed from the user input. Hero character card body boxes have a minimum size, so we min this value with 0 to determine the offset
 * of our box (increasing the offset moves our Y position *downwards*, so a positive number yields a smaller box).
 */
function adjustBoxHeightOffset(parsedBlocks) {
  // Draw on the invisible calculation canvas instead of the main canvas
  ctx = calculationCanvas.getContext("2d");
  boxHeightOffset = 0;
  drawBodyText(parsedBlocks);
  let minimumSizeCap = 0;
  if (drawingAdvanced) {
    // Unique minimum size for advanced box (higher number = smaller)
    minimumSizeCap = ph(10);
  }
  boxHeightOffset = Math.min(Math.round(EFFECT_START_Y - currentOffsetY + 137), minimumSizeCap);
  currentOffsetY = 0;
  // Return to the main canvas
  ctx = canvas.getContext("2d");
}

/** Updates the game text box width adjustment for villain character cards */
let bodyWidthAdjustment = 1;
function updateBodyWidthAdjustment() {
  if (drawingAdvanced) {
    if ($('#inputAdvancedBoxWidth').length > 0) {
      bodyWidthAdjustment = pw($('#inputAdvancedBoxWidth').val());
    }
  }
  else {
    if ($('#inputEffectBoxWidth').length > 0) {
      bodyWidthAdjustment = pw($('#inputEffectBoxWidth').val());
    }
  }
}

/** Draws the text box of a character card (but not the text inside it). */
function drawCharacterBodyBox() {
  // Check for width adjustment (for villain character cards)
  updateBodyWidthAdjustment();

  // Reset advanced adjustment
  if (drawingAdvanced) {
    advancedBoxYAdjustment = 0;
  }

  // Sets the coordinates of the corners of the textbox. The bottom will never change, but the top can change based on boxHeightOffset
  const boxValues = CHARACTER_BODY_BOX;
  const topLeft = [boxValues.topLeft.x + bodyWidthAdjustment, boxValues.topLeft.y + boxHeightOffset + advancedBoxYAdjustment];
  const topRight = [boxValues.topRight.x, boxValues.topRight.y + boxHeightOffset + advancedBoxYAdjustment];
  const bottomRight = [boxValues.bottomRight.x, boxValues.bottomRight.y + advancedBoxYAdjustment];
  const bottomLeft = [boxValues.bottomLeft.x + bodyWidthAdjustment, boxValues.bottomLeft.y + advancedBoxYAdjustment];

  // Determine the initial shape of the box.
  const boxShape = new Path2D();
  boxShape.moveTo(topLeft[0], topLeft[1]);
  boxShape.lineTo(topRight[0], topRight[1]);
  boxShape.lineTo(bottomRight[0], bottomRight[1]);
  boxShape.lineTo(bottomLeft[0], bottomLeft[1]);
  boxShape.closePath();

  // White background
  ctx.fillStyle = boxValues.bgColor;
  ctx.fill(boxShape);

  // Black border
  ctx.fillStyle = colorBlack;
  ctx.lineWidth = boxValues.borderThickness;
  ctx.stroke(boxShape);

  // Box shadow (top-left)
  if (drawingAdvanced) {
    // Ignore
  }
  else {
    let shadowShape = new Path2D;
    let shadowOffset = boxValues.shadowThickness * -0.7;
    shadowShape.moveTo(bottomLeft[0] + shadowOffset, bottomLeft[1] + shadowOffset);
    shadowShape.lineTo(topLeft[0] + shadowOffset, topLeft[1] + shadowOffset);
    shadowShape.lineTo(topRight[0] + shadowOffset, topRight[1] + shadowOffset);
    ctx.fillStyle = colorBlack;
    ctx.lineWidth = boxValues.shadowThickness;
    ctx.stroke(shadowShape);
  }

  // Set advanced Y adjustment
  if (drawingAdvanced) {
    // It's the final height of the drawn advanced box, plus a gap
    const gap = ph(1.8);
    advancedBoxYAdjustment = (boxValues.bottomLeft.y - boxValues.topLeft.y - boxHeightOffset + gap) * -1;
  }
}

/** Given an array of blocks, draw the body of a card from a deck. */
function drawBodyText(parsedBlocks) {
  // Check for width adjustment (for villain character cards)
  updateBodyWidthAdjustment();

  // Reset advanced adjustment
  if (drawingAdvanced) {
    advancedTextYAdjustment = 0;
  }

  // Initialize positioning values
  currentOffsetX = EFFECT_START_X + bodyWidthAdjustment;
  currentOffsetY = EFFECT_START_Y + boxHeightOffset + advancedTextYAdjustment;

  // Get and apply the text scale the user chose
  effectFontScale = $('#inputEffectTextSize').prop('value') / 100; // Result is between 0 and 1
  effectFontSize = EFFECT_BASE_FONT_SIZE * effectFontScale;
  lineHeight = BODY_BASE_LINE_HEIGHT * effectFontScale;
  spaceWidth = effectFontSize * SPACE_WIDTH_FACTOR;

  // Draw the blocks
  parsedBlocks.forEach((block, index) => {
    drawBlock(block, index == 0);
  });

  // Set advanced Y adjustment
  if (!drawingAdvanced) {
    advancedTextYAdjustment = advancedBoxYAdjustment;
    // (I'll be honest, I don't understand why this works here, but it does.)
  }

  return currentOffsetY;
}

/** Draws a single block from the array of parsed blocks. */
function drawBlock(block, isFirstBlock) {
  // Reset indentation to default
  currentIndentX = EFFECT_START_X + bodyWidthAdjustment;

  if (block.type === SPACE_BLOCK) {
    drawSpaceBlock(isFirstBlock);
  } else if (block.type === PHASE_BLOCK) {
    drawPhaseBlock(block.label, isFirstBlock);
  } else if (block.type === INDENT_BLOCK) {
    drawIndentBlock(block.label.toUpperCase(), block.content, isFirstBlock);
  } else if (block.type === SIMPLE_BLOCK) {
    drawSimpleBlock(block.content, isFirstBlock);
  } else {
    throw new Error(`The frontend attempting to draw a block of a type it did not recognize. Acceptable types: [${BLOCK_TYPES.join(", ")}]; Identified: ${block.type}`);
  }
}

/** "Draws" a space block, which is just empty space on a card. */
function drawSpaceBlock(isFirstBlock) {
  // This wraps a call to drawSimpleBlock.
  return drawSimpleBlock(" ", isFirstBlock);
}

/**
 * Draws the phase label on a card. Not to be confused with the Draw Phase, an actual concept in SotM.
 * This function will draw any phase. Words are hard.
 */
function drawPhaseBlock(phase, isFirstBlock) {
  // Get some information specific to this phase
  const phaseColor = PHASE_COLOR_MAP.get(useHighContrastPhaseLabels ? HIGH_CONTRAST : ORIGINAL_CONTRAST).get(phase);
  const phaseText = PHASE_TEXT_MAP.get(phase);

  // Adjust line height based on whether this is the first block
  if (isFirstBlock) {
    currentOffsetY = currentOffsetY;
  }
  else {
    currentOffsetY = currentOffsetY + lineHeight * PRE_PHASE_LINE_HEIGHT_FACTOR;
  }

  // Get the phase icon to use
  const phaseIconKey = PHASE_ICON_MAP.get(phase) + (useHighContrastPhaseLabels ? " High Contrast" : "");
  const phaseIcon = loadedGraphics[phaseIconKey];
  if (!phaseIcon) {
    throw new Error(`Failed to get a phase icon: {phase: ${phase}, icon: ${phaseIcon}}.`)
  }

  // Draw the icon
  const iconWidth = iconHeight = PHASE_ICON_SIZE; // Icon graphics have 1:1 proportions
  const iconX = PHASE_ICON_X + bodyWidthAdjustment - iconWidth / 2;
  const iconY = currentOffsetY - EFFECT_PHASE_FONT_SIZE; // == iconHeight / 2.
  ctx.drawImage(phaseIcon, iconX, iconY, iconWidth, iconHeight);

  // Draw the text after the icon
  ctx.font = `400 ${EFFECT_PHASE_FONT_SIZE}px ${PHASE_FONT_FAMILY}`;
  ctx.strokeStyle = colorBlack;
  ctx.line = EFFECT_PHASE_FONT_SIZE
  ctx.lineWidth = EFFECT_PHASE_FONT_SIZE * 0.2;
  ctx.lineJoin = MITER;
  ctx.miterLimit = 3;
  ctx.strokeText(phaseText, currentOffsetX, currentOffsetY);
  ctx.fillStyle = phaseColor;
  ctx.fillText(phaseText, currentOffsetX, currentOffsetY);

  // Prepare for next block
  currentOffsetY = currentOffsetY + lineHeight * POST_PHASE_LINE_HEIGHT_FACTOR;
}

/** Draws a block that uses identation, such as power and reaction effects. */
function drawIndentBlock(indentLabel, indentContent, isFirstBlock) {
  // If this is the first block, adjust the Y position, bringing the text up a little more if the font is smaller.
  if (isFirstBlock) {
    currentOffsetY = currentOffsetY - EFFECT_BASE_FONT_SIZE + effectFontSize;
  }

  // Set shared characteristics for all labels:
  ctx.fillStyle = colorBlack;

  // Set properties specific to the type of indent block. Bullet points need special handling
  let labelContent;
  if (indentLabel === BULLET_LABEL) {
     // Add 5 spaces of padding in front of a bullet point to cards in decks.
     // TODO:
     //   - This spacing looks correct at a casual glance. We should check it more closely.
     //   - This does NOT render the special bullet point character in hero character incap text, because we can't find the thing. It might be a custom graphic.
    labelContent = `${CARD_FORM === DECK ? "     " : ""}${indentLabel}`;
    ctx.font = `400 ${effectFontSize}px ${EFFECT_FONT_FAMILY}`;
  } else {
    labelContent = indentLabel;
    ctx.font = `900 ${effectFontSize * INDENT_LABEL_SIZE_FACTOR}px ${INDENT_LABEL_FONT_FAMILY}`
  }

  // Draw the label
  ctx.fillText(labelContent, currentOffsetX, currentOffsetY);

  // Indent all subsequent text
  currentIndentX += ctx.measureText(labelContent).width + spaceWidth + pw(0.2);
  currentOffsetX = currentIndentX;

  // Aside from indentation, the remaining rendering process is identical to simple block rendering, so we just call that.
  drawSimpleBlock(indentContent, false);
}

/** Draws a block of simple text. The name is deceiving, this function is very complex! */
function drawSimpleBlock(simpleContent, isFirstBlock) {
  // If this is the first block, adjust the Y position, bringing the text up a little more if the font is smaller
  if (isFirstBlock) {
    currentOffsetY = currentOffsetY - EFFECT_BASE_FONT_SIZE + effectFontSize;
  }

  // Replace spaces after numbers (and X variables) with non-breaking spaces
  let blockString = simpleContent.replaceAll(/([0-9X]) /g, '$1\xa0'); // Non-breakable space is char 0xa0 (160 dec)

  // First, identify special word strings and replace their spaces with underscores
  effectBoldList.forEach((phrase) => {
    // Make an all-caps copy of the block string
    let testString = blockString.toUpperCase();
    // Find the position of each instance of this phrase in the string
    let position = testString.indexOf(phrase);
    while (position !== -1) {
      // Replace this instance of this phrase in the real block string with the all-caps + underscore format for detecting later
      let thisSubString = blockString.substr(position, phrase.length);
      blockString = blockString.replace(thisSubString, phrase.replaceAll(' ', '_'));
      // Repeat if there's another instance of this phrase
      position = testString.indexOf(phrase, position + 1);
    }
  });
  effectItalicsList.forEach((phrase) => {
    // Make an all-caps copy of the block string
    let testString = blockString.toUpperCase();
    // Find the position of each instance of this phrase in the string
    let position = testString.indexOf(phrase);
    while (position !== -1) {
      // Replace this instance of this phrase in the real block string with the all-caps + underscore format for detecting later
      let thisSubString = blockString.substr(position, phrase.length);
      blockString = blockString.replace(thisSubString, phrase.replaceAll(' ', '_'));
      // Repeat if there's another instance of this phrase
      position = testString.indexOf(phrase, position + 1);
    }
  });

  // Make minus signs more readable by replacing hyphens with en-dashes
  blockString = blockString.replaceAll('-', '–');

  // Replace placeholder H and flip with custom symbols
  // Valid: '(H)' - case sensitive
  blockString = blockString.replaceAll('(H)', '҈____');
  // Valid: '[flip]', '(flip)', '(F)' - not case sensitive
  blockString = blockString.replaceAll(/\[flip\]|\(flip\)|\(F\)/gi, '҉____');

  // Extract all the words
  // add special processing for spaces after numbers
  let words = blockString.split(' ').flatMap((word) => {
    let newWord = word;
    // double count the word afterwards
    if (word.indexOf('\xa0') != -1) {
      newWord = word.split('\xa0');
      newWord[0] = word
    }
    return newWord;
  });

  // Analyze and draw each 'word' (including special phrases as 1 word...U.u)
  words.forEach((word, index) => {
    let thisIndex = index;
    // Find out it this word should be bolded or italicized
    let thisWord = getWordProperties(word); // returns an object: {text, isBold, isItalics}

    // Set drawing styles
    let weightValue = EFFECT_FONT_WEIGHT;
    let styleValue = "normal";
    if (thisWord.isBold) { weightValue = "600" }
    if (thisWord.isItalics) { styleValue = "italic" }
    if (thisWord.isBold || thisWord.isItalics) {
      ctx.font = weightValue + ' ' + styleValue + ' ' + effectFontSize + 'px ' + BACKUP_FONT_FAMILY;
    } else {
      ctx.font = weightValue + ' ' + styleValue + ' ' + effectFontSize + 'px ' + EFFECT_FONT_FAMILY;
    }
    ctx.fillStyle = colorBlack;

    // Break up special bold/italics phrases into their component words
    let phraseParts = thisWord.text.split(' ');

    // For each word in the phrase (and there will usually be just one)
    phraseParts.forEach((wordString) => {
      // Get how much width the word and a space would add to the line
      let wordWidth = ctx.measureText(wordString).width;
      // Check to see if the line should wrap
      let wrapped = false;
      // Looks forward to see if adding this word to the current line would make the line exceed the maximum x position
      if (currentOffsetX + spaceWidth + wordWidth > EFFECT_END_X) {
        // If it would, then start the next line
        currentOffsetY += lineHeight;
        currentOffsetX = currentIndentX;
        wrapped = true;
      }
      // remove double counted word since we already calculated if we need to go to the next line
      if (wordString.indexOf('\xa0') != -1) {
        wordString = wordString.split('\xa0')[0];
        wordWidth = ctx.measureText(wordString).width;
      }
      // Determine string to draw
      let stringToDraw = '';
      // Check if there's a punctuation mark at the end of a bold/italicized word
      let endingPunctuation = '';
      if ((thisWord.isBold || thisWord.isItalics) && wordString[wordString.length - 1].match(/[.,!;:\?]/g)) {
        endingPunctuation = wordString.charAt(wordString.length - 1); // Get the punctuation at the end of the string
        wordString = wordString.slice(0, wordString.length - 1); // Remove the punctuation from the main string
      }

      // Check line wrapping status
      if (wrapped == false && thisIndex > 0) {
        // If the line did not wrap and it's not the first word of the block, draw the word with a space
        currentOffsetX += spaceWidth;
      }
      stringToDraw = wordString;
      // Draw the string
      ctx.fillText(stringToDraw, currentOffsetX, currentOffsetY);
      // If there was ending punctuation after a bold/italicized word, draw that now
      if (endingPunctuation != '') {
        // Get width of word without ending punctuation
        let mainWordWidth = ctx.measureText(stringToDraw).width;
        // Set the font styles to effect text default
        ctx.font = EFFECT_FONT_WEIGHT + ' ' + 'normal' + ' ' + effectFontSize + 'px ' + EFFECT_FONT_FAMILY;
        // Draw the punctuation
        let drawX = currentOffsetX + mainWordWidth;
        ctx.fillText(endingPunctuation, drawX, currentOffsetY);
      }
      // Prepare currentOffsetX for next word
      currentOffsetX += wordWidth;

      // Increase the index (only necessary for multi-word phrases)
      thisIndex++;
    })
  });

  // After drawing all the words, prepare for the next block
  currentOffsetX = EFFECT_START_X + bodyWidthAdjustment;
  currentOffsetY += lineHeight * BLOCK_SPACING_FACTOR;
}

function getWordProperties(word) {
  // Minimize the word for easier analyzing
  var minimizedWord = '';
  // Remove any punctuation
  minimizedWord = word.replaceAll(/[.,!;:\?]/g, '');
  // Restore spaces that were replaced with underscores earlier
  minimizedWord = minimizedWord.replaceAll('_', ' ');
  // Check minimized word against lists of words to bold and italicize
  let isBold = false;
  let isItalics = false;
  if (effectBoldList.indexOf(minimizedWord) != -1) { isBold = true; }
  if (effectItalicsList.indexOf(minimizedWord) != -1) { isItalics = true; }

  // Restore spaces that were replaced with underscores earlier
  let restoredWord = word.replaceAll('_', ' ');

  // Output
  return { text: restoredWord, isBold: isBold, isItalics: isItalics };
}
