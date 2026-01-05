import './assets/styles/main.scss';
import './App.scss';
import { BrowserRouter as Router, Routes } from 'react-router-dom';
import { AppProviders } from './contexts/AppProviders';
import AppRoutes from './routes';

function App() {
  return (
    <Router>
        <AppProviders>
            <AppRoutes/>
        </AppProviders>
    </Router>
  );
}

export default App;
