import React from 'react';
import ReactDOM from 'react-dom/client';
import "bulma/css/bulma.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import App from './App';

import { UserProvider }  from "./context/UserContext";
import { DetailProvider } from './context/DetailContext';

const root =  ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserProvider>
    <DetailProvider>
      <App />
    </DetailProvider>
  </UserProvider>  
);

