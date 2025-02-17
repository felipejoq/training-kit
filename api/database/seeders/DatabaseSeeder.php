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

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Role;
use App\Models\UserRole;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Cuenta Depuración',
            'email' => 'debug@eniwer.dev',
        ]);

        $user2 = User::factory()->create([
            'name' => 'Cuenta Depuración 2',
            'email' => 'debug2@eniwer.dev',
        ]);

        $roles = [
            [ 'name' => 'Operación', 'codename' => 'user', 'description' => 'Permite ingresar nueva información al sistema.' ],
            [ 'name' => 'Supervisión', 'codename' => 'super', 'description' => 'Permite ver toda la información ingresada al sistema.' ],
            [ 'name' => 'Administración', 'codename' => 'admin', 'description' => 'Permite gestionar usuarios y sus niveles de acceso.' ],
        ];
        foreach ($roles as $role) { Role::create($role); }

        foreach(Role::all() as $role) {
            UserRole::create([ 'role_id' => $role->id, 'user_id' => $user->id ]);
            UserRole::create([ 'role_id' => $role->id, 'user_id' => $user2->id ]);
        }
        
        $this->call([
            CommuneSeeder::class,
            FileExtensionSeeder::class,
            RegionSeeder::class,
            SettingSeeder::class,
            TaskSeeder::class
        ]);
        
        $this->call([ DemoSeeder::class ]);
    }
}
