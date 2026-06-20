import React from 'react';
import { FiMapPin, FiClock, FiCamera, FiX } from 'react-icons/fi';
import './SpotDetails.css';

const SpotDetails = ({ spot, onClose, onEditClick }) => {
  if (!spot) return null;

  return (
    <div className="spot-details-panel open">
      <button className="close-btn" onClick={onClose} aria-label="Close">
        <FiX size={24} />
      </button>
      
      {spot.image && (
        <div className="spot-image-container">
          <img src={spot.image} alt={spot.name} className="spot-image" />
        </div>
      )}
      
      <div className="spot-content">
        <div className="spot-header">
          <span className={`spot-badge type-${spot.type}`}>
            {spot.type === 'nature' ? '자연/풍경' : spot.type === 'cityscape' ? '도심/야경' : spot.type === 'cafe' ? '카페/실내' : '기타'}
          </span>
          <h2 className="spot-title">{spot.name}</h2>
        </div>

        <div className="spot-info-section">
          {spot.address && (
            <div className="info-item">
              <FiMapPin className="info-icon" />
              <p><strong>주소:</strong> {spot.address}</p>
            </div>
          )}
          <div className="info-item">
            <FiMapPin className="info-icon" />
            <p>{spot.info}</p>
          </div>
          {spot.gear && (
            <div className="info-item">
              <FiCamera className="info-icon" />
              <p><strong>추천 세팅:</strong> {spot.gear}</p>
            </div>
          )}
        </div>

        <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
          <button 
            className="action-btn"
            style={{flex: 1, background: 'rgba(255,255,255,0.1)', color: '#fff'}}
            onClick={() => onEditClick(spot)}
          >
            장소 정보 수정
          </button>
          <button 
            className="action-btn"
            style={{flex: 1}}
            onClick={() => window.open(`https://map.kakao.com/link/search/${spot.name}`, '_blank')}
          >
            카카오맵에서 찾기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpotDetails;
