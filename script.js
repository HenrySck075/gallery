(async ()=>{
const gallery = document.getElementById('gallery');
// Get the dialog component directly
const dialog = document.getElementById('image-dialog'); 
const dialogImage = document.getElementById('dialog-image');
const redirectBtn = document.getElementById('redirect-btn');


const m_title = document.getElementById("title");
const m_desc = document.getElementById("desc");
const m_tilePos = document.getElementById("tilePos");


// load up /assets/images/spotlight/COUNT as an integer
const sldata = (await (await fetch('assets/images/spotlight/items')).text()).split("\n")
const spotlights = parseInt(sldata.shift());
const spotlightIdx = Math.round(Math.random() * (spotlights - 1));

document.documentElement.style.setProperty("--spotlight-background-landscape", `url("assets/images/spotlight/landscape/${sldata[spotlightIdx]}")`)
document.documentElement.style.setProperty("--spotlight-background-portrait", `url("assets/images/spotlight/portrait/${sldata[spotlights+spotlightIdx]}")`)

// Load metadata
fetch('metadata.json')
  .then(response => response.json())
  .then(data => {
    // collect all categories
    const categories = new Set(data.map((v)=>v.categories??[]).flat());
    document.getElementById("filter-dropdown-options").append(Array.from(categories).map((v)=>{
      const e = document.createElement("fluent-option");
      e.value = v;
      e.textContent = v;
      return e;
    }));
    const fd = document.getElementById("filter-dropdown");
    let wlwlwl = undefined
    fd.addEventListener("change", ()=>{
      clearTimeout(wlwlwl);
      wlwlwl = setTimeout(()=>{
        const selectedCategories = fd.enabledOptions.filter((v)=>v._currentSelected).map((v)=>v._value)
        // disable visibility on all items not containing any of the selected categories
        document.querySelectorAll(".gallery-item").forEach((item)=>{
          const itemCategories = JSON.parse(item.dataset.category);
          const hasCategory = selectedCategories.length === 0 || selectedCategories.some((cat)=>itemCategories.includes(cat));
          item.style.display = hasCategory ? "block" : "none";
        })
      }, 1500);
    })

    data.forEach(item => {
      // Use standard HTML for the grid items
      const itemContainer = document.createElement('div');
      itemContainer.className = 'gallery-item'; // Use a generic class for styling
      itemContainer.dataset.category = JSON.stringify(item["categories"] ?? [])
  
      let llp = item.coordinate;
      if (llp == undefined) {
        /*
         * img.bounds: [
         *   [lng, lat], // southwest side
         *   [lng, lat] // northeast side
         * ]*/

        // just set llp as the center point of the bounds nobody cares
        const bounds = item.bounds;
        const sw = bounds[0];
        const ne = bounds[1];
        const centerLat = (sw[1] + ne[1]) / 2;
        const centerLng = (sw[0] + ne[0]) / 2;
        llp = [centerLat, centerLng];
      }
      // The image element
      const img = document.createElement('img');
      img.src = `assets/thumbnails/480/${item.img}`;
      img.alt = item.title;
      img.setAttribute('data-lat', llp[0]);
      img.setAttribute('data-lng', llp[1]);
      
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

        const tilePos = mercUtil.latLonToTileAndPixel(llp[0], llp[1], 11)

        m_tilePos.innerHTML = `Tx: ${tilePos.tile[0]}, Ty: ${tilePos.tile[1]}, Px: ${tilePos.pixel[0]}, Py: ${tilePos.pixel[1]}<br/>C: ${llp}`
        
        redirectBtn.onclick = () => {
          window.location.href = `https://wplace.live/?lat=${llp[0]}&lng=${llp[1]}&zoom=${item.zoom??1}`;
        };

        dialog.show();
      });
    });
  })
  .catch(error => console.error('Error fetching metadata:', error));




})()
