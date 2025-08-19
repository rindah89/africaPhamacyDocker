# html2pdf.js Documentation

html2pdf.js converts any webpage or element into a printable PDF entirely client-side using html2canvas and jsPDF.

## Installation

### CDN (Recommended)
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
```

### NPM
```bash
npm install html2pdf.js
```

### Local File
Download `html2pdf.bundle.min.js` and include:
```html
<script src="html2pdf.bundle.min.js"></script>
```

### Manual Dependencies (Unbundled)
```html
<script src="es6-promise.auto.min.js"></script>
<script src="jspdf.min.js"></script>
<script src="html2canvas.min.js"></script>
<script src="html2pdf.min.js"></script>
```

## Basic Usage

### Simple Conversion
```javascript
// Convert entire body
html2pdf(document.body);

// Convert specific element
var element = document.getElementById('element-to-print');
html2pdf(element);
```

### Console Injection
```javascript
function addScript(url) {
    var script = document.createElement('script');
    script.type = 'application/javascript';
    script.src = url;
    document.head.appendChild(script);
}
addScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
```

## Configuration Options

### Full Configuration Example
```javascript
var element = document.getElementById('element-to-print');
var opt = {
  margin:       1,
  filename:     'myfile.pdf',
  image:        { type: 'jpeg', quality: 0.98 },
  html2canvas:  { scale: 2 },
  jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
};

// New Promise-based usage:
html2pdf().set(opt).from(element).save();

// Old monolithic-style usage:
html2pdf(element, opt);
```

### Configuration Parameters

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `margin` | number or array | 0 | PDF margin (in jsPDF units). Can be a single number, [vMargin, hMargin], or [top, left, bottom, right] |
| `filename` | string | 'file.pdf' | The default filename of the exported PDF |
| `pagebreak` | object | {mode: ['css', 'legacy']} | Controls the pagebreak behaviour on the page |
| `image` | object | {type: 'jpeg', quality: 0.95} | The image type and quality used to generate the PDF |
| `enableLinks` | boolean | true | If enabled, PDF hyperlinks are automatically added on top of all anchor tags |
| `html2canvas` | object | { } | Configuration options sent directly to html2canvas |
| `jsPDF` | object | { } | Configuration options sent directly to jsPDF |

## Worker API

### Initialize Worker
```javascript
var worker = html2pdf();  // Or:  var worker = new html2pdf.Worker;
```

### Basic Workflow
```javascript
var worker = html2pdf().from(element).save();
```

### Worker Methods

| Method | Description |
|--------|-------------|
| `from(src, type)` | Sets the source (HTML string or element) for the PDF |
| `to(target)` | Converts the source to the specified target ('container', 'canvas', 'img', or 'pdf') |
| `output(type, options, src)` | Routes to the appropriate outputPdf or outputImg method |
| `outputPdf(type, options)` | Sends type and options to the jsPDF object's output method |
| `outputImg(type, options)` | Returns the specified data type for the image |
| `save(filename)` | Saves the PDF object with the optional filename |
| `set(opt)` | Sets the specified properties |
| `get(key, cbk)` | Returns the property specified in key |
| `then(onFulfilled, onRejected)` | Standard Promise method with progress-tracking |
| `catch(onRejected)` | Standard Promise method |
| `error(msg)` | Throws an error in the Worker's Promise chain |

### Worker Workflow Steps
```
.from() -> .toContainer() -> .toCanvas() -> .toImg() -> .toPdf() -> .save()
```

## Page Breaks

### Page Break Configuration

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `mode` | string or array | ['css', 'legacy'] | The mode(s) on which to automatically add page-breaks |
| `before` | string or array | [] | CSS selectors for which to add page-breaks before each element |
| `after` | string or array | [] | CSS selectors for which to add page-breaks after each element |
| `avoid` | string or array | [] | CSS selectors for which to avoid page-breaks on these elements |

### Page Break Modes

| Mode | Description |
|------|-------------|
| `avoid-all` | Automatically adds page-breaks to avoid splitting any elements across pages |
| `css` | Adds page-breaks according to the CSS break-before, break-after, and break-inside properties |
| `legacy` | Adds page-breaks after elements with class html2pdf__page-break |

### Page Break Examples
```javascript
// Avoid page-breaks on all elements, and add one before #page2el
html2pdf().set({
  pagebreak: { mode: 'avoid-all', before: '#page2el' }
});

// Enable all 'modes', with no explicit elements
html2pdf().set({
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
});

// No modes, only explicit elements
html2pdf().set({
  pagebreak: { before: '.beforeClass', after: ['#after1', '#after2'], avoid: 'img' }
});
```

### CSS for Page Breaks
```css
/* CSS styling for before/after/avoid */
.before { page-break-before: always; }
.after { page-break-after: always; }
.avoid { page-break-inside: avoid; }
```

## Image Configuration

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | 'jpeg' | The image type. HTMLCanvasElement only supports 'png', 'jpeg', and 'webp' (on Chrome) |
| `quality` | number | 0.95 | The image quality, from 0 to 1. This setting is only used for jpeg/webp (not png) |

## Advanced Examples

### Complete Example with All Options
```javascript
function test() {
  var element = document.getElementById('root');
  html2pdf().from(element).set({
    margin: 1,
    filename: 'test.pdf',
    html2canvas: { scale: 2 },
    jsPDF: {orientation: 'portrait', unit: 'in', format: 'letter', compressPDF: true}
  }).save();
}
```

### Dynamic Page Break Selection
```javascript
function test() {
  var element = document.getElementById('root');
  var mode = document.getElementById('mode').value;
  var pagebreak = (mode === 'specify') 
    ? { mode: '', before: '.before', after: '.after', avoid: '.avoid' } 
    : { mode: mode };
  
  html2pdf().from(element).set({
    filename: mode + '.pdf',
    pagebreak: pagebreak,
    jsPDF: {orientation: 'portrait', unit: 'in', format: 'letter', compressPDF: true}
  }).save();
}
```

### External Content Loading
```javascript
function loadIframe() {
  iframe.onload = function() {
    _window = iframe.contentWindow;
    testLoaded();
  };
  iframe.src = target.value;
}

function testLoaded() {
  var _document = _window.document;
  var script = _document.createElement('script');
  script.addEventListener('load', scriptLoaded);
  script.src = '../../dist/html2pdf.bundle.js';
  _document.body.appendChild(script);
}

function scriptLoaded() {
  html2pdf = _window.html2pdf;
  // Now ready to use
}
```

## CSS Considerations

### Basic Element Styling
```css
/* Avoid unexpected sizing on all elements */
* { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

/* Table styling */
table { 
  border-collapse: collapse; 
}
table td, table th { 
  border: 1px solid black; 
}
```

### Full-Height Elements
```css
html, body { 
  height: 100%; 
}
#iframe { 
  position: relative; 
  width: 100%; 
  height: 100%; 
}
```

## Common Issues and Solutions

### Text Cut-off Issues
When text is being cut off horizontally, ensure proper html2canvas configuration:
```javascript
var opt = {
  html2canvas: { 
    scale: 2,
    useCORS: true,
    allowTaint: true,
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight
  }
};
```

### Large Content Handling
For content that exceeds single page:
```javascript
html2pdf().from(element).set({
  pagebreak: { mode: 'avoid-all' },
  html2canvas: {
    onclone: function(clonedDoc) {
      // Modify cloned document if needed
    }
  }
}).save();
```

### Font Loading Issues
Ensure fonts are loaded before conversion:
```javascript
document.fonts.ready.then(() => {
  html2pdf().from(element).save();
});
```

## Troubleshooting

1. **Install specific bugfix branches**:
   ```bash
   npm install eKoopmans/html2pdf.js#bugfix/clone-nodes-BUILD
   ```

2. **Enable logging for debugging**:
   ```javascript
   html2pdf().set({
     html2canvas: { logging: true }
   }).from(element).save();
   ```

3. **Check browser console for errors** - html2pdf provides detailed error messages

## Browser Support
- Chrome, Firefox, Safari, Edge (modern versions)
- Requires Promise support (polyfill needed for older browsers)
- Some CSS3 features may not be fully supported

## Limitations
- Canvas size limitations vary by browser
- Some CSS properties may not render exactly as displayed
- Cross-origin images require proper CORS configuration
- Performance depends on content complexity and size