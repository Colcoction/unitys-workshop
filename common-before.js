/*
============================================================================
Global variables
============================================================================
*/
// Orientations. This should be declared in the page's script configurations.
const VERTICAL = "vertical";
const HORIZONTAL = "horizontal";
// Card preview sizes. These should match the text content of buttons on the page.
const SMALL = "Small";
const MEDIUM = "Medium";
const LARGE = "Large";
const CARD_PREVIEW_SIZES = [SMALL, MEDIUM, LARGE];
/** Maps canvas container widths based on user-provided sizes (small, med, large) and card orientation. Used in {@link setCanvasWidth()}. */
const canvasSizes = new Map([
    [VERTICAL, new Map([
        [SMALL,   250],
        [MEDIUM,  350],
        [LARGE,   450],
    ])],
    [HORIZONTAL, new Map([
        [SMALL,   600],
        [MEDIUM,  800],
        [LARGE,  1000],
    ])]
]);
// Colors for card effects
// I don't think the high contrast values are actually CYMK... >:|
const colorBlack = '#231f20';
const colorStartPhaseOriginal = '#3fae49';
const colorStartPhaseHighContrast = '#4bc244';
const colorPlayPhaseOriginal = '#fff200';
const colorPlayPhaseHighContrast = '#fff72f';
const colorPowerPhaseOriginal = '#79509e';
const colorPowerPhaseHighContrast = '#a76fb9';
const colorDrawPhaseOriginal = '#00aeef';
const colorDrawPhaseHighContrast = '#3db7e2';
const colorEndPhaseOriginal = '#ee2d35';
const colorEndPhaseHighContrast = '#f34747';


/*
============================================================================
Global functions
============================================================================
*/
// Short function to convert percentage (ex: 50) into pixels
function pw(percentageWidth) {
    return percentageWidth * canvas.width / 100;
}
function ph(percentageHeight) {
    return percentageHeight * canvas.height / 100;
}

// Sets canvas width given a card preview size, using the page's pre-configured orientation
function setCanvasWidth(cardPreviewSize) {
    $('#canvasContainer').css({ width: canvasSizes.get(ORIENTATION).get(cardPreviewSize) });
}

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
})
$('.rangeText').on('input', function (e) {
    $(this).prev().val($(this).val());
})
// Also, when the page loads, copy the default value from the slider into the text box
$('.rangeText').each(function (e) {
    $(this).val($(this).prev().val());
})

// Populate inputs with default values on startup
$('*[data-image-purpose]').each(function () {
    if (this.dataset.default) {
        this.value = this.dataset.default;
    }
})


// Reset art adjustments button
$('.adjustmentResetButton').on('click', function () {
    let areaName = this.dataset.imagePurpose;
    // Reset input values to their defaults, stated in "data-default" attribute
    $(`.contentInput[data-image-purpose="${areaName}"]`).each(function () {
        if (this.dataset.default) {
            this.value = this.dataset.default;
        }
    });
    // Remove uploaded image
    $(`.contentInput[data-image-purpose="${areaName}"][type="file"]`).each(function () {
        this.value = '';
        loadedUserImages[areaName] = null;
    });
    // Redraw canvas (since "on input" event didn't trigger)
    drawCardCanvas();
})


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
})


// Close buttons (in info boxes)
$('.closeButton, .screenOverlayNegativeSpace').on('click', function (e) {
    // Make screen overlay and info boxes invisible
    $('.screenOverlay, .overlayBox').css({ 'display': 'none' });
})


/*
============================================================================
Initialization Logic
============================================================================
*/
// Establish canvas
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
ctx.save();
setCanvasWidth(MEDIUM);
