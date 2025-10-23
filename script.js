// script.js


// If using the <script src="https://unpkg.com/mdui/umd/mdui.global.js"></script> tag:
// You don't need the imports at all.

const gallery = document.getElementById('gallery');
// Get the dialog component directly
const dialog = document.getElementById('image-dialog'); 
const dialogCloseBtn = document.getElementById('dialog-close'); 
const dialogImage = document.getElementById('dialog-image');
const redirectBtn = document.getElementById('redirect-btn');


const m_title = document.getElementById("title");
const m_desc = document.getElementById("desc");
const m_tilePos = document.getElementById("tilePos");

// Add event listener to the native Web Component button
redirectBtn.addEventListener('click', () => {
  // The click logic is set in the fetch loop, but we need to ensure the listener is registered.
  // The .onclick approach is simpler inside the loop for dynamic data. We'll stick to that in the loop.
  // We can remove this if we keep the .onclick inside the fetch loop.
});

dialogCloseBtn.addEventListener('click', () => {
  dialog.open = false; // Correct method to close an MDUI v2 Web Component dialog
});

// Load metadata
fetch('metadata.json')
  .then(response => response.json())
  .then(data => {
    data.forEach(item => {
      // Use standard HTML for the grid items
      const itemContainer = document.createElement('div');
      itemContainer.className = 'gallery-item'; // Use a generic class for styling

      // The image element
      const img = document.createElement('img');
      img.src = `assets/thumbnails/480/${item.img}`;
      img.alt = item.title;
      img.setAttribute('data-lat', item.coordinate[0]);
      img.setAttribute('data-lng', item.coordinate[1]);
      
      itemContainer.appendChild(img);
      gallery.appendChild(itemContainer);

      const mercUtil = new MercatorUtils(1000);

      const e = (s)=>{
        // if s is not a number type, insult the contributor by throwing an error
        if (isNaN(s)) {
          throw new Error("ts aint a number vro what are you cooking");
        }
        return s
      }

      img.addEventListener('click', () => {
        dialogImage.src = `assets/images/${item.img}`;
        m_title.textContent = item.title;
        m_desc.textContent = item.description ?? "";

        const tilePos = mercUtil.latLonToTileAndPixel(item.coordinate[0], item.coordinate[1], 11)

        m_tilePos.innerHTML = `Tx: ${tilePos.tile[0]}, Ty: ${tilePos.tile[1]}, Px: ${tilePos.pixel[0]}, Py: ${tilePos.pixel[1]}<br/>C: ${item.coordinate}`
        
        redirectBtn.onclick = () => {
          window.location.href = `https://wplace.live/?lat=${item.coordinate[0]}&lng=${item.coordinate[1]}&zoom=${item.zoom}`;
        };

        dialog.open = true;
      });
    });
  })
  .catch(error => console.error('Error fetching metadata:', error));





