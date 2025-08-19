# html2canvas Documentation

html2canvas is a JavaScript library that allows you to take "screenshots" of DOM elements by rendering them to a canvas element.

## Installation

```bash
npm install html2canvas
```

Or include via CDN:
```html
<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
```

## Basic Usage

```javascript
html2canvas(document.body).then(function(canvas) {
    document.body.appendChild(canvas);
});
```

Or with a specific element:
```javascript
const element = document.getElementById('element-to-capture');
html2canvas(element).then(function(canvas) {
    // Canvas is ready
    document.body.appendChild(canvas);
});
```

## Configuration Options

html2canvas accepts an options object as the second parameter:

```javascript
html2canvas(element, {
    allowTaint: false,         // Whether to allow cross-origin images to taint the canvas
    backgroundColor: '#ffffff', // Canvas background color, if none is specified in DOM
    canvas: null,              // Existing canvas element to use as a base for drawing
    foreignObjectRendering: false, // Whether to use ForeignObject rendering if supported
    imageTimeout: 15000,       // Timeout for loading an image (in milliseconds)
    ignoreElements: function(element) { return false; }, // Predicate function to remove elements
    logging: true,             // Enable logging for debug purposes
    onclone: null,            // Callback function called when the Document has been cloned
    proxy: null,              // URL to the proxy for loading cross-origin images
    removeContainer: true,     // Whether to cleanup the cloned DOM elements html2canvas creates
    scale: window.devicePixelRatio, // The scale to use for rendering
    useCORS: false,           // Whether to attempt to load images from a server using CORS
    width: null,              // The width of the canvas
    height: null,             // The height of the canvas
    x: 0,                     // Crop canvas x-coordinate
    y: 0,                     // Crop canvas y-coordinate
    scrollX: window.pageXOffset, // The x-scroll position to use when rendering
    scrollY: window.pageYOffset, // The y-scroll position to use when rendering
    windowWidth: window.innerWidth, // Window width to use when rendering
    windowHeight: window.innerHeight // Window height to use when rendering
}).then(canvas => {
    // Use the canvas
});
```

## Common Use Cases

### Converting Canvas to Image

```javascript
html2canvas(element).then(canvas => {
    // Convert to data URL
    const imgData = canvas.toDataURL('image/png');
    
    // Create an image element
    const img = new Image();
    img.src = imgData;
    document.body.appendChild(img);
});
```

### Saving as File (with additional library)

```javascript
html2canvas(element).then(canvas => {
    canvas.toBlob(blob => {
        // Use FileSaver.js or similar to save
        saveAs(blob, 'screenshot.png');
    });
});
```

### High Quality Screenshots

```javascript
html2canvas(element, {
    scale: 2, // Increase scale for better quality
    useCORS: true, // Enable CORS for external images
    logging: false // Disable logging in production
}).then(canvas => {
    // High quality canvas ready
});
```

## Working with Dynamic Content

### Handling Scrollable Content

```javascript
const element = document.getElementById('scrollable-content');

html2canvas(element, {
    scrollX: 0,
    scrollY: -window.scrollY,
    windowWidth: document.documentElement.offsetWidth,
    windowHeight: document.documentElement.offsetHeight
}).then(canvas => {
    // Canvas includes scrolled content
});
```

### Cloning and Modifying Elements

```javascript
html2canvas(element, {
    onclone: function(clonedDoc) {
        // Modify cloned document before rendering
        const clonedElement = clonedDoc.getElementById('element-id');
        if (clonedElement) {
            clonedElement.style.display = 'block';
            clonedElement.style.color = 'black';
        }
    }
}).then(canvas => {
    // Rendered with modifications
});
```

## Handling Text and Fonts

### Ensuring Fonts are Loaded

```javascript
// Wait for fonts to load before capturing
document.fonts.ready.then(() => {
    html2canvas(element).then(canvas => {
        // Fonts are loaded and rendered
    });
});
```

### Text Overflow Issues

To handle text that might be cut off:

```javascript
html2canvas(element, {
    onclone: function(clonedDoc) {
        // Find all text elements that might overflow
        const elements = clonedDoc.querySelectorAll('.text-content');
        elements.forEach(el => {
            el.style.overflow = 'visible';
            el.style.whiteSpace = 'normal';
            el.style.wordWrap = 'break-word';
        });
    }
}).then(canvas => {
    // Text should be fully visible
});
```

## Performance Optimization

### Large Elements

For large elements, consider:

```javascript
html2canvas(element, {
    scale: 1, // Lower scale for faster rendering
    logging: false,
    removeContainer: true,
    imageTimeout: 5000 // Shorter timeout
}).then(canvas => {
    // Faster rendering with acceptable quality
});
```

### Excluding Elements

```javascript
html2canvas(element, {
    ignoreElements: function(element) {
        // Ignore elements with specific class
        return element.classList.contains('no-screenshot');
    }
}).then(canvas => {
    // Rendered without ignored elements
});
```

## Common Issues and Solutions

### 1. Cross-Origin Images

If images are not rendering:

```javascript
html2canvas(element, {
    useCORS: true, // Try enabling CORS
    allowTaint: true // Or allow tainted canvas (security implications)
}).then(canvas => {
    // Images should render
});
```

### 2. CSS Properties Not Supported

Some CSS properties may not be fully supported. Common unsupported properties:
- CSS transforms (partial support)
- CSS filters
- Box shadows (partial support)
- Text shadows (partial support)
- Custom fonts (need to be loaded first)

### 3. Canvas Size Limits

Browsers have maximum canvas size limits:
- Chrome: 32,767 pixels
- Firefox: 32,767 pixels
- Safari: 4,096 pixels (iOS) or 16,384 pixels (macOS)

For large content:

```javascript
const maxHeight = 16384; // Safari limit
const element = document.getElementById('large-content');

if (element.scrollHeight > maxHeight) {
    // Split into multiple canvases or scale down
    html2canvas(element, {
        scale: maxHeight / element.scrollHeight
    }).then(canvas => {
        // Scaled to fit within limits
    });
}
```

### 4. Fixing Cut-off Content

```javascript
html2canvas(element, {
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    x: 0,
    y: 0
}).then(canvas => {
    // Should capture full content
});
```

## Integration with PDF Libraries

### With jsPDF

```javascript
html2canvas(element).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    pdf.save('download.pdf');
});
```

### With html2pdf.js

html2pdf.js wraps html2canvas and jsPDF:

```javascript
const opt = {
    margin: 1,
    filename: 'myfile.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
};

html2pdf().set(opt).from(element).save();
```

## Best Practices

1. **Always test cross-browser**: Different browsers may render differently
2. **Handle loading states**: Show a loader while html2canvas is processing
3. **Test with real content**: Make sure fonts, images, and styles load correctly
4. **Consider mobile devices**: Test on various screen sizes and pixel densities
5. **Error handling**: Always include error handling for failed renders

```javascript
html2canvas(element)
    .then(canvas => {
        // Success handling
    })
    .catch(error => {
        console.error('html2canvas error:', error);
        // Show user-friendly error message
    });
```

## Debugging

Enable logging to debug issues:

```javascript
html2canvas(element, {
    logging: true,
    onclone: function(clonedDoc) {
        console.log('Cloned document:', clonedDoc);
    }
}).then(canvas => {
    console.log('Canvas generated:', canvas);
}).catch(error => {
    console.error('Error:', error);
});
```

## Browser Support

html2canvas works on the following browsers (with Promise polyfill):
- Firefox 3.5+
- Google Chrome
- Opera 12+
- IE9+
- Safari 6+

## Limitations

- Doesn't render plugin content (Flash, Java applets, etc.)
- Doesn't render iframe content from different origins
- Canvas elements are rendered as images
- May not perfectly match the original rendering
- Performance can be slow for very large or complex elements

For more detailed information, visit the [official documentation](https://html2canvas.hertzen.com/documentation).