import { lazy, Suspense } from "react";
import { ErrorPage } from "../error/Error404";
import Layout from "../layout/Layout.jsx";
import withSuspense from "../component/suspense/Suspense.jsx";
import PrivateRoute from "./privateRoute.jsx";
import FactoryDepartmentRoute from "../features/factory_departments/routes/FactoryDeparmentsRoute.jsx";
import UserRoute from "../features/users/routes/UserRoute.jsx";
import UserPermissionRoute from "../features/users_permission/routes/UserPermissionRoute.jsx";
import FactoryRoute from "../features/factory/routes/FactoryRoute.jsx";
import ProgramRoute from "../features/programs/routes/ProgramRoute.jsx";
import { Navigate } from "react-router-dom";
import ProgramFieldTitleRoute from "../features/program_field_title/routes/ProgramFieldTitleRoute.jsx";
import LoginAdmin from "../Page/Auth/Login/LoginAdmin.jsx";
import useAuth from "../hooks/useAuth.js";
import BasicDataRoute from "../features/basic_data/routes/BasicDataRoute.jsx";
import AcImpMaterialTrackingRoute from "../features/ac_imp_material_tracking/routes/AcImpMaterialTrackingRoute.jsx";
import AcItemMRoute from "../features/bom_1/routes/AcItemMRoute.jsx";
import AcBomMRoute from "../features/bom_3/routes/AcBomMRoute.jsx";
import AcShoeMRoute from "../features/bom_2/routes/BasicDataRoute.jsx";
import ViewAcShoeBomRoute from "../features/actf_021/routes/ViewAcShoeBomRoute.jsx";
import Actf410Route from "../features/actf_410/routes/Actf410Route.jsx";
import AcReqM from "../Dashboard/actf_410_1/AcReqM.jsx";
import AcReqMRoute from "../features/actf_410_1/routes/AcReqMRoute.jsx";
import AcSrcorderMRoute from "../features/actf_410_2/routes/AcItemMRoute.jsx";
import Actf110Route from "../features/actf_110/routes/Actf110Route.jsx";
import Actf1102Route from "../features/actf_1102/routes/Actf1102Route.jsx";
import Actf1103Route from "../features/actf_1103/routes/Actf1103Route.jsx";
import Actf1101Route from "../features/actf_1101/routes/Actf1101Route.jsx";
import Actf130Route from "../features/actf_130/routes/Actf130Route.jsx";
import Actf210Route from "../features/actf_210/routes/Actf210Route.jsx";
import Actf220Route from "../features/actf_220/routes/Actf220Route.jsx";
import Actf290 from "../Dashboard/actf_290/Actf290.jsx";
import Actf290Route from "../features/actf_290/routes/Actf290Route.jsx";
import Setf570Route from "../features/setf_570/routes/Setf570Route.jsx";
import Setf560Route from "../features/setf_560/routes/Setf570Route.jsx";
import Actf120Route from "../features/actf_120/routes/Actf120Route.jsx";
import Actf1201Route from "../features/actf_120_1/routes/Actf1201Route.jsx";
import Setf120Route from "../features/setf_120/routes/Setf570Route.jsx";
import Actf230Route from "../features/actf_230/routes/Actf230Route.jsx";
import Setf590Route from "../features/setf_590/routes/Setf590Route.jsx";
import Setf5901 from "../Dashboard/setf_590_1/Setf5901.jsx";
import Setf5901Route from "../features/setf_590_1/routes/Setf5901Route.jsx";
import Actf240Route from "../features/actf_240/routes/Actf240Route.jsx";
import Actf310Route from "../features/actf_310/routes/Actf310Route.jsx";
import Actf3101Route from "../features/actf_310_1/routes/Actf3101Route.jsx";
import Setf510Route from "../features/setf_510/routes/Setf510Route.jsx";
import Actf270Route from "../features/actf_270/routes/Actf270Route.jsx";
import Actf022Route from "../features/actf_022/routes/Actf022Route.jsx";

const Login = withSuspense(lazy(() => import("../Page/Auth/Login/Login.jsx")));
const Register = withSuspense(
  lazy(() => import("../Page/Auth/Register/Register.jsx")),
);

const DynamicDefaultRoute = () => {
  const { getDefaultRoute } = useAuth();
  return <Navigate to={getDefaultRoute()} replace />;
};

const routes = [
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin-login",
    element: <LoginAdmin />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "user",
        element: <PrivateRoute requiredProgram="USER" />,
        children: UserRoute,
      },
      {
        path: "actf_250",
        element: <PrivateRoute requiredProgram="ACTF_250" />,
        children: AcImpMaterialTrackingRoute,
      },
      {
        path: "actf_020",
        element: <PrivateRoute requiredProgram="ACTF_020" />,
        children: AcItemMRoute,
      },
      {
        path: "actf_020_1",
        element: <PrivateRoute requiredProgram="ACTF_0201" />,
        children: AcShoeMRoute,
      },
      {
        path: "actf_020_2",
        element: <PrivateRoute requiredProgram="ACTF_0202" />,
        children: AcBomMRoute,
      },
      {
        path: "actf_021",
        element: <PrivateRoute requiredProgram="ACTF_021" />,
        children: ViewAcShoeBomRoute,
      },
      {
        path: "actf_410",
        element: <PrivateRoute requiredProgram="ACTF_410" />,
        children: Actf410Route,
      },
      {
        path: "actf_410_1",
        element: <PrivateRoute requiredProgram="ACTF_410" />,
        children: AcReqMRoute,
      },
      {
        path: "actf_410_2",
        element: <PrivateRoute requiredProgram="ACTF_4102" />,
        children: AcSrcorderMRoute,
      },
      {
        path: "actf_110",
        element: <PrivateRoute requiredProgram="ACTF_110" />,
        children: Actf110Route,
      },
      {
        path: "actf_130",
        element: <PrivateRoute requiredProgram="ACTF_130" />,
        children: Actf130Route,
      },
      {
        path: "actf_210",
        element: <PrivateRoute requiredProgram="ACTF_210" />,
        children: Actf210Route,
      },
      {
        path: "actf_220",
        element: <PrivateRoute requiredProgram="ACTF_220" />,
        children: Actf220Route,
      },
      {
        path: "actf_230",
        element: <PrivateRoute requiredProgram="ACTF_230" />,
        children: Actf230Route,
      },
      {
        path: "actf_290",
        element: <PrivateRoute requiredProgram="ACTF_290" />,
        children: Actf290Route,
      },
      {
        path: "setf_570",
        element: <PrivateRoute requiredProgram="SETF_570" />,
        children: Setf570Route,
      },
      {
        path: "setf_590",
        element: <PrivateRoute requiredProgram="SETF_590" />,
        children: Setf590Route,
      },
      {
        path: "setf_590_1",
        element: <PrivateRoute requiredProgram="SETF_5901" />,
        children: Setf5901Route,
      },
      {
        path: "setf_560",
        element: <PrivateRoute requiredProgram="SETF_560" />,
        children: Setf560Route,
      },
      {
        path: "setf_120",
        element: <PrivateRoute requiredProgram="SETF_120" />,
        children: Setf120Route,
      },
      {
        path: "actf_120",
        element: <PrivateRoute requiredProgram="ACTF_120" />,
        children: Actf120Route,
      },
      {
        path: "actf_120_1",
        element: <PrivateRoute requiredProgram="ACTF_1201" />,
        children: Actf1201Route,
      },
      {
        path: "actf_240",
        element: <PrivateRoute requiredProgram="ACTF_240" />,
        children: Actf240Route,
      },
      {
        path: "actf_310",
        element: <PrivateRoute requiredProgram="ACTF_310" />,
        children: Actf310Route,
      },
      {
        path: "actf_310_1",
        element: <PrivateRoute requiredProgram="ACTF_3101" />,
        children: Actf3101Route,
      },
      {
        path: "setf_510",
        element: <PrivateRoute requiredProgram="SETF_510" />,
        children: Setf510Route,
      },
      {
        path: "actf_270",
        element: <PrivateRoute requiredProgram="ACTF_270" />,
        children: Actf270Route,
      },
       {
        path: "actf_022",
        element: <PrivateRoute requiredProgram="ACTF_022" />,
        children: Actf022Route,
      },
      {
        path: "basic_data",
        element: <PrivateRoute requiredProgram="BASIC_DATA" />,
        children: BasicDataRoute,
      },
      {
        path: "permission",
        element: <PrivateRoute requiredProgram="USER_PERMISSION" />,
        children: UserPermissionRoute,
      },
      {
        path: "factory",
        element: <PrivateRoute requiredProgram="FACTORY" />,
        children: FactoryRoute,
      },
      {
        path: "departments",
        element: <PrivateRoute requiredProgram="DEPARTMENTS" />,
        children: FactoryDepartmentRoute,
      },
      {
        path: "program",
        element: <PrivateRoute requiredProgram="PROGRAM" />,
        children: ProgramRoute,
      },
      {
        path: "language",
        element: <PrivateRoute requiredProgram="PROGRAM_FIELD_TITLE" />,
        children: ProgramFieldTitleRoute,
      },

      { index: true, element: <DynamicDefaultRoute /> },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
];

export default routes;
