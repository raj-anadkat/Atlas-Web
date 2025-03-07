import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, useMap } from 'react-leaflet';
import { 
  Settings, 
  Map, 
  Navigation2, 
  Plane, 
  PlaneLanding, 
  GitCommit,
  Plus,
  Trash2,
  Users,
  Map as MapSearch,
  Pencil,
  Wand2
} from 'lucide-react';
import { AddRouteModal } from './components/AddRouteModal';
import { useRoutes } from './hooks/useRoutes';
import { DrawingTools } from './components/DrawingTools';
import { SidebarSection } from './components/SidebarSection';
import { MapLayerControl } from './components/MapLayerControl';
import { ZoomAwareMarker } from './components/ZoomAwareMarker';
import { createZoomBasedIcon } from './components/CustomMarker';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

function MapUpdater({ selectedRoute, routes }: { selectedRoute: string, routes: Record<string, Route> }) {
  const map = useMap();

  useEffect(() => {
    if (selectedRoute && routes[selectedRoute]) {
      const route = routes[selectedRoute];
      const bounds = L.latLngBounds([route.source, route.destination]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedRoute, routes, map]);

  return null;
}

function App() {
  const [selectedRoute, setSelectedRoute] = useState('');
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { routes, addRoute, deleteRoute } = useRoutes();
  const [mapLayer, setMapLayer] = useState<'satellite' | 'streets' | 'hybrid'>('satellite');
  
  const [flightParams, setFlightParams] = useState({
    altitude: 2500,
    velocity: 55,
    geography: 125,
    contingency: 300
  });

  const [certSettings, setCertSettings] = useState({
    sail: 'SAIL 2',
    hasParachute: false,
    densitySuppression: 0,
    relaxation: 750
  });

  const [trajectorySettings, setTrajectorySettings] = useState({
    distanceFwd: 200,
    distanceBack: 150,
    minTurningRadius: 50,
    maxWaypointDistance: 500,
    maxLateralDrift: 30
  });

  const updateDensitySuppression = (sail: string, hasParachute: boolean) => {
    const withoutParachute: { [key: string]: number } = {
      'SAIL 2': 0,
      'SAIL 3': 5,
      'SAIL 4': 50,
      'SAIL 6': 5000
    };

    const withParachute: { [key: string]: number } = {
      'SAIL 2': 5,
      'SAIL 3': 50,
      'SAIL 4': 500
    };

    const density = hasParachute ? withParachute[sail] || 0 : withoutParachute[sail] || 0;
    setCertSettings(prev => ({ ...prev, densitySuppression: density }));
  };

  const handleAddRoute = (name: string, source: [number, number], destination: [number, number]) => {
    addRoute(name, source, destination);
    setShowAddRoute(false);
    setSelectedRoute(name);
  };

  const handleDeleteRoute = () => {
    if (selectedRoute) {
      deleteRoute(selectedRoute);
      setSelectedRoute('');
    }
  };

  const handleAnalyzePopulation = () => {
    if (!selectedRoute) {
      alert('Please select a route first');
      return;
    }
    setIsAnalyzing(true);
  };

  const handleDrawComplete = (layer: L.Layer) => {
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      const coordinates = layer.getLatLngs();
      console.log('Drawn shape coordinates:', coordinates);
    }
    setIsAnalyzing(false);
  };

  const sourceIcon = createZoomBasedIcon(
    <Plane className="h-6 w-6" />,
    'green-500'
  );
  
  const destinationIcon = createZoomBasedIcon(
    <PlaneLanding className="h-6 w-6" />,
    'red-500'
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-3 shadow-lg">
        <div className="flex items-center">
          <Navigation2 className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold ml-2">Atlas v1.5.1</h1>
        </div>
      </header>

      <div className="flex h-[calc(100vh-72px)]">
        <div className="w-96 bg-gray-800 p-4 space-y-3 overflow-y-auto">
          <SidebarSection 
            title="Flight Settings" 
            icon={<Settings className="h-5 w-5 text-blue-500" />}
            defaultExpanded={true}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Select Flight Route</label>
                <select 
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                >
                  <option value="">-- Select a Route --</option>
                  {Object.entries(routes).map(([name, route]) => (
                    <option key={name} value={name}>
                      {route.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button 
                  className="flex-1 bg-blue-500/80 hover:bg-blue-500 rounded-lg p-2.5 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg"
                  onClick={() => setShowAddRoute(true)}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Route</span>
                </button>
                <button 
                  className="flex-1 bg-blue-500/80 hover:bg-blue-500 rounded-lg p-2.5 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  onClick={handleDeleteRoute}
                  disabled={!selectedRoute}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </SidebarSection>

          <SidebarSection 
            title="Flight Parameters" 
            icon={<Map className="h-5 w-5 text-blue-500" />}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Flight Altitude (ft)</label>
                <input 
                  type="number" 
                  value={flightParams.altitude}
                  onChange={(e) => setFlightParams({...flightParams, altitude: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Aircraft Velocity (m/s)</label>
                <input 
                  type="number" 
                  value={flightParams.velocity}
                  onChange={(e) => setFlightParams({...flightParams, velocity: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Flight Geography (m)</label>
                <input 
                  type="number" 
                  value={flightParams.geography}
                  onChange={(e) => setFlightParams({...flightParams, geography: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contingency Volume (m)</label>
                <input 
                  type="number" 
                  value={flightParams.contingency}
                  onChange={(e) => setFlightParams({...flightParams, contingency: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>
            </div>
          </SidebarSection>

          <SidebarSection 
            title="Certification Settings" 
            icon={<Settings className="h-5 w-5 text-blue-500" />}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <select
                    className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                    value={certSettings.sail}
                    onChange={(e) => {
                      const newSail = e.target.value;
                      setCertSettings(prev => ({ ...prev, sail: newSail }));
                      updateDensitySuppression(newSail, certSettings.hasParachute);
                    }}
                  >
                    <option value="SAIL 2">SAIL 2</option>
                    <option value="SAIL 3">SAIL 3</option>
                    <option value="SAIL 4">SAIL 4</option>
                    {!certSettings.hasParachute && <option value="SAIL 6">SAIL 6</option>}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="parachute"
                    checked={certSettings.hasParachute}
                    onChange={(e) => {
                      const hasParachute = e.target.checked;
                      setCertSettings(prev => ({ ...prev, hasParachute }));
                      updateDensitySuppression(certSettings.sail, hasParachute);
                    }}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700"
                  />
                  <label htmlFor="parachute" className="ml-2">Parachute</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Density Suppression (pp/km²)</label>
                <input 
                  type="number"
                  value={certSettings.densitySuppression}
                  readOnly
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Controlled Area (m)</label>
                <input 
                  type="number"
                  value={certSettings.relaxation}
                  onChange={(e) => setCertSettings({...certSettings, relaxation: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>
            </div>
          </SidebarSection>

          <SidebarSection 
            title="Trajectory Settings" 
            icon={<GitCommit className="h-5 w-5 text-blue-500" />}
          >
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Distance Fwd Transition (m)</label>
                <input 
                  type="number"
                  value={trajectorySettings.distanceFwd}
                  onChange={(e) => setTrajectorySettings({...trajectorySettings, distanceFwd: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Distance Back Transition (m)</label>
                <input 
                  type="number"
                  value={trajectorySettings.distanceBack}
                  onChange={(e) => setTrajectorySettings({...trajectorySettings, distanceBack: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Min Turning Radius (m)</label>
                <input 
                  type="number"
                  value={trajectorySettings.minTurningRadius}
                  onChange={(e) => setTrajectorySettings({...trajectorySettings, minTurningRadius: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Distance Between Waypoints (m)</label>
                <input 
                  type="number"
                  value={trajectorySettings.maxWaypointDistance}
                  onChange={(e) => setTrajectorySettings({...trajectorySettings, maxWaypointDistance: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Max Lateral Drift (m)</label>
                <input 
                  type="number"
                  value={trajectorySettings.maxLateralDrift}
                  onChange={(e) => setTrajectorySettings({...trajectorySettings, maxLateralDrift: Number(e.target.value)})}
                  className="w-full bg-gray-700 rounded-lg p-2 border border-gray-600"
                />
              </div>
            </div>
          </SidebarSection>

          <SidebarSection 
            title="Analysis Tools" 
            icon={<Map className="h-5 w-5 text-blue-500" />}
            alwaysExpanded={true}
          >
            <div className="space-y-2">
              <button 
                className={`w-full ${isAnalyzing ? 'bg-green-500/80 hover:bg-green-500' : 'bg-blue-500/80 hover:bg-blue-500'} rounded-lg p-2.5 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none`}
                onClick={handleAnalyzePopulation}
                disabled={!selectedRoute}
              >
                <Users className="h-4 w-4" />
                <span>{isAnalyzing ? 'Drawing Area...' : 'Analyze Populations'}</span>
              </button>
              <button className="w-full bg-blue-500/80 hover:bg-blue-500 rounded-lg p-2.5 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg">
                <MapSearch className="h-4 w-4" />
                <span>Find Flight Zones</span>
              </button>
              <button className="w-full bg-blue-500/80 hover:bg-blue-500 rounded-lg p-2.5 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none" disabled>
                <Pencil className="h-4 w-4" />
                <span>Manual Plan</span>
              </button>
              <button className="w-full bg-blue-500/80 hover:bg-blue-500 rounded-lg p-2.5 flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none" disabled>
                <Wand2 className="h-4 w-4" />
                <span>Auto Plan</span>
              </button>
            </div>
          </SidebarSection>
        </div>

        <div className="flex-1 bg-gray-800 p-4">
          <div className="h-full rounded-lg overflow-hidden relative">
            <MapContainer
              center={[51.505, -0.09]}
              zoom={13}
              className="h-full w-full"
            >
              <MapLayerControl currentLayer={mapLayer} onLayerChange={setMapLayer} />
              
              {mapLayer === 'satellite' && (
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                  attribution="Google Satellite"
                />
              )}
              {mapLayer === 'streets' && (
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  attribution="Google Streets"
                />
              )}
              {mapLayer === 'hybrid' && (
                <TileLayer
                  url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
                  attribution="Google Hybrid"
                />
              )}

              <MapUpdater selectedRoute={selectedRoute} routes={routes} />

              {isAnalyzing && <DrawingTools onDrawComplete={handleDrawComplete} />}

              {selectedRoute && routes[selectedRoute] && (
                <>
                  <ZoomAwareMarker position={routes[selectedRoute].source} createIcon={sourceIcon}>
                    <Popup>
                      <div className="text-gray-900">
                        <strong>Take-off Location</strong>
                        <p>Lat: {routes[selectedRoute].source[0].toFixed(6)}</p>
                        <p>Lon: {routes[selectedRoute].source[1].toFixed(6)}</p>
                      </div>
                    </Popup>
                  </ZoomAwareMarker>
                  <ZoomAwareMarker position={routes[selectedRoute].destination} createIcon={destinationIcon}>
                    <Popup>
                      <div className="text-gray-900">
                        <strong>Landing Location</strong>
                        <p>Lat: {routes[selectedRoute].destination[0].toFixed(6)}</p>
                        <p>Lon: {routes[selectedRoute].destination[1].toFixed(6)}</p>
                      </div>
                    </Popup>
                  </ZoomAwareMarker>
                  <Polyline
                    positions={[routes[selectedRoute].source, routes[selectedRoute].destination]}
                    color="white"
                    weight={3}
                    opacity={0.8}
                    dashArray="10"
                  />
                </>
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      <AddRouteModal
        isOpen={showAddRoute}
        onClose={() => setShowAddRoute(false)}
        onAddRoute={handleAddRoute}
      />
    </div>
  );
}

export default App;
