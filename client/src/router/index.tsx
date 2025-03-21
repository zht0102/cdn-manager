import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import Home from '@/pages/Home';
import Resources from '@/pages/Resources';
import Trash from '@/pages/Trash';
import Settings from '@/pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'resources',
        element: <Resources />
      },
      {
        path: 'trash',
        element: <Trash />
      },
      {
        path: 'settings',
        element: <Settings />
      }
    ]
  }
]);

export default router;
