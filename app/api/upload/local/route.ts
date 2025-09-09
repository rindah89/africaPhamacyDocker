import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 4MB)
    const maxSize = 4 * 1024 * 1024; // 4MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 4MB limit' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    
    // Create upload directory structure
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');
    await mkdir(uploadDir, { recursive: true });
    
    // Save file
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    // Return the URL path (relative to public)
    const url = `/uploads/images/${fileName}`;
    
    return NextResponse.json({
      url,
      name: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Handle multiple file uploads
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    
    for (const file of files) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        continue; // Skip invalid files
      }

      // Validate file size (max 4MB)
      const maxSize = 4 * 1024 * 1024;
      if (file.size > maxSize) {
        continue; // Skip oversized files
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate unique filename
      const fileExtension = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExtension}`;
      
      // Create upload directory
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');
      await mkdir(uploadDir, { recursive: true });
      
      // Save file
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);
      
      // Add to uploaded files list
      uploadedFiles.push({
        url: `/uploads/images/${fileName}`,
        name: fileName,
        size: file.size,
        type: file.type,
      });
    }
    
    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error('Multiple upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}