import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import { authorizeUser } from './services/services';
import Hamburger from './components/hamburger';
import { productPage } from './data/welcomeNav';
import { getGeocode, getLatLng } from "use-places-autocomplete";

import ProductPage from './pages/unauthorized/ProductPage';
import Unauthorized from './pages/page-templates/unauthorized';
import Login from './pages/unauthorized/Login';
import Signup from './pages/unauthorized/Signup';

import Authorized from "./pages/page-templates/authorized";
import Activity from './pages/authorized/Activity';
import Go from './pages/authorized/Go';
import AroundMe from './pages/authorized/AroundMe';
import Account from './pages/authorized/Account';


function App() {
  const [user, setUser] = useState(null)
  const [userCityCord, setUserCityCord] = useState(null)
  const navigate = useNavigate();

  useEffect(() => {
    authorizeUser().then(r => {
      if(r.status === 200) {
        setUser(r.data)

        async function getCords() {
          const results = await getGeocode({ address: r.data.city.name });
          const { lat, lng } = await getLatLng(results[0]);
          setUserCityCord({ lat, lng });
        }

        getCords()

      } else {
        navigate(productPage);
      }
    })
  }, [])

  console.log(userCityCord);

  function addActivity(newActivity) {
    setUser(user => ({...user, activities: [...user.activities, newActivity]}))
  }

  function addMessage(newMessage) {
    setUser(user => ({...user, activities: user.activities.map(activity => {
      if(activity.id === newMessage.activity_id) {
        return {...activity, messages: [...activity.messages, newMessage]}
      } else {
        return activity;
      }  
    })}))
  }

  function renderAuthorizedRoutes() {
    if(user) {
      return (
          <Route path="/" element={<Authorized />}>
            <Route path="" element={<Activity user={user} addMessage={addMessage} userCityCord={userCityCord}/>} />
            <Route path="/go" element={<Go user={user} userCityCord={userCityCord} />} />
            <Route path="/around-me" element={<AroundMe user={user} addActivity={addActivity} userCityCord={userCityCord} />} />
            <Route path="/account" element={<Account user={user} setUser={setUser} />} />
          </Route> 
      )
    }
  }


  return (
    <div className="App">
      <Hamburger />
      <div className="container">
        <Routes>
          <Route path="/home" element={<ProductPage />}></Route>
          
          <Route path="/welcome" element={<Unauthorized />}>
            <Route path="" element={<Login setUser={setUser} />} />
            <Route path="signup/*" element={<Signup setUser={setUser} />} />

          </Route>

          {renderAuthorizedRoutes()}


        </Routes>
      </div>
    </div>
  );
}

export default App;
