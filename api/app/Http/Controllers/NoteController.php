<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function store(Request $request, Client $client)
    {
        $request->validate(['body' => 'required|string']);

        $note = $client->notes()->create([
            'user_id' => auth()->id(),
            'body' => $request->body,
        ]);

        return response()->json(['data' => $note->load('user')], 201);
    }

    public function destroy(Note $note)
    {
        $note->delete();
        return response()->json(['message' => 'Nota eliminada']);
    }
}
