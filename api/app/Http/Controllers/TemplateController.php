<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Template::all()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $template = Template::create($request->only('name', 'body'));
        return response()->json(['data' => $template], 201);
    }

    public function update(Request $request, Template $template)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'body' => 'sometimes|string',
        ]);

        $template->update($request->only('name', 'body'));
        return response()->json(['data' => $template]);
    }

    public function destroy(Template $template)
    {
        $template->delete();
        return response()->json(['message' => 'Plantilla eliminada']);
    }
}
