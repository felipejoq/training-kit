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

export default {
	access_token(state, data) {
		state.session.api.loading = false;
		state.session.api.active = true;
		state.session.api.access_token = data;
		localStorage.setItem('access_token', data);
	},
	save_websocket_token(state, payload) {
		state.session.websocket.token = payload.token;
	},
	save_socket(state, payload) {
		state.session.websocket.socket = payload.socket;
	},
	refresh_token(state, data) {
		state.session.api.loading = false;
		state.session.api.active = true;
		state.session.api.refresh_token = data;
		localStorage.setItem('refresh_token', data);
	},
	clear_session(state) {
		state.session.api.access_token = null;
		localStorage.removeItem('access_token');
		state.session.api.refresh_token = null;
		localStorage.removeItem('refresh_token');
		state.session.websocket.token = null;
		localStorage.removeItem('websocket_token');
		state.session.api.active = false;
		state.session.websocket.socket.close();
	},
	clear_login(state) {
		state.session.credentials.username = null;
		state.session.credentials.password = null;
	},
	user(state, data) {
		state.session.api.loading = false;
		state.session.user.loading = false;
		state.session.user.id = data.id;
		state.session.user.name = data.name;
		state.session.user.email = data.email;
	},
	screen(state, data) {
		state.system.settings.screen.width = data.width;
		state.system.settings.screen.height = data.height;
	},
	archived(state, data) {
		state.archived = data
	},
	users(state, data) {
		state.users.loading = false;
		state.users.items = data;
	},
	settings(state, data) {
		state.settings.loading = false;
		state.settings.items = data;
	},
	user_logs(state, data) {
		state.user_logs.loading = false;
		state.user_logs.items = data;
	},
	user_roles(state, data) {
		state.modals.user_roles.loading = false;
		state.modals.user_roles.items.user = data.user;
		state.modals.user_roles.items.super = data.super;
		state.modals.user_roles.items.admin = data.admin;
	},
	clear_user_roles(state) {
		state.modals.user_roles.items.user = null;
		state.modals.user_roles.items.super = null;
		state.modals.user_roles.items.admin = null;
	},
	tasks(state, data) {
		state.tasks.loading = false;
		state.tasks.items = data;
	},
	clients(state, data) {
		state.clients.loading = false;
		state.clients.items = data;
	},
	AddUserModal(state, data) {
		state.modals.AddUserModal = data
	},
	BlockUserModal(state, data) {
		state.modals.BlockUserModal = data
	},
	ChangeUserPasswordModal(state, data) {
		state.modals.ChangeUserPasswordModal = data
	},
	ChangeUserRoleModal(state, data) {
		state.modals.ChangeUserRoleModal = data
	},
	DeleteUserModal(state, data) {
		state.modals.DeleteUserModal = data
	},
	UnblockUserModal(state, data) {
		state.modals.UnblockUserModal = data
	},
	AddTaskModal(state, data) {
		state.modals.AddTaskModal = data
	},
	DeleteTaskModal(state, data) {
		state.modals.DeleteTaskModal = data
	},
	ArchiveTaskModal(state, data) {
		state.modals.ArchiveTaskModal = data
	},
	AddClientModal(state, data) {
		state.modals.AddClientModal = data
	},
	update_task(state, task) {
		const index = state.tasks.items.findIndex(t => t.id === task.id);
		if (index !== -1) {
			state.tasks.items.splice(index, 1, task);
		} else {
			state.tasks.items.push(task);
		}
	}
}