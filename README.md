# แต้มสี

เว็บแตะเติมสีสำหรับเด็กอนุบาล เลือกภาพและสีแล้วแตะช่องในภาพ รองรับเมาส์ จอสัมผัส และแป้นพิมพ์

## Development

- Node.js 22.13+ and npm
- `npm install`
- `npm run dev`
- `npm run build`
- `npx tsc --noEmit`
- `node --experimental-strip-types lib/coloring.test.ts`

Four original illustrations, twelve colors, per-picture undo, eraser, reset, optional sound, PNG download, and device-local autosave. The original image is segmented into enclosed regions before coloring; background and outlines cannot be filled. Arrow keys select regions; Enter or Space fills them.

Progress uses localStorage in the current browser. No accounts or server database are required by the app. Sites hosting access is managed separately.

Image assets: `public/coloring-sheet.png` and `public/og.png`, created with built-in Imagegen. Coloring brief: four bold black and white kindergarten drawings in a 2x2 sprite sheet — butterfly, flower in pot, house with sun, whale — closed regions and large shapes. Social brief: cream/lilac card, exact title “แต้มสี”, tagline “โลกใบเล็ก สีสันใบใหญ่”, partly colored butterfly and five color swatches.

Optional WebMCP: `read_coloring_state` and `fill_coloring_regions`, feature detected through document.modelContext. No supported browser context was available to verify registration and execution in this environment.
