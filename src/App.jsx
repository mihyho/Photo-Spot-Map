import { useState, useEffect } from 'react'
import MapComponent from './components/MapComponent'
import SpotDetails from './components/SpotDetails'
import AddSpotModal from './components/AddSpotModal'
import { FiPlus, FiNavigation } from 'react-icons/fi'
import './App.css'

function App() {
  const [spots, setSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch spots from backend
  const fetchSpots = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/spots');
      const data = await response.json();
      setSpots(data);
    } catch (error) {
      console.error("Error fetching spots:", error);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const handleSpotSelect = (spot) => {
    setSelectedSpot(spot);
  };

  const handleSaveSpot = async (spotData) => {
    try {
      const isEdit = !!editingSpot;
      const url = isEdit ? `http://localhost:8080/api/spots/${editingSpot.id}` : 'http://localhost:8080/api/spots';
      const method = isEdit ? 'PUT' : 'POST';

      /* 파일 업로드용 주석 처리
      const formDataToSend = new FormData();
      formDataToSend.append('name', spotData.name);
      formDataToSend.append('address', spotData.address);
      formDataToSend.append('type', spotData.type);
      formDataToSend.append('info', spotData.info);
      formDataToSend.append('gear', spotData.gear);
      formDataToSend.append('lat', spotData.lat);
      formDataToSend.append('lng', spotData.lng);
      
      if (spotData.imageFile) {
        formDataToSend.append('imageFile', spotData.imageFile);
      }
      */

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(spotData),
        // body: formDataToSend, // 파일 업로드용 주석 처리
      });
      if (response.ok) {
        setIsAddModalOpen(false);
        setEditingSpot(null);
        fetchSpots(); // Re-fetch to update map
        
        // 상세 패널이 열려있었고 수정한 항목이라면 상세 패널 데이터도 최신화
        if (isEdit && selectedSpot && selectedSpot.id === editingSpot.id) {
          const updatedSpot = { ...spotData, id: editingSpot.id };
          setSelectedSpot(updatedSpot);
        }
      }
    } catch (error) {
      console.error("Error adding spot:", error);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("위치 정보를 가져올 수 없습니다.");
        }
      );
    } else {
      alert("이 브라우저에서는 위치 정보가 지원되지 않습니다.");
    }
  };

  const filteredSpots = activeFilter === 'all' ? spots : spots.filter(spot => spot.type === activeFilter);

  return (
    <div className="app-container">
      {/* Filter Bar */}
      <div className="filter-bar glassmorphism">
        <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>전체보기</button>
        <button className={`filter-btn ${activeFilter === 'nature' ? 'active' : ''}`} onClick={() => setActiveFilter('nature')}>자연/풍경</button>
        <button className={`filter-btn ${activeFilter === 'cityscape' ? 'active' : ''}`} onClick={() => setActiveFilter('cityscape')}>도심/야경</button>
        <button className={`filter-btn ${activeFilter === 'cafe' ? 'active' : ''}`} onClick={() => setActiveFilter('cafe')}>카페/실내</button>
        <button className={`filter-btn ${activeFilter === 'other' ? 'active' : ''}`} onClick={() => setActiveFilter('other')}>기타</button>
      </div>

      {/* Main Map */}
      <MapComponent 
        spots={filteredSpots} 
        onSpotSelect={handleSpotSelect} 
        userLocation={userLocation}
      />

      {/* Side Panel for Details */}
      {selectedSpot && (
        <SpotDetails 
          spot={selectedSpot} 
          onClose={() => setSelectedSpot(null)} 
          onEditClick={(spot) => {
            setEditingSpot(spot);
            setIsAddModalOpen(true);
          }}
        />
      )}

      {/* Floating Action Buttons */}
      <div className="floating-actions">
        <button className="fab-btn glassmorphism location-btn" onClick={handleGetLocation} aria-label="내 위치 찾기">
          <FiNavigation size={24} />
        </button>
        <button className="fab-btn glassmorphism add-btn" onClick={() => setIsAddModalOpen(true)} aria-label="새 장소 추가">
          <FiPlus size={28} />
        </button>
      </div>

      {/* Add Spot Modal */}
      {isAddModalOpen && (
        <AddSpotModal 
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingSpot(null);
          }} 
          onSave={handleSaveSpot}
          centerLocation={userLocation}
          spotToEdit={editingSpot}
        />
      )}
    </div>
  );
}

export default App;
