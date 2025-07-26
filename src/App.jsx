import { useEffect } from 'react'
import './App.css'
import './User-View/Pages/Theme.css'
import AppRouter from './User-View/User-View-Routes/Router'
import { ThemeProvider } from './contexts/ThemeContext'
import { useAppDispatch, useAppSelector } from './store/hooks'
import { checkUserAsync, generateUserAsync } from './store/userSlice'

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
    </ThemeProvider>
  )
}

export default App
