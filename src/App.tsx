import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Users from './components/Users';
import Settings from './components/Settings';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSignInPage from './components/Sign-up-page';
import { ProtectedRoutes } from './utiles/ProtectedRoutes';
import Patients from './components/Patients';
import Consultations from './components/Consultation';
import { Logout } from './utiles/Logout';
import Seances from './components/Seances';
import Medecins from './components/Medecins';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path='/login' element={<ThemeSignInPage />}/>
          <Route path='logout' element={<Logout/>}/>
          <Route element={<ProtectedRoutes/>}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="users" element={<Users />} />
              <Route path='patients' element={<Patients/>}/>
              <Route path="settings" element={<Settings />} />
              <Route path="consultation" element={<Consultations />} />
              <Route path="sceance" element={<Seances />} />
              <Route path="medecins" element={<Medecins />} />
              <Route path="help" element={<div style={{ padding: '24px' }}>Help Page Content</div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;