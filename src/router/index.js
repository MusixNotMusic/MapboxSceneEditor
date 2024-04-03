import { createRouter, createWebHashHistory } from "vue-router";

const routes= [
  { path: "/", redirect: "/index" },
  {
    path: "/index",
    name: "index",
    redirect: "/Editor",
    component: () => import("../components/Index.vue"),
    children: [
      {
        path: "/Editor",
        name: "Editor",
        component: () => import("../components/Editor/index.vue"),
      }
    ],
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  linkActiveClass: "active",
});

export default router;
