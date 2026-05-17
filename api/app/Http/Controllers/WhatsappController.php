<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Template;
use Illuminate\Http\Request;

class WhatsappController extends Controller
{
    public function link(Request $request, Client $client)
    {
        $message = '';

        if ($request->has('template_id')) {
            $template = Template::findOrFail($request->template_id);
            $message = str_replace(
                ['{nombre}', '{negocio}'],
                [$client->name, auth()->user()->tenant->name],
                $template->body
            );
        }

        $phone = preg_replace('/[^0-9]/', '', $client->phone ?? '');
        $url = "https://wa.me/{$phone}?text=" . urlencode($message);

        return response()->json(['url' => $url]);
    }
}
