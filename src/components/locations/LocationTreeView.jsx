import { useState } from 'react'
import { FaChevronDown, FaChevronRight, FaBuilding, FaServer, FaBox, FaInfoCircle } from 'react-icons/fa'

// Component for individual location node
const LocationNode = ({ location, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showDevices, setShowDevices] = useState(false)

  const toggleExpanded = () => setIsExpanded(!isExpanded)
  const toggleDevices = () => setShowDevices(!showDevices)

  // Get icon based on location name
  const getLocationIcon = (name) => {
    const nameLower = name.toLowerCase()
    if (nameLower.includes('сервер')) return <FaServer className="mr-2 text-blue-400" />
    if (nameLower.includes('склад')) return <FaBox className="mr-2 text-yellow-400" />
    return <FaBuilding className="mr-2 text-indigo-400" />
  }

  // Get status badge for device
  const getStatusBadge = (status) => {
    const badgeClasses = {
      active: "bg-green-100 text-green-800",
      storage: "bg-blue-100 text-blue-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      decommissioned: "bg-red-100 text-red-800"
    }
    
    return (
      <span className={`${badgeClasses[status] || "bg-gray-100 text-gray-800"} text-xs font-medium px-2.5 py-0.5 rounded`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const hasChildren = location.children && location.children.length > 0

  return (
    <div className={`mb-3 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-sm ${level > 0 ? 'ml-4' : ''}`}>
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 py-2 px-3 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {hasChildren && (
              <button
                className="p-1 mr-1 text-white hover:bg-gray-600 rounded-full transition"
                onClick={toggleExpanded}
                aria-label={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? <FaChevronDown className="w-3 h-3" /> : <FaChevronRight className="w-3 h-3" />}
              </button>
            )}
            {getLocationIcon(location.name)}
            <span className="font-medium text-white">{location.name}</span>
            
            {location.devices?.length > 0 && (
              <button 
                className="ml-2 text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-gray-600 transition flex items-center text-xs" 
                onClick={toggleDevices}
                title="Show/hide devices"
              >
                <FaInfoCircle className="mr-1" /> {location.devices.length} device{location.devices.length !== 1 ? 's' : ''}
              </button>
            )}
          </div>
          
          <div>
            {location.description && (
              <span className="text-sm text-gray-400">{location.description}</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Show devices if any */}
      {location.devices?.length > 0 && showDevices && (
        <div className="py-2 px-3 border-b border-gray-700">
          <h6 className="mb-2 text-sm font-medium text-gray-300">Devices</h6>
          <div className="space-y-1">
            {location.devices.map(device => (
              <div key={device.id} className="flex justify-between items-center py-1 px-2 bg-gray-750 rounded">
                <div className="text-sm text-gray-300">{device.serial_number}</div>
                <div>{getStatusBadge(device.status)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Show children locations if any */}
      {hasChildren && isExpanded && (
        <div className="p-3">
          {location.children.map(childLocation => (
            <LocationNode 
              key={childLocation.id} 
              location={childLocation} 
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Main component to display the location tree
export default function LocationTreeView({ locations }) {
  if (!locations || locations.length === 0) {
    return <div className="text-center py-6 text-gray-400">No locations found</div>
  }
  
  // Console log for debugging
  console.log("Locations data:", JSON.stringify(locations, null, 2))
  
  return (
    <div className="location-tree animate__animated animate__fadeIn">
      {locations.map(location => (
        <LocationNode key={location.id} location={location} />
      ))}
    </div>
  )
} 