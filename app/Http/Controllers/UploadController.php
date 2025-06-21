<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\File;

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
                'ip' => $request->ip(),
                'environment' => app()->environment(),
                'app_url' => config('app.url')
            ]);

            // ✅ STEP 1: VALIDATE REQUEST
            $request->validate([
                'file' => 'required|image|mimes:jpeg,jpg,png,gif,webp|max:2048',
                'type' => 'required|in:profile,logo'
            ]);

            $file = $request->file('file');
            $type = $request->input('type');
            
            // ✅ STEP 2: CHECK AND CREATE STORAGE LINK IF NEEDED
            $this->ensureStorageLinkExists();
            
            // ✅ STEP 3: CREATE UPLOAD DIRECTORIES IF THEY DON'T EXIST
            $this->ensureUploadDirectoriesExist();
            
            // ✅ STEP 4: GENERATE UNIQUE FILENAME
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            
            // ✅ STEP 5: STORE FILE
            $relativePath = 'uploads/' . $type . '/' . $filename;
            $path = $file->storeAs('uploads/' . $type, $filename, 'public');
            
            // ✅ STEP 6: GENERATE PROPER URL FOR ENVIRONMENT
            $url = $this->generateImageUrl($path);
            
            // ✅ STEP 7: VERIFY FILE WAS STORED CORRECTLY
            if (!Storage::disk('public')->exists($path)) {
                throw new \Exception('File was not stored correctly');
            }
            
            // ✅ STEP 8: VERIFY URL IS ACCESSIBLE
            $fullPath = storage_path('app/public/' . $path);
            if (!file_exists($fullPath)) {
                throw new \Exception('File was stored but is not accessible at: ' . $fullPath);
            }

            Log::info('Upload successful', [
                'filename' => $filename,
                'path' => $path,
                'url' => $url,
                'full_path' => $fullPath,
                'file_exists' => file_exists($fullPath),
                'storage_link_exists' => is_link(public_path('storage')),
                'user_id' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'url' => $url,
                'filename' => $filename,
                'path' => $path,
                'size' => $file->getSize(),
                'debug' => [
                    'environment' => app()->environment(),
                    'storage_link_exists' => is_link(public_path('storage')),
                    'file_exists' => file_exists($fullPath),
                    'app_url' => config('app.url')
                ]
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Upload validation failed', [
                'errors' => $e->errors(),
                'user_id' => auth()->id()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Validation failed: ' . implode(', ', array_flatten($e->errors())),
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => auth()->id(),
                'storage_info' => $this->getStorageDebugInfo()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Upload failed: ' . $e->getMessage(),
                'debug' => app()->environment() === 'local' ? [
                    'error' => $e->getMessage(),
                    'storage_info' => $this->getStorageDebugInfo()
                ] : null
            ], 500);
        }
    }

    /**
     * Ensure storage link exists, create if missing
     */
    private function ensureStorageLinkExists()
    {
        $linkPath = public_path('storage');
        $targetPath = storage_path('app/public');

        // Check if link exists and is valid
        if (is_link($linkPath)) {
            // Link exists, check if it's valid
            if (readlink($linkPath) === $targetPath) {
                Log::info('Storage link exists and is valid');
                return;
            } else {
                // Link exists but points to wrong location, remove it
                Log::warning('Storage link exists but points to wrong location, removing');
                unlink($linkPath);
            }
        } elseif (file_exists($linkPath)) {
            // Path exists but is not a link (maybe a directory), remove it
            Log::warning('Storage path exists but is not a link, removing');
            File::deleteDirectory($linkPath);
        }

        // Create the link
        try {
            symlink($targetPath, $linkPath);
            Log::info('Storage link created successfully', [
                'link' => $linkPath,
                'target' => $targetPath
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create storage link', [
                'error' => $e->getMessage(),
                'link' => $linkPath,
                'target' => $targetPath
            ]);
            throw new \Exception('Cannot create storage link: ' . $e->getMessage());
        }
    }

    /**
     * Ensure upload directories exist
     */
    private function ensureUploadDirectoriesExist()
    {
        $directories = ['uploads', 'uploads/profile', 'uploads/logo'];
        
        foreach ($directories as $dir) {
            if (!Storage::disk('public')->exists($dir)) {
                Storage::disk('public')->makeDirectory($dir);
                Log::info('Created upload directory: ' . $dir);
            }
        }
    }

    /**
     * Generate proper image URL for current environment
     */
    private function generateImageUrl($path)
    {
        // Get base URL from config
        $baseUrl = config('app.url');
        
        // Remove trailing slash
        $baseUrl = rtrim($baseUrl, '/');
        
        // Generate URL
        $url = $baseUrl . '/storage/' . $path;
        
        // Force HTTPS in production
        if (app()->environment('production') && !str_starts_with($url, 'https://')) {
            $url = str_replace('http://', 'https://', $url);
        }
        
        Log::info('Generated image URL', [
            'path' => $path,
            'base_url' => $baseUrl,
            'final_url' => $url,
            'environment' => app()->environment()
        ]);
        
        return $url;
    }

    /**
     * Get storage debug information
     */
    private function getStorageDebugInfo()
    {
        return [
            'storage_path' => storage_path('app/public'),
            'public_path' => public_path('storage'),
            'storage_link_exists' => is_link(public_path('storage')),
            'storage_link_target' => is_link(public_path('storage')) ? readlink(public_path('storage')) : null,
            'storage_directory_exists' => is_dir(storage_path('app/public')),
            'public_storage_exists' => file_exists(public_path('storage')),
            'app_url' => config('app.url'),
            'environment' => app()->environment(),
            'upload_directories' => [
                'uploads' => Storage::disk('public')->exists('uploads'),
                'uploads/profile' => Storage::disk('public')->exists('uploads/profile'),
                'uploads/logo' => Storage::disk('public')->exists('uploads/logo'),
            ]
        ];
    }

    /**
     * Test endpoint to check storage configuration
     */
    public function testStorage()
    {
        try {
            $debugInfo = $this->getStorageDebugInfo();
            
            // Try to create a test file
            $testContent = 'Test file created at ' . now();
            $testPath = 'test.txt';
            
            Storage::disk('public')->put($testPath, $testContent);
            
            $debugInfo['test_file_created'] = Storage::disk('public')->exists($testPath);
            $debugInfo['test_file_url'] = $this->generateImageUrl($testPath);
            
            // Clean up test file
            Storage::disk('public')->delete($testPath);
            
            return response()->json([
                'success' => true,
                'message' => 'Storage configuration test completed',
                'debug_info' => $debugInfo
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Storage test failed: ' . $e->getMessage(),
                'debug_info' => $this->getStorageDebugInfo()
            ], 500);
        }
    }
}