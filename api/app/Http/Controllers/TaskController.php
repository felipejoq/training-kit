<?php
/*
ETK - Eniwer Training Kit
Copyright (C) 2025 Felipe Andrés Solís Albanese

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Task;
use App\Models\TaskStatus;

use Auth;

class TaskController extends Controller
{
    private $client;

    public function browse(Request $request)
    {
        if ($request->filled('archived')) {
            switch ($request->archived) {
                case 'true':
                    $items = Task::where('enabled', TRUE)->orderBy('id', 'DESC')->with('creator','client','status')->get();
                    if (!count($items)) return response()->json(['message' => 'No records'], 404);
                    return response()->json($items, 200);
                    break;
                case 'false':
                    $items = Task::where('enabled', TRUE)->where('archived', FALSE)->orderBy('id', 'DESC')->with('creator','client','status')->get();
                    if (!count($items)) return response()->json(['message' => 'No records'], 404);
                    return response()->json($items, 200);
                    break;
                default:

                    break;
            }
        } else {
            $items = Task::where('enabled', TRUE)->where('archived', FALSE)->orderBy('id', 'DESC')->with('creator','client','status')->get();
            if (!count($items)) return response()->json(['message' => 'No records'], 404);
            return response()->json($items, 200);
        }

    }

    public function read(Request $request, $id = NULL)
    {
        if (!isset($id)) return response()->json(['message' => 'Missing "id"'], 400);
        $task = Task::where('enabled', TRUE)->find($id);
        if (!isset($task->id)) return response()->json(['message' => 'Not found'], 404);
        return response()->json($task, 200);
    }

    public function add(Request $request)
    {
        $user = Auth::user();
        $task = Task::create([
            'units' => 1,
            'status_id' => 1,
            'created_by' => $user->id,
        ]);
        return response()->json($task, 200);
    }

    public function delete(Request $request, $id = NULL)
    {
        if (is_null($id)) return response()->json(['message' => 'Missing "id"'], 400);
        $task = Task::find($id);
        if (!isset($task->id)) return response()->json(['message' => 'Not found'], 404);
        if ($task->enabled === FALSE) return response()->json(['message' => 'Gone'], 410);
        $task->enabled = FALSE;
        $task->disabled_at = now();
        $task->save();
        return response()->json($task, 200);
    }

    public function archive(Request $request, $id = NULL)
    {
        if (is_null($id)) return response()->json(['message' => 'Missing "id"'], 400);
        $task = Task::find($id);
        if (!isset($task->id)) return response()->json(['message' => 'Not found'], 404);
        if ($task->archived === TRUE) {
            $task->archived = FALSE;
            $task->archived_at = NULL;
        } else {
            $task->archived = TRUE;
            $task->archived_at = now();
        }
        $task->save();
        return response()->json($task, 200);
    }

    public function update_delivery_date(Request $request, $id = NULL)
    {
        if (is_null($id)) return response()->json(['message' => 'Missing "id"'], 400);
        $task = Task::find($id);
        if (!isset($task->id)) return response()->json(['message' => 'Not found'], 404);
        if (!$request->filled('delivery_date')) return response()->json(['message' => 'Missing "delivery_date"'], 404);
        $delivery_date = explode('T', $request->delivery_date);
        $task->delivery_date = $delivery_date[0];
        $task->save();
        return response()->json($task, 200);
    }

    public function update_client(Request $request, $id = NULL)
    {
        if (is_null($id)) return response()->json(['message' => 'Missing "id"'], 400);
        $task = Task::find($id);
        if (!isset($task->id)) return response()->json(['message' => 'Not found'], 404);
        if (!$request->filled('client_id')) return response()->json(['message' => 'Missing "client_id"'], 404);
        $task->client_id = $request->client_id;
        $task->save();
        $task->client;
        return response()->json($task, 200);
    }

    public function update_units(Request $request, $id = NULL)
    {
        if (is_null($id)) return response()->json(['message' => 'Missing "id"'], 400);
        $task = Task::find($id);
        if (!isset($task->id)) return response()->json(['message' => 'Not found'], 404);
        if (!$request->filled('units')) return response()->json(['message' => 'Missing "units"'], 404);
        $task->units = $request->units;
        $task->save();
        return response()->json($task, 200);
    }

    public function update_title(Request $request, $id = NULL)
    {
        if (is_null($id)) return response()->json(['message' => 'Missing "id"'], 400);
        $task = Task::find($id);
        if (!isset($task->id)) return response()->json(['message' => 'Not found'], 404);
        if (!$request->filled('title')) return response()->json(['message' => 'Missing "title"'], 404);
        $task->title = $request->title;
        $task->save();
        return response()->json($task, 200);
    }

    public function update_status(Request $request, $id = NULL, $status_id = NULL)
    {
        if (is_null($id)) return response()->json(['message' => 'Missing "id"'], 400);
        if (is_null($status_id)) return response()->json(['message' => 'Missing "status_id"'], 400);
        $task = Task::find($id);
        if (!isset($task->id)) return response()->json(['message' => 'Not found'], 404);
        $task->status_id = intval($status_id);
        $task->save();

        return response()->json($task, 200);
    }

    public function read_statuses(Request $request)
    {
        $resources = TaskStatus::orderBy('id', 'ASC')->where('enabled', TRUE)->get();
        if (!count($resources)) return response()->json(['message' => 'No records'], 404);
        return response()->json($resources, 200);
    }
}
