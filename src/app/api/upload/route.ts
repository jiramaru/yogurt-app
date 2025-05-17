import { NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { Readable } from 'stream';

// POST: Upload an image to Cloudinary
export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate that a file was provided
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, or GIF allowed' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload the file to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'yogurt-shop', // Store images in a 'yogurt-shop' folder
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Pipe the buffer to the upload stream
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null); // Signal end of stream
      readableStream.pipe(uploadStream);
    });

    // Return the secure URL of the uploaded image
    return NextResponse.json(
      { imageUrl: (result as any).secure_url },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}