import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
