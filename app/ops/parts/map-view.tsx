"use client"

import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { useMemo } from "react"

type Props = {
  bookings: any[]
}

const clientIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  iconSize: [25, 41],
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const therapistIcon = new L.DivIcon({
  className: "bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center",
  html: '<div style="background:#7c3aed;color:#fff;width:24px;height:24px;border-radius:9999px;display:flex;align-items:center;justify-content:center;">T</div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

export default function MapView({ bookings }: Props) {
  const center = useMemo<[number, number]>(() => {
    for (const b of bookings) {
      if (b.last_client_latitude && b.last_client_longitude) {
        return [Number(b.last_client_latitude), Number(b.last_client_longitude)]
      }
      if (b.last_therapist_latitude && b.last_therapist_longitude) {
        return [Number(b.last_therapist_latitude), Number(b.last_therapist_longitude)]
      }
    }
    return [14.5995, 120.9842] // Manila default
  }, [bookings])

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution={"&copy; OpenStreetMap contributors"}
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bookings.map((b) => (
        <div key={b.id}>
          {b.last_client_latitude && b.last_client_longitude && (
            <Marker position={[Number(b.last_client_latitude), Number(b.last_client_longitude)]} icon={clientIcon}>
              <Popup>Booking #{b.id} Client</Popup>
            </Marker>
          )}
          {b.last_therapist_latitude && b.last_therapist_longitude && (
            <Marker
              position={[Number(b.last_therapist_latitude), Number(b.last_therapist_longitude)]}
              icon={therapistIcon}
            >
              <Popup>Booking #{b.id} Therapist</Popup>
            </Marker>
          )}
        </div>
      ))}
    </MapContainer>
  )
}
