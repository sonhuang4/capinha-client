<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        try {
            Log::info('Upload request received', [
                'has_file' => $request->hasFile('file'),
                'file_size' => $request->hasFile('file') ? $request->file('file')->getSize() : null,
                'file_type' => $request->hasFile('file') ? $request->file('file')->getMimeType() : null,
                'type' => $request->input('type'),
                'user_id' => auth()->id(),
                'ip' => $request->ip()
            ]);

            $request->validate([
                'file' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
                'type' => 'required|in:profile,logo'
            ]);

            $file = $request->file('file');
            $type = $request->input('type');
            
            // Generate unique filename
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // Store file
            $path = $file->storeAs('uploads/' . $type, $filename, 'public');
            $url = asset('storage/' . $path);

            Log::info('Upload successful', [
                'filename' => $filename,
                'path' => $path,
                'url' => $url,
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'url' => $url,
                'filename' => $filename,
                'size' => $file->getSize()
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed: ' . implode(', ', array_flatten($e->errors())),
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Upload failed', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage()
            ], 500);
        }
    }
}