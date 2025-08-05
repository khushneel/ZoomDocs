import { useEffect } from 'react'
import './App.css'
import './User-View/Pages/Theme.css'
import AppRouter from './User-View/User-View-Routes/Router'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { checkUserAsync, generateUserAsync } from './store/userSlice'
import { Toaster } from 'react-hot-toast'

function App() {
  const dispatch = useAppDispatch();
  const { isLoading, error, isInitialized, zoomdocs_auth_id, zoomdocs_user_id } = useAppSelector((state) => state.user);

  useEffect(() => {
    // Only run if not already initialized
    if (!isInitialized) {
      // Check if both IDs exist in localStorage/state
      if (zoomdocs_auth_id && zoomdocs_user_id) {
        // Call check user API if both IDs exist
        dispatch(checkUserAsync({ 
          zoomdocs_auth_id, 
          zoomdocs_user_id 
        }));
      } else {
        // Generate new user if no existing data
        dispatch(generateUserAsync());
      }
    }
  }, [dispatch, isInitialized, zoomdocs_auth_id, zoomdocs_user_id]);

  // Optional: You can add loading state or error handling here
  if (isLoading) {
    console.log('Processing user authentication...');
  }

  if (error) {
    console.error('User authentication error:', error);
  }

  return (
    <ThemeProvider>
      <AppRouter/>
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Define default options
          className: '',
          duration: 4000,
          style: {
            background: 'var(--bg-glass)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-glass)',
          },
          // Default options for specific types
          success: {
            duration: 3000,
            style: {
              border: '1px solid #10b981',
              background: 'rgba(16, 185, 129, 0.1)',
            },
          },
          error: {
            duration: 5000,
            style: {
              border: '1px solid #ef4444',
              background: 'rgba(239, 68, 68, 0.1)',
            },
          },
        }}
      />
    </ThemeProvider>
  )
}

export default App
