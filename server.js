import app from './app.js';

  // "type": "module", in package.json file to import and export module (ES MODULE)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running at http:localhost:${PORT}`);
})