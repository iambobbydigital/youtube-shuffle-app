const Jimp = require('jimp');

async function processIcon() {
    try {
        const image = await Jimp.read('public/original-icon.png');

        // Invert colors
        image.invert();

        // Create a black background image of the same size
        const background = new Jimp(image.bitmap.width, image.bitmap.height, 0x000000FF);

        // Composite the inverted image onto the black background
        // Assuming the original image has transparency, inverting it might mess up alpha channel?
        // Jimp invert() inverts all channels including alpha? No, usually RGB.
        // Let's check. If original is black on transparent:
        // Invert -> White on transparent (if alpha preserved).
        // Then composite onto black background.

        // If invert affects alpha, we might need to be careful.
        // Let's assume invert only affects RGB.

        background.composite(image, 0, 0);

        await background.writeAsync('public/brain-icon-processed.png');
        console.log('Icon processed successfully!');
    } catch (err) {
        console.error('Error processing icon:', err);
        process.exit(1);
    }
}

processIcon();
