import { useRef, useState, useEffect } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import sortPlacesByDistance from './loc.js';

function App() {
  const storesIDs = JSON.parse(localStorage.getItem("selectedPlaces")) || []
  const storedPlaces = storesIDs.map((id) => {
    return AVAILABLE_PLACES.find((place) => place.id === id);
  });


  const selectedPlace = useRef();
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);
  const [availablePlaces, setAvailablePlaces] = useState([])
  const [modalIsOpen, setIsOpen] = useState(false)



  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(AVAILABLE_PLACES, position.coords.latitude, position.coords.longitude)
      setAvailablePlaces(sortedPlaces)
    })
  }, [availablePlaces])



  function handleStartRemovePlace(id) {
    setIsOpen(true)
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setIsOpen(false)
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });
    const storesIDs = JSON.parse(localStorage.getItem("selectedPlaces")) || []
    if (storesIDs.indexOf(id) === -1) { localStorage.setItem("selectedPlaces", JSON.stringify([id, ...storesIDs])) }

  }

  function handleRemovePlace() {
    setPickedPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
    );
    setIsOpen(false)
    const storesIDs = JSON.parse(localStorage.getItem("selectedPlaces")) || []
    localStorage.setItem("selectedPlaces", JSON.stringify(storesIDs.filter((id) => { return id !== selectedPlace.current })))
  }

  return (
    <>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={AVAILABLE_PLACES}
          onSelectPlace={handleSelectPlace}
          fallbackText="Sorting places by distance.."
        />
      </main>
    </>
  );
}

export default App;