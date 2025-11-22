import { Jimp } from 'jimp';

async function processIcon() {
    try {
        const image = await Jimp.read('public/original-icon.png');

        // Invert colors
        image.invert();

        // Create a black background image of the same size
        // Jimp constructor might have changed.
        // Usually new Jimp(w, h, color)
        const background = new Jimp({ width: image.bitmap.width, height: image.bitmap.height, color: 0x000000FF });

        // Composite the inverted image onto the black background
        background.composite(image, 0, 0);

        await background.write('public/brain-icon-processed.png');
        console.log('Icon processed successfully!');
    } catch (err) {
        console.error('Error processing icon:', err);
        process.exit(1);
    }
}

processIcon();
