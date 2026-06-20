import React, { useEffect, useRef, useState } from 'react';
import './MapComponent.css';

const MapComponent = ({ spots, onSpotSelect, userLocation }) => {
  const mapRef = useRef(null);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    const initMap = () => {
      try {
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(37.4563, 126.7052), // Default to Incheon
          level: 5,
        };

        const kakaoMap = new window.kakao.maps.Map(container, options);
        setMap(kakaoMap);
      } catch (err) {
        setError(err.message);
      }
    };

    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(initMap);
      return;
    }

    const existingScript = document.getElementById('kakao-map-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'kakao-map-script';
      script.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=5ec321837459c1d7e624adf86af0603a&autoload=false&libraries=services,clusterer";
      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(initMap);
        } else {
          setError("카카오맵 API 객체를 찾을 수 없습니다. 도메인 설정이나 앱 키를 확인하세요.");
        }
      };
      script.onerror = () => setError("카카오맵 스크립트를 불러올 수 없습니다. 네트워크 문제나 카카오 개발자 콘솔의 도메인 설정을 확인하세요.");
      document.head.appendChild(script);
    } else {
      existingScript.addEventListener('load', () => window.kakao.maps.load(initMap));
      existingScript.addEventListener('error', () => setError("카카오맵 스크립트 로드 에러"));
    }
  }, []);

  // Update Markers when spots change
  useEffect(() => {
    if (!map || !window.kakao) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    spots.forEach(spot => {
      const position = new window.kakao.maps.LatLng(spot.lat, spot.lng);
      
      // Custom Marker Image (Optional, can just use default for now, but let's make it look better)
      const marker = new window.kakao.maps.Marker({
        position,
        title: spot.name,
      });

      marker.setMap(map);
      markersRef.current.push(marker);

      // Marker Click Event
      window.kakao.maps.event.addListener(marker, 'click', () => {
        onSpotSelect(spot);
        // Pan to marker smoothly
        map.panTo(position);
      });
    });
  }, [map, spots, onSpotSelect]);

  // Pan to user location when updated
  useEffect(() => {
    if (map && userLocation && window.kakao) {
      const locPosition = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
      
      // Remove existing user marker if any
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }

      // Create a custom overlay for the pulsating blue dot
      const content = document.createElement('div');
      content.className = 'user-location-marker';

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: locPosition,
        content: content,
        xAnchor: 0.5,
        yAnchor: 0.5
      });

      customOverlay.setMap(map);
      userMarkerRef.current = customOverlay;

      map.panTo(locPosition);
    }
  }, [map, userLocation]);

  return (
    <div className="map-container">
      {error && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
          backgroundColor: 'rgba(255, 50, 50, 0.9)', color: 'white', padding: '20px 30px', 
          borderRadius: '12px', zIndex: 100, textAlign: 'center', fontWeight: 'bold',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          🚨 에러 발생: {error}<br/>
          <span style={{fontSize: '13px', fontWeight: 'normal', display: 'block', marginTop: '10px'}}>
            카카오 디벨로퍼스(developers.kakao.com)의 내 애플리케이션 &gt; 플랫폼 &gt; Web 도메인에<br/>
            <code>http://localhost:5173</code>이(가) 등록되어 있는지 확인해주세요.
          </span>
        </div>
      )}
      <div id="map" ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default MapComponent;
