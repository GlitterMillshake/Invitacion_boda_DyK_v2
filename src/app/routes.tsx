import { createBrowserRouter } from "react-router";

import { Layout } from "./components/Layout";
import { Home } from "./components/Home";
import { AdminLogin } from "../admin/AdminLogin";
import { AdminPanel } from "../admin/AdminPanel";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "*",
        Component: Home,
      },
    ],
  },

  // ==============================
  // ADMINISTRACIÓN
  // ==============================

  {
    path: "/admin/login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminPanel,
  },
]);