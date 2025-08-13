import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import Rankings from '../pages/Rankings';
import Recommendations from '../pages/Recommendations';
import Articles from '../pages/Articles';
import IllustrationDetail from '../pages/IllustrationDetail';
import ArticleDetail from '../pages/ArticleDetail';

/**
 * 路由配置
 * 定义所有页面路由和布局结构
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Home />
      </Layout>
    ),
  },
  {
    path: '/rankings',
    element: (
      <Layout>
        <Rankings />
      </Layout>
    ),
  },
  {
    path: '/recommendations',
    element: (
      <Layout>
        <Recommendations />
      </Layout>
    ),
  },
  {
    path: '/articles',
    element: (
      <Layout>
        <Articles />
      </Layout>
    ),
  },
  {
    path: '/illustration/:id',
    element: (
      <Layout>
        <IllustrationDetail />
      </Layout>
    ),
  },
  {
    path: '/article/:id',
    element: (
      <Layout>
        <ArticleDetail />
      </Layout>
    ),
  },
]);

/**
 * 路由提供者组件
 */
const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;