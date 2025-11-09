For those who just touched GitHub, [see this tutorial on how to create a simple pull request](https://www.youtube.com/watch?v=nCKdihvneS0) or idk ask your beloved search engine

anyways:

# How to add a new image entry to the gallery

Add the following entry to the [metadata file](metadata.json):
```
[
  ...,
// These things that begins with double slashes are comments, and when editing please remove these before adding to the metadata file
  {
    "img": "filename.imgext", // The filename of the image e.g. ruby.png, teto.jpg, ...
    "title": "Title of the image",
    "description": "Say some line about the image! Multi-line isn't supported though...",
    "coordinate": [35.044317292618146, 138.89364224677735], // where to send the user to...
    "zoom": 14.281434055006502, // ... along with the zoom level
    // Tells the renderer the boundary of the image as a pair of [lng, lat] WGS84 coordinates
    "bounds": [
      [138.88643521552729, 35.056692919609674], // southwest (top-left)
      [138.9012008405273, 35.03827270026619] // northeast (bottom-right)
    ]
  }
]
```

Don't make the bounds too large tho because there's a zoom limit, and even in the case that I can modify its zoom limit (not now i got rate limited from the backend server) please don't do it.

