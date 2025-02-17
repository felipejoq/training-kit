<!--
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
-->
<script>
import DeleteTaskModal from '@/components/DeleteTaskModal.vue';
import ArchiveTaskModal from '@/components/ArchiveTaskModal.vue';
import AddClientModal from '@/components/AddClientModal.vue';
import { computed } from 'vue'
import { useStore } from 'vuex'
import { ref } from 'vue';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
export default {
	name: 'TasksView',
	data() {
		return {
			task: {
				client: {
					name: null,
				},
				title: {
					name: null,
				},
				units: null,
				delivery: null,
			},
			loaders: {
				title: {
					active: false,
					id: null,
					value: null,
					loading: false,
				},
				units: {
					active: false,
					id: null,
					value: null,
					loading: false,
				},
				client: {
					active: false,
					id: null,
					value: null,
					loading: false,
				},
				delivery_date: {
					active: false,
					id: null,
					value: null,
					loading: false,
				},
				status: {
					active: false,
					id: null,
					value: null,
					loading: false,
				},
			},
		}
	},
	components: {
		DeleteTaskModal,
		ArchiveTaskModal,
		AddClientModal,
		VueDatePicker,
	},
	setup () {
		const datepicker = ref<VueDatePicker>(null);
		const store = useStore()
		return {
			system: computed(() => store.getters.system),
			ui_theme: computed(() => store.getters.system.settings.ui.theme),
			session: computed(() => store.getters.session),
			modals: computed(() => store.getters.modals),
			tasks: computed(() => store.getters.tasks),
			users: computed(() => store.getters.users),
			clients: computed(() => store.getters.clients),
			archived: computed(() => store.getters.archived),
			sorted_tasks: computed(() => store.getters.sorted_tasks),
			add_task: () => store.dispatch('add_task'),
			browse_tasks: () => store.dispatch('tasks'),
			browse_users: () => store.dispatch('users'),
			browse_clients: () => store.dispatch('clients'),
			datepicker,
		}
	},
	created() {
		this.browse_tasks();
		this.browse_users();
		this.browse_clients();
	},
	mounted() {
	},
	unmounted() {
	},
	computed: {
		val_client() {
			return this.loaders.client.value == null ? null : this.loaders.client.value.length > 0 ? true : false;
		},
	},
	methods: {
		toggleArchived() {
			this.$store.commit('archived', !this.archived);
			this.browse_tasks();
		},
		enableDeliveryDatePicker(item) {
			this.loaders.delivery_date.id = item.id;
			this.loaders.delivery_date.value = item.delivery_date;
			this.loaders.delivery_date.active = true;
			setTimeout(() => {
				this.datepicker[0].openMenu();
			}, 10);
		},
		disableDeliveryDatePicker() {
			this.loaders.delivery_date.active = false;
			this.loaders.client.id = null;
			this.loaders.delivery_date.value = null;
		},
		openAddTaskModal() {
			this.add_task().then(() => this.browse_tasks());
		},
		openManageTaskModal() {
            this.modals.ManageTaskModal.show();
		},
		format(value) {
			const date = ref(new Date(value));
			let day = date.value.getDate();
			let month = date.value.getMonth() + 1;
			let year = date.value.getFullYear();
			if (day < 10) { day = `0${day}`; }
			if (month < 10) { month = `0${month}`; }
			return `${day}/${month}/${year}`;
		},
		enableClientSelector(item) {
			this.loaders.client.active = true;
			this.loaders.client.id = item.id;
		},
		disableClientSelector() {
			this.loaders.client.active = false;
			this.loaders.client.id = null;
			this.loaders.client.value = null;
		},
		updateClient() {
			this.loaders.client.loading = true;
			this.$store.dispatch('update_task_client', {
				task_id: this.loaders.client.id,
				client_id: this.loaders.client.value,
			})
			.then(response => {
				const i = this.tasks.items.findIndex(task => task.id == this.loaders.client.id);
				if (i != -1) {
					this.tasks.items[i].client_id = response.data.client_id
					this.tasks.items[i].client = response.data.client
				}
				this.loaders.client.loading = false;
				this.disableClientSelector();
			});
		},
		enableTitleSelector(item) {
			this.loaders.title.active = true;
			this.loaders.title.id = item.id;
			this.loaders.title.value = item.title;
		},
		disableTitleSelector() {
			this.loaders.title.active = false;
			this.loaders.title.id = null;
			this.loaders.title.value = null;
		},
		updateTitle() {
			this.loaders.title.loading = true;
			this.$store.dispatch('update_task_title', {
				task_id: this.loaders.title.id,
				title: this.loaders.title.value,
			})
			.then(response => {
				const i = this.tasks.items.findIndex(task => task.id == this.loaders.title.id);
				if (i != -1) {
					this.tasks.items[i].title = response.data.title
				}
				this.loaders.title.loading = false;
				this.disableTitleSelector();
			});
		},
		addUnit(item) {
			this.updateUnits(item, item.units + 1);
		},
		subUnit(item) {
			if (item.units <= 1) return false;
			this.updateUnits(item, item.units - 1);
		},
		updateUnits(item, units) {
			this.loaders.units.id = item.id;
			this.loaders.units.value = units;
			this.loaders.units.loading = true;
			this.$store.dispatch('update_task_units', {
				task_id: this.loaders.units.id,
				units: this.loaders.units.value,
			})
			.then(response => {
				const i = this.tasks.items.findIndex(task => task.id == item.id);
				if (i != -1) {
					this.tasks.items[i].units = response.data.units;
				}
				this.loaders.units.loading = false;
				this.loaders.units.id = null;
				this.loaders.units.value = null;
			});
		},
		updateStatus(item, status_id) {
			this.loaders.status.id = item.id;
			this.loaders.status.value = status_id;
			this.loaders.status.loading = true;
			this.$store.dispatch('update_task_status', {
				task_id: this.loaders.status.id,
				status_id: this.loaders.status.value,
			})
			.then(response => {
				const i = this.tasks.items.findIndex(task => task.id === item.id);
				if (i !== -1) {
					this.tasks.items[i].status_id = response.data.status_id;
				}
				this.loaders.status.loading = false;
				this.loaders.status.id = null;
				this.loaders.status.value = null;

        const socket = this.$store.getters.websocket.socket;
        socket.emit('task_update', response.data);
			});
		},
		updateDeliveryDate() {
			this.loaders.delivery_date.loading = true;
			this.$store.dispatch('update_task_delivery_date', {
				task_id: this.loaders.delivery_date.id,
				delivery_date: this.loaders.delivery_date.value,
			})
			.then(response => {
				const i = this.tasks.items.findIndex(task => task.id == this.loaders.delivery_date.id);
				if (i != -1) {
					this.tasks.items[i].delivery_date = response.data.delivery_date
					this.tasks.items[i].delivery = response.data.delivery
				}
				this.loaders.delivery_date.loading = false;
				this.disableDeliveryDatePicker();
			});
		},
		log: function(evt) {
			if (evt.added) {
				console.log(evt.added);
			} else if (evt.removed) {
				console.log(evt.removed);
			}
		},
		openDeleteTaskModal(task) {
			this.task = task;
            this.modals.DeleteTaskModal.show();
		},
		openArchiveTaskModal(task) {
			this.task = task;
            this.modals.ArchiveTaskModal.show();
		},
		openAddClientModal() {
			this.modals.AddClientModal.show();
		},
	}
}
</script>

<template>

	<DeleteTaskModal :task />
	<ArchiveTaskModal :task />
	<AddClientModal />

	<div class="container mt-5">

		<div id="tasks">

			<div class="card" :class="{ 'opacity-75' : tasks.loading }">
				<div class="card-body">
					<div class="row">
						<div class="col-auto">
							<button type="button" class="btn btn-primary" @click="openAddTaskModal()" :disabled="tasks.loading">
								<i class="fas fa-plus me-1"></i>
								<span>Tarea</span>
							</button>
						</div>
						<div class="col-auto">
							<button type="button" class="btn btn-primary" @click="openAddClientModal()" :disabled="tasks.loading">
								<i class="fas fa-plus me-1"></i>
								<span>Cliente</span>
							</button>
						</div>
						<div class="col-auto">
							<button type="button" class="btn btn-primary" @click="browse_tasks()" :disabled="tasks.loading">
								<i class="fas fa-redo me-1"></i>
								<span>Actualizar</span>
							</button>
						</div>
						<div class="col-auto">
							<button
								type="button" class="btn" @click="toggleArchived()" :disabled="tasks.loading"
								:class="{ 'btn-outline-primary' : !archived, 'btn-primary' : archived }"
							>
								<i class="fas fa-eye me-1" v-if="archived === true"></i>
								<i class="fas fa-eye me-1" v-else></i>
								<span>Ocultas</span>
							</button>
						</div>
					</div>
				</div>
				<table class="table table-hover mb-0">
					<thead class="border-top">
						<tr>
							<th style="width: 25%">Título</th>
							<th style="width: 10%">Horas</th>
							<th style="width: 15%">Cliente</th>
							<th style="width: 15%">Entrega</th>
							<th style="width: 15%">Estado</th>
							<th style="width: 10%"></th>
						</tr>			
					</thead>
					<tbody v-for="(item, index) in tasks.items" :key="index">
						<tr>

							<!-- TITULO -->
							<td>
								<div v-if="loaders.title.active == true && loaders.title.id == item.id" :class="{ 'opacity-50' : loaders.title.loading }">
									<input
										class="form-control form-control-sm"
										v-model="loaders.title.value"
										@change="updateTitle(item)"
										@blur="disableTitleSelector()"
									/>
								</div>
								<div v-else-if="item.title && item.title != null">
									<button
										class="btn btn-sm w-100 text-start"
										:class="{ 'btn-dark' : ui_theme === 'dark', 'btn-light' : ui_theme === 'light' }"
										@click="enableTitleSelector(item)"
									>
										<span>{{ item.title }}</span>
									</button>
								</div>
								<div v-else>
									<button
										class="btn btn-sm w-100 text-start"
										:class="{ 'btn-dark' : ui_theme === 'dark', 'btn-light' : ui_theme === 'light' }"
										@click="enableTitleSelector(item)"
									>
										<i class="fas fa-quote-left"></i>
									</button>
								</div>
							</td>

							<!-- UNIDADES -->
							<td>
								<div class="input-group" :class="{ 'opacity-50' : loaders.units.loading == true && loaders.units.id == item.id }">
									<button class="btn btn-outline-secondary btn-sm fs-075" @click="subUnit(item)" :disabled="item.units <= 1">
										<i class="fas fa-fw fa-minus"></i>
									</button>
									<input
										type="text"
										class="form-control text-center form-control-sm"
										:value="item.units"
										disabled
									>
									<button class="btn btn-outline-secondary btn-sm fs-075" @click="addUnit(item)">
										<i class="fas fa-fw fa-plus"></i>
									</button>
								</div>
							</td>

							<!-- CLIENTE -->
							<td>
								<div v-if="loaders.client.active == true && loaders.client.id == item.id" :class="{ 'opacity-50' : loaders.client.loading }">
									<select
										class="form-select form-select-sm"
										v-model="loaders.client.value"
										@change="updateClient(item)"
										@blur="disableClientSelector()"
									>
										<option :value="null" disabled selected>Seleccionar</option>
										<option v-for="(item, index) in clients.items" :key="index" :value="item.id">{{ item.name }}</option>
									</select>
								</div>
								<div v-else-if="item.client_id && item.client_id != null && item.client && item.client.id">
									<button
										class="btn btn-sm w-100 text-center"
										:class="{ 'btn-dark' : ui_theme === 'dark', 'btn-light' : ui_theme === 'light' }"
										@click="enableClientSelector(item)"
									>
										<span>{{ item.client.name }}</span>
									</button>
								</div>
								<div v-else>
									<button
										class="btn btn-sm w-100 text-center"
										:class="{ 'btn-dark' : ui_theme === 'dark', 'btn-light' : ui_theme === 'light' }"
										@click="enableClientSelector(item)"
									>
										<i class="fas fa-building"></i>
									</button>
								</div>
							</td>

							<!-- ENTREGA -->
							<td>
								<div v-if="loaders.delivery_date.active == true && loaders.delivery_date.id == item.id" :class="{ 'opacity-50' : loaders.delivery_date.loading }">
									<VueDatePicker
										v-model="loaders.delivery_date.value"
										:format="format"
										locale="es"
										cancelText="Cancelar"
										selectText="Seleccionar"
										:enableTimePicker="false"
										:dark="ui_theme === 'dark'"
										:clearable="false"
										:auto-apply="true"
										timezone="UTC"
										ref="datepicker"
										@update:model-value="updateDeliveryDate"
									></VueDatePicker>
								</div>
								<div v-else-if="item.delivery_date && item.delivery_date != null && item.delivery_date.length > 0">
									<button class="btn btn-sm w-100 text-start" :class="{ 'btn-dark' : ui_theme === 'dark', 'btn-light' : ui_theme === 'light' }" @click="enableDeliveryDatePicker(item)">
										<i class="fas fa-calendar ms-1 me-2"></i>
										<span>{{ item.delivery }}</span>
									</button>
								</div>
								<div v-else>
									<button class="btn btn-sm w-100 text-center" @click="enableDeliveryDatePicker(item)" :class="{ 'btn-dark' : ui_theme === 'dark', 'btn-light' : ui_theme === 'light' }">
										<i class="fas fa-calendar"></i>
									</button>
								</div>
							</td>

							<!-- ESTADO -->
							<td>
								<div class="dropdown" :class="{ 'opacity-50' : loaders.status.loading === true && loaders.status.id === item.id }">
									<button
										class="btn dropdown-toggle btn-sm w-100"
										type="button"
										data-bs-toggle="dropdown"
										aria-expanded="false"
										:class="{
											'btn-light' : item.status_id === 1,
											'btn-secondary' : item.status_id === 2,
											'btn-danger' : item.status_id === 3,
											'btn-warning' : item.status_id === 4,
											'btn-info' : item.status_id === 5,
											'btn-success' : item.status_id === 6,
											'btn-dark' : item.status_id === 7,
										}"
									>
										<span class="me-1" v-if="item.status_id === 1">Backlog</span>
										<span class="me-1" v-if="item.status_id === 2">Planificada</span>
										<span class="me-1" v-if="item.status_id === 3">En Curso</span>
										<span class="me-1" v-if="item.status_id === 4">Detenida</span>
										<span class="me-1" v-if="item.status_id === 5">En Revisión</span>
										<span class="me-1" v-if="item.status_id === 6">Completada</span>
										<span class="me-1" v-if="item.status_id === 7">Anulada</span>
									</button>
									<ul class="dropdown-menu">
										<li>
											<a class="dropdown-item" href="#" @click="updateStatus(item, 1)">
												<span>Backlog</span>
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#" @click="updateStatus(item, 2)">
												<span>Planificada</span>
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#" @click="updateStatus(item, 3)">
												<span>En Curso</span>
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#" @click="updateStatus(item, 4)">
												<span>Detenida</span>
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#" @click="updateStatus(item, 5)">
												<span>En Revisión</span>
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#" @click="updateStatus(item, 6)">
												<span>Completada</span>
											</a>
										</li>
										<li>
											<a class="dropdown-item" href="#" @click="updateStatus(item, 7)">
												<span>Anulada</span>
											</a>
										</li>
									</ul>
								</div>
							</td>

							<!-- ACCIONES -->
							<td>
								<div class="text-center">
									<button
										class="btn btn-sm me-2"
										:class="{ 'btn-light' : ui_theme =='light', 'btn-dark' : ui_theme =='dark' }"
										@click="openArchiveTaskModal(item)"
									>
										<i class="fas fa-eye" v-if="item.archived === true"></i>
										<i class="fas fa-eye-slash" v-else></i>
									</button>
									<button
										class="btn btn-sm"
										@click="openDeleteTaskModal(item)"
									>
										<i class="fas fa-trash-alt"></i>
									</button>
								</div>
							</td>

						</tr>
					</tbody>
				</table>
				<div class="card-footer border-top-0">
					<p class="mb-0 fs-08 text-muted">{{ tasks.items.length }} tarea<span v-if="tasks.items.length>1">s</span></p>
				</div>
			</div>

		</div>

	</div>
</template>

<style>
.dp__theme_dark {
    --dp-background-color: #212121;
    --dp-text-color: #fff;
    --dp-hover-color: #484848;
    --dp-hover-text-color: #fff;
    --dp-hover-icon-color: #959595;
    --dp-primary-color: #2e2e99;
    --dp-primary-disabled-color: #61a8ea;
    --dp-primary-text-color: #fff;
    --dp-secondary-color: #a9a9a9;
    --dp-border-color: #2d2d2d;
    --dp-menu-border-color: #2d2d2d;
    --dp-border-color-hover: #aaaeb7;
    --dp-border-color-focus: #aaaeb7;
    --dp-disabled-color: #737373;
    --dp-disabled-color-text: #d0d0d0;
    --dp-scroll-bar-background: #212121;
    --dp-scroll-bar-color: #484848;
    --dp-success-color: #00701a;
    --dp-success-color-disabled: #428f59;
    --dp-icon-color: #959595;
    --dp-danger-color: #e53935;
    --dp-marker-color: #e53935;
    --dp-tooltip-color: #3e3e3e;
    --dp-highlight-color: rgb(0 92 178 / 20%);
    --dp-range-between-dates-background-color: var(--dp-hover-color, #484848);
    --dp-range-between-dates-text-color: var(--dp-hover-text-color, #fff);
    --dp-range-between-border-color: var(--dp-hover-color, #fff);
}

.dp__theme_light {
    --dp-background-color: #fff;
    --dp-text-color: #212121;
    --dp-hover-color: #f3f3f3;
    --dp-hover-text-color: #212121;
    --dp-hover-icon-color: #959595;
    --dp-primary-color: #2e2e99;
    --dp-primary-disabled-color: #6bacea;
    --dp-primary-text-color: #f8f5f5;
    --dp-secondary-color: #c0c4cc;
    --dp-border-color: #ddd;
    --dp-menu-border-color: #ddd;
    --dp-border-color-hover: #aaaeb7;
    --dp-border-color-focus: #aaaeb7;
    --dp-disabled-color: #f6f6f6;
    --dp-scroll-bar-background: #f3f3f3;
    --dp-scroll-bar-color: #959595;
    --dp-success-color: #76d275;
    --dp-success-color-disabled: #a3d9b1;
    --dp-icon-color: #959595;
    --dp-danger-color: #ff6f60;
    --dp-marker-color: #ff6f60;
    --dp-tooltip-color: #fafafa;
    --dp-disabled-color-text: #8e8e8e;
    --dp-highlight-color: rgb(25 118 210 / 10%);
    --dp-range-between-dates-background-color: var(--dp-hover-color, #f3f3f3);
    --dp-range-between-dates-text-color: var(--dp-hover-text-color, #212121);
    --dp-range-between-border-color: var(--dp-hover-color, #f3f3f3);
}

:root {
    /*General*/
    --dp-border-radius: 4px; /*Configurable border-radius*/
    --dp-cell-border-radius: 4px; /*Specific border radius for the calendar cell*/
    --dp-common-transition: all 0.1s ease-in; /*Generic transition applied on buttons and calendar cells*/

    /*Sizing*/
    --dp-button-height: 35px; /*Size for buttons in overlays*/
    --dp-month-year-row-height: 35px; /*Height of the month-year select row*/
    --dp-month-year-row-button-size: 35px; /*Specific height for the next/previous buttons*/
    --dp-button-icon-height: 20px; /*Icon sizing in buttons*/
    --dp-cell-size: 35px; /*Width and height of calendar cell*/
    --dp-cell-padding: 5px; /*Padding in the cell*/
    --dp-common-padding: 10px; /*Common padding used*/
    --dp-input-icon-padding: 35px; /*Padding on the left side of the input if icon is present*/
    --dp-input-padding: 3px 30px 2px 12px; /*Padding in the input*/
    --dp-menu-min-width: 260px; /*Adjust the min width of the menu*/
    --dp-action-buttons-padding: 2px 5px; /*Adjust padding for the action buttons in action row*/
    --dp-row-margin:  5px 0; /*Adjust the spacing between rows in the calendar*/
    --dp-calendar-header-cell-padding:  0.5rem; /*Adjust padding in calendar header cells*/
    --dp-two-calendars-spacing:  10px; /*Space between multiple calendars*/
    --dp-overlay-col-padding:  3px; /*Padding in the overlay column*/
    --dp-time-inc-dec-button-size:  32px; /*Sizing for arrow buttons in the time picker*/
    --dp-menu-padding: 6px 8px; /*Menu padding*/
    
    /*Font sizes*/
    --dp-font-size: 1rem; /*Default font-size*/
    --dp-preview-font-size: 0.8rem; /*Font size of the date preview in the action row*/
    --dp-time-font-size: 0.8rem; /*Font size in the time picker*/
    
    /*Transitions*/
    --dp-animation-duration: 0.1s; /*Transition duration*/
    --dp-menu-appear-transition-timing: cubic-bezier(.4, 0, 1, 1); /*Timing on menu appear animation*/
    --dp-transition-timing: ease-out; /*Timing on slide animations*/
}
</style>
