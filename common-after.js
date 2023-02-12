

// Regions for drawing images
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
      return getUserImage('heroNameArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('heroNameArt');
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
      return getUserImage('foregroundArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('foregroundArt');
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
      //return loadedGraphics['test_gyrosaur cc front'];
      return getUserImage('backgroundArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('backgroundArt');
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
      return getUserImage('nemesisIcon');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('nemesisIcon');
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
      return getUserImage('heroNameArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('heroNameArt');
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
      return getUserImage('leftArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('leftArt');
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
      return getUserImage('rightArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('rightArt');
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
      return getUserImage('bottomArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('bottomArt');
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
      return getUserImage('villainNameArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('villainNameArt');
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
      return getUserImage('topArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('topArt');
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
      return getUserImage('rightArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('rightArt');
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
      return getUserImage('leftArt');
    },
    getAdjustments: function () {
      return getUserImageAdjustments('leftArt');
    }
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
  xOffset = $(`.inputImageOffsetX[data-image-purpose="${areaName}"]`).val() / 100;
  yOffset = $(`.inputImageOffsetY[data-image-purpose="${areaName}"]`).val() / 100 * -1;
  scale = $(`.inputImageScale[data-image-purpose="${areaName}"]`).val() / 100;
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
  let pathShape = imageArea.pathShape;
  let adjustments = imageArea.getAdjustments();
  let scaleStyle = imageArea.scaleStyle;
  let vAlign = imageArea.vAlign;

  // Stroke path - useful when working on a new image area
  // ctx.strokeStyle = 'green';
  // ctx.lineWidth = pw(1);
  // ctx.stroke(pathShape.pathShape);

  if (!image) { return } // Cancel function if there's no image to draw (placed here to allow test stroke to be drawn)

  // Save context before clip
  ctx.save();
  // Clip path shape
  ctx.clip(pathShape.pathShape);

  // Get image information
  let imageWidth = image.width;
  let imageHeight = image.height;
  let imageRatio = imageWidth / imageHeight;

  // Determine default scale of image by comparing image ratio to area shape ratio
  let initialScale = 1;
  if ((scaleStyle == 'fill' && imageRatio > pathShape.ratio) ||
    (scaleStyle == 'fit' && imageRatio < pathShape.ratio)) {
    // If image ratio is wider than image area ratio, fit to height
    initialScale = pathShape.height / imageHeight;
  }
  else {
    // Otherwise, fit to width
    initialScale = pathShape.width / imageWidth;
  }

  // Determine final scale of image based on user input
  let finalScale = initialScale * adjustments.scale;

  // Determine draw width and height
  let drawWidth = imageWidth * finalScale;
  let drawHeight = imageHeight * finalScale;

  // Determine draw X by centering, then adding user input offset
  let drawX = pathShape.centerX - drawWidth / 2;
  drawX += adjustments.xOffset * drawWidth;

  // Align image to that area's starting alignment, then add user input offset
  let drawY = 0;
  if (vAlign == 'center') {
    drawY = pathShape.topmostY + pathShape.height / 2 - drawHeight / 2;
    drawY += adjustments.yOffset * drawHeight;
  }
  else if (vAlign == 'top') {
    drawY = pathShape.topmostY;
    drawY += adjustments.yOffset * drawHeight;
  }


  // Finally, draw the image to the canvas!
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  // Release clip
  ctx.restore();
  ctx.save();
}






