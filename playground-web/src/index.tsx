import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Playground } from './components/playground'
import { BASE_PATH } from './config/links'
import { Layout } from './components/shared/layout'

const router = createBrowserRouter([
  {
    path: BASE_PATH,
    element: <Playground />,
  },
])

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <Layout>
    <RouterProvider router={router} />
  </Layout>,
)
