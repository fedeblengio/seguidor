<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'source' => 'nullable|in:whatsapp,instagram,web,otro',
            'status' => 'nullable|in:nuevo,contactado,presupuesto_enviado,seguimiento_pendiente,vendido,perdido',
            'assigned_to' => 'nullable|exists:users,id',
        ];
    }
}
