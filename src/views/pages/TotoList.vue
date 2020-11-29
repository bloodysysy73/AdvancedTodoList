<template>
  <div class="content">
    <div class="md-layout">
      <div class="md-layout-item md-size-100" style="margin-top: 20px">
        <div class="action-button">
         <md-button class="md-tertiary" @click="showDrawerAddTask">
          <feather type="plus"></feather>Add a task
        </md-button>
          <md-button class="md-tertiary" @click="showFilters = true">
            <feather type="filter"></feather>Filter
          </md-button>
           </div>
        <md-tabs :md-active-tab="dynamic_tab">
          <template slot="md-tab" slot-scope="{ tab }">
            <feather class="md-tab-icon" :type="tab.icon"></feather>
            <span class="md-tab-label">{{ tab.label }}</span>
            <i class="badge" v-if="tab.data.badge">{{ tab.data.badge }}</i>
          </template>

          <md-tab
            id="tab-home"
            md-label="Tasks not finished"
            md-icon="activity"
            :md-template-data="{
              badge: this.$store.getters.getNumberActiveTask,
            }"
          >
            <simple-table
              :key="this.$store.getters.getRendAllListNumber"
              :todolist="this.$store.getters.getActiveTodoList"
              @editTaskEvent="showDrawerEditTask"
              @showReadOnlyTaskDrawer="showReadOnlyTaskDrawer"
            ></simple-table>
          </md-tab>
          <md-tab
            id="tab-pages"
            md-label="All tasks"
            md-icon="list"
            :md-template-data="{
              badge: this.$store.getters.getNumberTotalTask,
            }"
          >
            <simple-table
              :key="this.$store.getters.getRendAllListNumber"
              :todolist="this.$store.getters.getTodoList"
              @editTaskEvent="showDrawerEditTask"
              @showReadOnlyTaskDrawer="showReadOnlyTaskDrawer"
            ></simple-table>
          </md-tab>

          <!-- only when using filter -->
          <md-tab
            id="tab-posts"
            v-if="this.$store.getters.getNumberFilteredTask > 0"
            md-label="Filtered tasks"
            md-icon="filter"
            :md-template-data="{
              badge: this.$store.getters.getNumberFilteredTask,
            }"
          >
            <simple-table
              :key="this.$store.getters.getRendAllListNumber"
              :todolist="this.$store.getters.getFilteredTodoList"
            ></simple-table>
          </md-tab>
          <!-- end filter list -->
        </md-tabs>
      </div>

      <div class="legend-list">
         <legend-bullet :planning="true"></legend-bullet>
      </div>
      <div class="column">
         <colum-to-hide></colum-to-hide>
      </div>
      <!-- drawers -->

      <edit-task-drawer
        :isActive="showAddTask"
        @isActive="updateIsActiveAddTask"
        :key="this.$store.getters.getRendAllListNumber"
      ></edit-task-drawer>

      <filters-drawer
        :isActive="showFilters"
        @isActive="updateIsActive"
        @activeFilterTab="setDynamicTab"
      ></filters-drawer>

      <read-only-task-viewer
        :isActive="showReadTask"
        @isActive="updateIsActiveReadTask"
      ></read-only-task-viewer>

    </div>
    <div class="spinner-rotate" v-show="isLoading"></div>
  </div>
</template>

<script  lang="ts">
import SimpleTable from "@/components/tables/SimpleTable.vue";
import FiltersDrawer from "@/components/forms/FiltersDrawer.vue";
import EditTaskDrawer from "@/components/forms/EditTaskDrawer.vue";
import ReadOnlyTaskDrawer from "@/components/forms/ReadOnlyTaskDrawer.vue";
import LegendBulletVue from '@/components/menus/LegendBullet.vue';
import { bus } from '@/main';
import ColumToHideVue from '@/components/menus/ColumToHide.vue';

export default {
  name: "TotoList",
  components: {
    SimpleTable,
    "filters-drawer": FiltersDrawer,
    "edit-task-drawer": EditTaskDrawer,
    "read-only-task-viewer": ReadOnlyTaskDrawer,
    "legend-bullet": LegendBulletVue,
    "colum-to-hide": ColumToHideVue
  },
  data() {
    return {
      showFilters: false,
      showAddTask: false,
      currentStep: -1,
      stepClass: "step100",
      objectStep: 3,
      isLoading: true,
      showReadTask: false,
      dynamic_tab: "tab-home",
    };
  },
  created() {
    setTimeout(() => {
      this.isLoading = false;
    }, 0);
  },
   mounted (){
    bus.$on('openDrawerEdit', this.showDrawerEditTask);
  },
  methods: {
    setDynamicTab(tab: string) {
      this.dynamic_tab = tab;
    },
    showDrawerAddTask(): void {
      this.$store.commit("resetCurrentTodo");
      this.showAddTask = true;
    },
    showDrawerEditTask(payload): void {
      if (payload) {
        this.$store.commit("setCurrentTodo", payload.key);
        this.showAddTask = true;
      }
    },
    showReadOnlyTaskDrawer(payload): void {
      this.$store.commit("setCurrentTodo", payload.key);
      this.showReadTask = true;
    },
    updateIsActive(value) {
      this.showFilters = value;
    },
    updateIsActiveAddTask(value) {
      this.showAddTask = value;
    },
    updateIsActiveReadTask(value) {
      this.showReadTask = value;
    },
    stepClick(stepNb) {
      if (this.objectStep >= stepNb) {
        this.currentStep = stepNb;
        this.stepClass = stepNb == -1 ? "step100" : "step" + stepNb;
      }
    },
    isActive(stepNb) {
      return this.currentStep == stepNb;
    },
    isReached(stepNb) {
      return this.objectStep >= stepNb;
    },
  },
};
</script>
<style scoped>
.legend-list {
  display: inline-block;
  position: absolute;
  bottom: 200px;
  left: 50px;
}
.column {
  display: inline-block;
  position: absolute;
  bottom: 200px;
  left: 250px;
}
.action-button{
  text-align: right;
}
</style>