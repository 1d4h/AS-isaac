
import React, { useEffect, useRef, useState } from 'react';
import { CustomerData } from '../types';

interface MapDisplayProps {
  customers: CustomerData[];
  selectedCustomer?: CustomerData | null;
}

declare global {
  interface Window {
    naver: any;
  }
}

const MapDisplay: React.FC<MapDisplayProps> = ({ customers, selectedCustomer }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    const checkApi = () => {
      if (window.naver && window.naver.maps) {
        setIsApiLoaded(true);
      } else {
        // 스크립트 로딩 대기 (재시도)
        setTimeout(checkApi, 500);
      }
    };
    checkApi();
  }, []);

  useEffect(() => {
    if (!isApiLoaded || !mapRef.current || mapInstance.current) return;

    const mapOptions = {
      center: new window.naver.maps.LatLng(37.5665, 126.9780),
      zoom: 13,
      minZoom: 7,
      zoomControl: true,
      zoomControlOptions: {
        position: window.naver.maps.Position.TOP_RIGHT
      },
      mapTypeControl: true
    };

    mapInstance.current = new window.naver.maps.Map(mapRef.current, mapOptions);
    infoWindowRef.current = new window.naver.maps.InfoWindow({
      content: '',
      borderWidth: 0,
      backgroundColor: "transparent",
      disableAnchor: true
    });
  }, [isApiLoaded]);

  useEffect(() => {
    if (!mapInstance.current) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    customers.forEach(customer => {
      if (!customer.lat || !customer.lng) return;

      const position = new window.naver.maps.LatLng(customer.lat, customer.lng);
      const marker = new window.naver.maps.Marker({
        position,
        map: mapInstance.current,
        title: customer.name,
        animation: window.naver.maps.Animation.DROP,
        icon: {
          content: `
            <div style="cursor:pointer; display: flex; flex-direction: column; align-items: center;">
              <div style="background-color: ${customer.status === 'completed' ? '#10b981' : '#6366f1'}; padding: 6px 12px; border-radius: 20px; color: white; font-weight: bold; font-size: 11px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 2px solid white; white-space: nowrap;">
                ${customer.name}
              </div>
              <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid white; margin-top: -1px;"></div>
            </div>
          `,
          anchor: new window.naver.maps.Point(12, 30)
        }
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        const contentString = `
          <div class="bg-white p-4 rounded-xl shadow-2xl border border-slate-200 min-w-[220px]">
            <h3 class="font-bold text-slate-800 text-sm mb-1">${customer.name}</h3>
            <p class="text-xs text-slate-500 mb-3">${customer.address}</p>
            <div class="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${
                customer.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700'
              } uppercase">
                ${customer.status === 'completed' ? '관리완료' : '관리중'}
              </span>
              <span class="text-[10px] text-slate-400 font-mono">${customer.phone}</span>
            </div>
          </div>
        `;
        infoWindowRef.current.setContent(contentString);
        infoWindowRef.current.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });

    if (markersRef.current.length > 0 && !selectedCustomer) {
      const bounds = new window.naver.maps.LatLngBounds();
      markersRef.current.forEach(marker => bounds.extend(marker.getPosition()));
      mapInstance.current.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
    }
  }, [customers, selectedCustomer, isApiLoaded]);

  useEffect(() => {
    if (!mapInstance.current || !selectedCustomer?.lat || !selectedCustomer?.lng) return;

    const newPos = new window.naver.maps.LatLng(selectedCustomer.lat, selectedCustomer.lng);
    mapInstance.current.panTo(newPos);
    mapInstance.current.setZoom(16);

    const targetMarker = markersRef.current.find(m => 
      m.getPosition().lat() === selectedCustomer.lat && 
      m.getPosition().lng() === selectedCustomer.lng
    );
    
    if (targetMarker) {
      window.naver.maps.Event.trigger(targetMarker, 'click');
    }
  }, [selectedCustomer, isApiLoaded]);

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
      <div ref={mapRef} id="map" className="w-full h-full"></div>
      {!isApiLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-slate-500 font-medium">네이버 지도를 불러오는 중입니다...</p>
          <p className="text-xs text-slate-400 mt-2">API Key와 서비스 URL 설정을 확인해주세요.</p>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
