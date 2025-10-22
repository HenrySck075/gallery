// script.js

// If using in a modern environment with a module bundler:
import 'mdui/mdui.css'; // This line is not needed if using the global script or CDN link above
import 'mdui/components/dialog.js'; // Import only the components you need if using module imports
import 'mdui/components/button.js';

// If using the <script src="https://unpkg.com/mdui/umd/mdui.global.js"></script> tag:
// You don't need the imports at all.

const gallery = document.getElementById('gallery');
// Get the dialog component directly
const dialog = document.getElementById('image-dialog'); 
const dialogImage = document.getElementById('dialog-image');
const redirectBtn = document.getElementById('redirect-btn');

// Add event listener to the native Web Component button
redirectBtn.addEventListener('click', () => {
  // The click logic is set in the fetch loop, but we need to ensure the listener is registered.
  // The .onclick approach is simpler inside the loop for dynamic data. We'll stick to that in the loop.
  // We can remove this if we keep the .onclick inside the fetch loop.
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
      img.src = item.img;
      img.alt = item.title;
      img.setAttribute('data-lat', item.coordinate[0]);
      img.setAttribute('data-lng', item.coordinate[1]);
      
      itemContainer.appendChild(img);
      gallery.appendChild(itemContainer);

      img.addEventListener('click', () => {
        dialogImage.src = item.img;
        
        // Use an event listener or .onclick for the button
        redirectBtn.onclick = () => {
          window.location.href = `https://wplace.live/?lat=${item.coordinate[0]}&lng=${item.coordinate[1]}`;
        };

        // Correct method to open an MDUI v2 Web Component dialog
        dialog.open = true;
      });
    });
  })
  .catch(error => console.error('Error fetching metadata:', error));





