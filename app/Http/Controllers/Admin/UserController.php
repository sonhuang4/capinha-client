<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Card;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class UserController extends Controller
{
    /**
     * Display users list with advanced filters
     */
    public function index(Request $request)
    {
        $query = User::query()->with(['cards']);
        
        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        // Role filter
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }
        
        // Status filter
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } elseif ($request->status === 'inactive') {
                $query->where('is_active', false);
            }
        }
        
        // Date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }
        
        // Cards count filter
        if ($request->filled('cards_count')) {
            $cardsFilter = $request->cards_count;
            if ($cardsFilter === 'none') {
                $query->doesntHave('cards');
            } elseif ($cardsFilter === 'has_cards') {
                $query->has('cards');
            } elseif ($cardsFilter === 'multiple') {
                $query->has('cards', '>', 1);
            }
        }
        
        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        $allowedSorts = ['name', 'email', 'created_at', 'role', 'cards_count'];
        if (in_array($sortBy, $allowedSorts)) {
            if ($sortBy === 'cards_count') {
                $query->withCount('cards')->orderBy('cards_count', $sortOrder);
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }
        }
        
        // Pagination
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage)->withQueryString();
        
        // Add additional data for each user
        $users->getCollection()->transform(function ($user) {
            $user->cards_count = $user->cards->count();
            $user->last_card_created = $user->cards->sortByDesc('created_at')->first()?->created_at;
            $user->total_card_views = $user->cards->sum('click_count');
            return $user;
        });
        
        // Summary statistics
        $stats = [
            'total_users' => User::count(),
            'active_users' => User::where('is_active', true)->count(),
            'inactive_users' => User::where('is_active', false)->count(),
            'admin_users' => User::where('role', 'admin')->count(),
            'client_users' => User::where('role', 'client')->count(),
            'users_with_cards' => User::has('cards')->count(),
            'users_this_month' => User::whereMonth('created_at', Carbon::now()->month)->count(),
        ];
        
        return inertia('Admin/Users/Index', [
            'users' => $users,
            'stats' => $stats,
            'filters' => $request->only(['search', 'role', 'status', 'date_from', 'date_to', 'cards_count', 'sort_by', 'sort_order', 'per_page'])
        ]);
    }
    
    /**
     * Show user details
     */
    public function show(User $user)
    {
        $user->load(['cards' => function($query) {
            $query->withCount('activations')->orderBy('created_at', 'desc');
        }]);
        
        // User statistics
        $userStats = [
            'total_cards' => $user->cards->count(),
            'active_cards' => $user->cards->where('status', 'activated')->count(),
            'pending_cards' => $user->cards->where('status', 'pending')->count(),
            'total_views' => $user->cards->sum('click_count'),
            'avg_views_per_card' => $user->cards->count() > 0 ? round($user->cards->sum('click_count') / $user->cards->count(), 1) : 0,
            'first_card_created' => $user->cards->sortBy('created_at')->first()?->created_at,
            'last_card_created' => $user->cards->sortByDesc('created_at')->first()?->created_at,
            'most_viewed_card' => $user->cards->sortByDesc('click_count')->first(),
        ];
        
        return inertia('Admin/Users/Show', [
            'user' => $user,
            'stats' => $userStats
        ]);
    }
    
    /**
     * Update user status
     */
    public function updateStatus(Request $request, User $user)
    {
        $request->validate([
            'is_active' => 'required|boolean'
        ]);
        
        $user->update([
            'is_active' => $request->is_active
        ]);
        
        return back()->with('success', 'User status updated successfully');
        // return response()->json([
        //     "status": true,
        //     "message"
        // ])
    }
    
    /**
     * Update user role
     */
    public function updateRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,client'
        ]);
        
        $user->update([
            'role' => $request->role
        ]);
        
        return back()->with('success', 'User role updated successfully');
    }
    
    /**
     * Delete user
     */
    public function destroy(User $user)
    {
        // Don't allow deleting the current user
        if ($user->id === auth()->id()) {
            return response()->json(['message'=> 'You cannot delete your own account']);
        }
        
        // Don't allow deleting if user has cards (optional - you can change this logic)
        // if ($user->cards()->count() > 0) {
        //     return response()->json(['message'=> 'Cannot delete user with existing cards. Please remove cards first']);
        // }
        
        $user->delete();
        
        return response()->json(['message'=> 'YUser deleted successfully']);
    }
    
    /**
     * Bulk actions
     */
    public function bulkAction(Request $request)
    {
        $request->validate([
            'action' => 'required|in:activate,deactivate,delete',
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);
        
        $userIds = $request->user_ids;
        $currentUserId = auth()->id();
        
        // Remove current user from bulk actions
        $userIds = array_filter($userIds, fn($id) => $id != $currentUserId);
        
        if (empty($userIds)) {
            return back()->with('error', 'No valid users selected');
        }
        
        switch ($request->action) {
            case 'activate':
                User::whereIn('id', $userIds)->update(['is_active' => true]);
                $message = 'Users activated successfully';
                break;
                
            case 'deactivate':
                User::whereIn('id', $userIds)->update(['is_active' => false]);
                $message = 'Users deactivated successfully';
                break;
                
            case 'delete':
                // Only delete users without cards
                $usersToDelete = User::whereIn('id', $userIds)
                    ->doesntHave('cards')
                    ->pluck('id');
                    
                User::whereIn('id', $usersToDelete)->delete();
                
                $deletedCount = count($usersToDelete);
                $skippedCount = count($userIds) - $deletedCount;
                
                if ($skippedCount > 0) {
                    $message = "Deleted {$deletedCount} users. {$skippedCount} users skipped (have cards).";
                } else {
                    $message = "Deleted {$deletedCount} users successfully";
                }
                break;
        }
        
        return back()->with('success', $message);
    }
    
    /**
     * Export users data
     */
    public function export(Request $request)
    {
        $query = User::query()->with(['cards']);
        
        // Apply same filters as index
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }
        
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('is_active', true);
            } else {
                $query->where('is_active', false);
            }
        }
        
        $users = $query->get();
        
        $csvData = [];
        $csvData[] = ['Name', 'Email', 'Role', 'Status', 'Cards Count', 'Total Views', 'Created At'];
        
        foreach ($users as $user) {
            $csvData[] = [
                $user->name,
                $user->email,
                $user->role,
                $user->is_active ? 'Active' : 'Inactive',
                $user->cards->count(),
                $user->cards->sum('click_count'),
                $user->created_at->format('Y-m-d H:i:s')
            ];
        }
        
        $filename = 'users_export_' . Carbon::now()->format('Y-m-d_H-i-s') . '.csv';
        
        $callback = function() use ($csvData) {
            $file = fopen('php://output', 'w');
            foreach ($csvData as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };
        
        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }
}