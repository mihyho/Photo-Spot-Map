import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import './AddSpotModal.css';

const AddSpotModal = ({ onClose, onSave, centerLocation, spotToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    detailAddress: '',
    type: 'nature',
    info: '',
    gear: '',
    lat: centerLocation ? centerLocation.lat : 37.4563,
    lng: centerLocation ? centerLocation.lng : 126.7052,
    image: '',
    // imageFile: null // 파일 업로드용 주석 처리
  });

  useEffect(() => {
    if (spotToEdit) {
      setFormData({
        name: spotToEdit.name || '',
        address: spotToEdit.address || '',
        detailAddress: '', // 기존 주소에서 상세주소 분리는 복잡하므로 비워둠
        type: spotToEdit.type || 'nature',
        info: spotToEdit.info || '',
        gear: spotToEdit.gear || '',
        lat: spotToEdit.lat,
        lng: spotToEdit.lng,
        image: spotToEdit.image || ''
      });
    }
  }, [spotToEdit]);

  const openDaumPostcode = useDaumPostcodePopup();

  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') {
        extraAddress += data.bname;
      }
      if (data.buildingName !== '') {
        extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
      }
      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
    }

    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(data.address, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setFormData(prev => ({
            ...prev,
            address: fullAddress,
            lat: parseFloat(result[0].y),
            lng: parseFloat(result[0].x)
          }));
        } else {
          setFormData(prev => ({ ...prev, address: fullAddress }));
        }
      });
    } else {
      setFormData(prev => ({ ...prev, address: fullAddress }));
    }
  };

  const handleClickSearch = () => {
    openDaumPostcode({ onComplete: handleComplete });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* 파일 업로드용 주석 처리
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, imageFile: e.target.files[0] }));
  };
  */

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAddress = formData.detailAddress ? `${formData.address} ${formData.detailAddress}` : formData.address;
    onSave({ ...formData, address: finalAddress });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glassmorphism">
        <div className="modal-header">
          <h2>{spotToEdit ? '사진스팟 정보 수정' : '새로운 사진스팟 추가'}</h2>
          <button className="close-modal-btn" onClick={onClose}><FiX size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="add-spot-form">
          <div className="form-group">
            <label>장소명</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="예: 한강 공원 노을 스팟" />
          </div>

          <div className="form-group">
            <label>주소</label>
            <div className="address-input-group">
              <input type="text" name="address" value={formData.address} readOnly required placeholder="우측 주소 검색 버튼을 눌러주세요" />
              <button type="button" className="search-address-btn" onClick={handleClickSearch}>주소 검색</button>
            </div>
            <input type="text" name="detailAddress" value={formData.detailAddress} onChange={handleChange} placeholder="상세 주소를 입력하세요 (선택)" />
          </div>

          <div className="form-group row">
            <div className="col">
              <label>유형</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="nature">자연/풍경</option>
                <option value="cityscape">도심/야경</option>
                <option value="cafe">카페/실내</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>장소 설명 및 촬영 팁</label>
            <textarea name="info" value={formData.info} onChange={handleChange} required placeholder="이곳에서 어떤 멋진 사진을 남길 수 있나요? 추천 시간대나 팁을 적어주세요!" rows="3" />
          </div>

          <div className="form-group">
            <label>추천 세팅 (선택)</label>
            <input type="text" name="gear" value={formData.gear} onChange={handleChange} placeholder="예: 광각 렌즈, 삼각대 필수" />
          </div>

          <div className="form-group">
            <label>대표 이미지 URL (선택)</label>
            <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
            {/* 파일 업로드용 주석 처리
            <label>대표 이미지 파일 (선택)</label>
            <input type="file" name="imageFile" accept="image/*" onChange={handleFileChange} />
            */}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="btn-primary">{spotToEdit ? '수정 반영하기' : '스팟 등록하기'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpotModal;
