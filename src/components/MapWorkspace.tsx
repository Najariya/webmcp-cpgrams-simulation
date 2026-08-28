import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { VILLAGE_CENTER } from "../data/categories";
import { useAppStore } from "../store";

/**
 * Map workspace — the shared canvas. Silpi Gram area on a soft CARTO basemap.
 * (Centre is approximate; the panchayat simulation is fictional — see app footer.)
 */
export default function MapWorkspace() {
  const largeType = useAppStore((s) => s.largeType);
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={VILLAGE_CENTER}
        zoom={15}
        minZoom={13}
        maxZoom={18}
        style={{ height: "100%", width: "100%", background: "#ECF0ED" }}
        attributionControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <CircleMarker
          center={VILLAGE_CENTER}
          radius={largeType ? 16 : 12}
          pathOptions={{ color: "#0F6B5C", weight: 2, fillColor: "#0F6B5C", fillOpacity: 0.25 }}
        >
          <Tooltip direction="top" offset={[0, -6]}>
            सिल्पी ग्राम · Silpi Gram (simulation)
          </Tooltip>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
