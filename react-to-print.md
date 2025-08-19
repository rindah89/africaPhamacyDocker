# React-to-Print Documentation

React-to-Print is a React library that allows you to print the content of React components directly in the browser, offering customization options for the printing process.

## Installation

```bash
npm install react-to-print
# or
yarn add react-to-print
```

## Basic Usage

### Using the useReactToPrint Hook

```tsx
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";

const contentRef = useRef<HTMLDivElement>(null);
const reactToPrintFn = useReactToPrint({ contentRef });

return (
  <div>
    <button onClick={reactToPrintFn}>Print</button>
    <div ref={contentRef}>Content to print</div>
  </div>
);
```

## Advanced Examples

### Printing Class Components

For class-based components, you need to forward refs manually:

```tsx
class ComponentToPrint extends Component {
  render() {
    return (
      <div ref={this.props.innerRef}>
        Print content
      </div>
    )
  }
}

function App {
  const contentRef = useRef(null);
  const handlePrint = useReactToPrint({ contentRef });

  return (
    <div>
      <button onClick={handlePrint}>Print</button>
      <ComponentToPrint innerRef={contentRef} />
    </div>
  );
}
```

### Handling Asynchronous State Updates

When you need to update state before printing:

```tsx
const [isPrinting, setIsPrinting] = useState(false);
const contentRef = useRef(null);

// We store the resolve Promise being used in `onBeforePrint` here
const promiseResolveRef = useRef(null);

// We watch for the state to change here, and for the Promise resolve to be available
useEffect(() => {
  if (isPrinting && promiseResolveRef.current) {
    // Resolves the Promise, letting `react-to-print` know that the DOM updates are completed
    promiseResolveRef.current();
  }
}, [isPrinting]);

const handlePrint = useReactToPrint({
  contentRef,
  onBeforePrint: () => {
    return new Promise((resolve) => {
      promiseResolveRef.current = resolve;
      setIsPrinting(true);
    });
  },
  onAfterPrint: () => {
    // Reset the Promise resolve so we can print again
    promiseResolveRef.current = null;
    setIsPrinting(false);
  }
});
```

### Custom Print Function

You can provide a custom print function for advanced use cases like PDF generation:

```tsx
const handlePrint = useReactToPrint({
  ...,
  print: async (printIframe: HTMLIframeElement) => {
    // Do whatever you want here, including asynchronous work
    await generateAndSavePDF(printIframe);
  }
});
```

### Hiding Component from Screen

To hide the printable component from the screen while keeping it in the DOM:

```jsx
<div style={{ display: "none" }}>
  <ComponentToPrint ref={componentRef} />
</div>
```

## CSS Styling for Print

### Show/Hide Content During Printing

```css
.printContent {
  display: none;

  @media print {
    display: block;
  }
}
```

### Fixing Blank Pages

If you're getting blank pages, try this CSS:

```css
@media print {
  html, body {
    height: 100vh; /* Use 100% here to support printing more than a single page*/
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden;
  }
}
```

### Setting Page Orientation

To force landscape orientation:

```css
@media print {
  @page { size: landscape; }
}
```

Or inline in JSX:

```jsx
<style type="text/css" media="print">{"\n  @page {\ size: landscape;\ }\n"}</style>
```

### Custom Page Size

```css
@media print {
  @page {
    size: 50mm 150mm;
  }
}
```

### Custom Page Margins

```js
const getPageMargins = () => {
  return `@page { margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important; }`;
};
```

Then in your component:

```jsx
<style>{getPageMargins()}</style>
```

## Handling Dynamic Content

### Page Breaks

Define CSS for page breaks:

```css
@media all {
  .page-break {
    display: none;
  }
}

@media print {
  html, body {
    height: initial !important;
    overflow: initial !important;
    -webkit-print-color-adjust: exact;
  }
}

@media print {
  .page-break {
    margin-top: 1rem;
    display: block;
    page-break-before: auto;
  }
}

@page {
  size: auto;
  margin: 20mm;
}
```

Insert page breaks in your content:

```jsx
<div className="print-container" style={{ margin: "0", padding: "0" }}>
  {listOfContent.map(yourContent => (
    <>
      <div className="page-break" />
      <div>{yourContent}</div>
    </>
  ))}
</div>
```

### Scrolling Containers

To show all content in a scrolling container when printing:

```css
@media print {
  .scroll-container {
    overflow: visible;
    height: fit-content;
  }
}
```

Or control scroll position programmatically:

```javascript
const customToPrint = (printWindow) => {
  const printContent = printWindow.contentDocument || printWindow.contentWindow?.document;
  const printedScrollContainer = printContent.querySelector('.scroll-container');

  const originScrollContainer = document.querySelector('.scroll-container');

  // Set the scroll position of the printed container to match the origin container
  printedScrollContainer.scrollTop = originScrollContainer.scrollTop;

  // You can also set the `overflow` and `height` properties of the printed container to show all content.
  // printedScrollContainer.style.overflow = "visible";
  // printedScrollContainer.style.height = "fit-content";

  printWindow.contentWindow.print();
}

const handlePrint = useReactToPrint({
  // ...
  print: customToPrint,
});
```

## Important Notes

1. **CSS Targeting**: When using react-to-print, CSS rules must directly target the elements that are included in the print output, not their ancestors that are outside the print scope.

2. **Font Loading**: If using custom fonts, make sure they are properly loaded before printing to avoid font rendering issues.

3. **State Management**: For components that depend on external state, ensure the state is properly synchronized before printing.

4. **Browser Compatibility**: The library works across modern browsers but may have varying support for certain CSS print features.

## TypeScript Support

The library includes TypeScript definitions. When using TypeScript, make sure to properly type your refs:

```tsx
const contentRef = useRef<HTMLDivElement>(null);
```

## Common Use Cases

- Printing invoices
- Generating reports
- Creating printable forms
- Exporting data visualizations
- Printing receipts
- Creating PDF documents (with custom print function)

## Troubleshooting

1. **Blank Pages**: Check your CSS for height and overflow properties
2. **Missing Styles**: Ensure styles are applied directly to printed elements
3. **Async Content**: Use the promise-based approach for async state updates
4. **Font Issues**: Verify fonts are loaded before printing
5. **Layout Problems**: Test with different page sizes and orientations

For more detailed information and updates, visit the [react-to-print GitHub repository](https://github.com/matthewherbst/react-to-print).