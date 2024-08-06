// This array contains the card category folder names, as well as dictating the order they will be loaded in
const cardCategories = [
  'Hero Character Cards',
  'Hero Cards',
  'Villain Character Cards',
  'Events',
  'Critical Events',
  'Villain Cards',
  'Environment Cards'
]

let currentCardCategory = 0;

// Load first set of card data (the rest will follow)
setTimeout(function () {
  $.ajax({
    url: `/card-gallery/${cardCategories[0]}.tsv`,
    success: function (data) {
      loadCards(data, cardCategories[0]);
    }
  });
}, 1)

// Function to load cards, used one category at a time
function loadCards(tsvData, dataGroup) {

  // Get each row of card data
  dataLines = tsvData.split('\n');

  // Get data labels (headings in the spreadsheet) and number of first data line
  let labels = [], firstDataLine = 0;

  // Check if it's a one-row heading spreadsheet or two-row heading spreadsheet
  const firstRow = dataLines[0].split('\t');
  const secondRow = dataLines[1].split('\t');
  
  // If the first cell of the second row isn't blank...
  if (secondRow[0] != '') {
    // It's a one-row heading

    // First data line is 2nd row in spreadsheet
    firstDataLine = 1;

    // To get labels, split the first row by tabs
    labels = dataLines[0].split('\t');
  }
  // Otherwise...
  else {
    // It's a two-row heading

    // First data line is 3nd row in spreadsheet
    firstDataLine = 2;

    // To get labels, split the first and second row by tabs and combine when needed
    for (let i = 0; i < firstRow.length; i++) {
      const firstRowCell = firstRow[i];
      const secondRowCell = secondRow[i];
      // If second row cell isn't blank, combine the two rows
      if (secondRowCell != '') {
        // Find the appropriate first row part by going backwards in the row until we find something
        for (let ii = 0; ii < 10; ii++) {
          const firstRowTestCell = firstRow[i - ii];
          // If this cell isn't blank...
          if (firstRowTestCell != '') {
            // We found something
            // Combine first row cell and second row cell to make the label
            labels.push(firstRowTestCell + ' ' + secondRowCell);
            break;
          }
        }
      }
      // Otherwise, just use the first row's cell
      else {
        labels.push(firstRowCell);
      }
    }
  }

  // Iterate through each data line
  for (i = firstDataLine; i < dataLines.length; i++) {
    // Separate out the values by splitting the line by tabs
    const cardData = dataLines[i].split('\t');

    // Get image path differently depending on the category (due to spreadsheet formatting)
    let imagePath1, imagePath2, folderName, fileName;
    switch (dataGroup) {
      case 'Hero Cards':
      case 'Environment Cards':
        folderName = cardData[0];
        fileName = cardData[1];
        imagePath1 = "/_resources/Scans/" + dataGroup + "/" + folderName + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath1 = imagePath1.replaceAll('"', '').replaceAll('?', '');
        // Deck Back
        fileName = folderName;
        imagePath2 = "/_resources/Scans/Deck Backs/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath2 = imagePath2.replaceAll('"', '').replaceAll('?', '');
        break;

      case 'Villain Cards':
        folderName = cardData[1];
        fileName = cardData[2];
        imagePath1 = "/_resources/Scans/" + dataGroup + "/" + folderName + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath1 = imagePath1.replaceAll('"', '').replaceAll('?', '');
        // Deck Back
        fileName = folderName;
        imagePath2 = "/_resources/Scans/Deck Backs/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath2 = imagePath2.replaceAll('"', '').replaceAll('?', '');
        break;

      case 'Hero Character Cards':
        fileName = `${cardData[1]}/${cardData[0]} Front`;
        imagePath1 = "/_resources/Scans/" + dataGroup + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath1 = imagePath1.replaceAll('"', '').replaceAll('?', '');
        // Then repeat for the back side
        fileName = `${cardData[1]}/${cardData[0]} Back`;
        imagePath2 = "/_resources/Scans/" + dataGroup + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath2 = imagePath2.replaceAll('"', '').replaceAll('?', '');
        break;

      case 'Villain Character Cards':
        fileName = `${cardData[1]} Front`;
        imagePath1 = "/_resources/Scans/" + dataGroup + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath1 = imagePath1.replaceAll('"', '').replaceAll('?', '');
        // Then repeat for the back side
        fileName = `${cardData[1]} Back`;
        imagePath2 = "/_resources/Scans/" + dataGroup + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath2 = imagePath2.replaceAll('"', '').replaceAll('?', '');
        break;

      case 'Events':
        fileName = `${cardData[0]} Front`;
        imagePath1 = "/_resources/Scans/" + dataGroup + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath1 = imagePath1.replaceAll('"', '').replaceAll('?', '');
        // Then repeat for the back side
        fileName = `${cardData[0]} Back`;
        imagePath2 = "/_resources/Scans/" + dataGroup + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath2 = imagePath2.replaceAll('"', '').replaceAll('?', '');
        break;

      case 'Critical Events':
        fileName = `${cardData[0]} Front`;
        imagePath1 = "/_resources/Scans/" + dataGroup + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath1 = imagePath1.replaceAll('"', '').replaceAll('?', '');
        // Then repeat for the back side
        fileName = `${cardData[0]} Back`;
        imagePath2 = "/_resources/Scans/" + dataGroup + "/" + fileName + ".webp";
        // Strip out quotation marks and question marks because the files name's can't have them
        imagePath2 = imagePath2.replaceAll('"', '').replaceAll('?', '');
        break;
    }

    // Create new card HTML

    // Create details element
    let detailsElement = '';
    for (ii = 0; ii < cardData.length - 1; ii++) {
      detailsElement += `<p><strong>${labels[ii]}:</strong> ${cardData[ii]}</p>`;
    }

    // Add extra classes to the cards if necessary
    let extraClasses = '';
    switch (dataGroup) {
      case 'Hero Cards':
        extraClasses += ' heroCard flippable';
        break;
      case 'Villain Cards':
        extraClasses += ' villainCard flippable';
        break;
      case 'Environment Cards':
        extraClasses += ' environmentCard flippable';
        break;
      case 'Hero Character Cards':
        extraClasses += ' heroCharacterCard flippable';
        break;
      case 'Villain Character Cards':
        extraClasses += ' villainCharacterCard flippable';
        break;
      case 'Events':
        extraClasses += ' event flippable';
        break;
      case 'Critical Events':
        extraClasses += ' criticalEvent flippable';
        break;
    }

    // Assemble a card element with the image(s) and the details
    let newHTML = `
<div class="card${extraClasses}">
  <img class="cardImage" src="${imagePath1}" loading="lazy" />
  ${imagePath2 ? `<img class="cardImage" src="${imagePath2}" loading="lazy" style="display: none;" />` : ''}
  <details class="cardDetails">
    <summary>Details</summary>
    ${detailsElement}
    </div>
  </details>
  `;

    // Add the card element to the display
    $(".cardFlexDisplay").append(newHTML);
  }

  // Start loading next card category
  currentCardCategory++;
  const nextCategoryName = cardCategories[currentCardCategory];
  // Check if we're done
  if (nextCategoryName != undefined) {
    // Load card data
    setTimeout(function () {
      $.ajax({
        url: `/card-gallery/${nextCategoryName}.tsv`,
        success: function (data) {
          loadCards(data, nextCategoryName);
        }
      });
    }, 1)
  }
  else {
    // Once all the cards have been generated...
    // Flip cards when needed
    $('.flippable .cardImage').click(function() {
      // Mark as flipped
      $(this).parent().toggleClass('flipped');
      // Toggle image
      $(this).parent().children('.cardImage').toggle();
    })
  }

}

// Submit search as user types, if enabled
$(".searchInput").on("input", function (e) {
  // Check if auto submit is checked
  if($("#autoSubmit").is(":checked")){
    submitSearch();
  }
})

// Filter display based on search input
function submitSearch() {
  // Check if regex checkbox is checked
  if ($("#regex").is(":checked")) {
    // Create new RegExp from search value, catch errors and do nothing will malformed RegExp
    try{
      const regex = new RegExp( $(".searchInput").val(), "i")

      $(".card").each(function (index, element) {
        // Get card content (text of cardDetails element basically) and test against RegExp search
        if (regex.test($(this).text())) {
          $(this).show();
        }
        else {
          $(this).hide();
        }
      })
    } catch(e){}
  }
  else {
    // Get the query and make it not case-sensitive
    const query = $(".searchInput").val().toLowerCase();

    // Show or hide each card
    $(".card").each(function (index, element) {
      // Get card content (text of cardDetails element basically) and make it not case-sensitive
      let cardContent = $(this).text().toLowerCase();
      // See if the card content contains the query
      if (cardContent.includes(query)) {
        $(this).show();
      }
      else {
        $(this).hide();
      }
    })
  }
}