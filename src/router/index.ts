import { createRouter, createWebHistory } from "vue-router";

const Dashboard = () => import("../components/Dashboard.vue");
const TopCommandersPage = () => import("../components/TopCommandersPage.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: Dashboard,
    },
    {
      path: "/commander/:slug",
      name: "commander",
      component: Dashboard,
      props: true,
    },
    {
      path: "/top-commanders",
      name: "top-commanders",
      component: TopCommandersPage,
    },
    {
      path: "/:catchAll(.*)",
      redirect: "/",
    },
  ],
  scrollBehavior: () => ({ top: 0, left: 0 }),
});

export default router;
