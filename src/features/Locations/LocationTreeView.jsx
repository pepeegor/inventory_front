import { useState } from 'react'
import { FaBuilding, FaServer, FaChevronRight, FaChevronDown } from 'react-icons/fa'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import Loader from '../../components/ui/Loader'

// Recursive component for rendering location nodes
const LocationNode = ({ location, depth = 0, searchTerm = '' }) => {
  const [expanded, setExpanded] = useState(depth === 0 || (searchTerm && searchTerm.length > 0))
  
  const toggleExpand = () => setExpanded(!expanded)
  const hasChildren = location.children?.length > 0
  const hasDevices = location.devices?.length > 0
  const hasExpandableContent = hasChildren || hasDevices

  const matchesSearch = searchTerm && (
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.devices?.some(device => 
      device.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )
  
  return (
    <Motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: depth * 0.1 }}
      className={`
        location-node mb-2
        ${matchesSearch ? 'ring-2 ring-violet-500/30 rounded-lg' : ''}
      `}
    >
      <Motion.div 
        whileHover={{ x: 4 }}
        className={`
          flex items-center p-3 rounded-lg transition-all cursor-pointer
          ${hasExpandableContent ? 'cursor-pointer' : ''}
          ${depth === 0 
            ? 'bg-gradient-to-r from-violet-900/30 to-indigo-800/20 backdrop-blur-sm border border-violet-700/30' 
            : matchesSearch
              ? 'bg-violet-900/20 hover:bg-violet-800/30'
              : 'bg-gray-800/50 hover:bg-gray-700/50'
          }
        `}
        onClick={hasExpandableContent ? toggleExpand : undefined}
      >
        <div className="w-6 flex justify-center">
          {hasExpandableContent && (
            <Motion.span
              initial={{ rotate: 0 }}
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {expanded ? <FaChevronDown className="text-violet-400" /> : <FaChevronRight className="text-violet-400" />}
            </Motion.span>
          )}
        </div>
        
        <FaBuilding className="text-violet-400 mr-2" />
        
        <div className="flex-grow">
          <span className="font-medium text-white">{location.name}</span>
          {location.description && (
            <p className="text-sm text-gray-400 mt-0.5">{location.description}</p>
          )}
        </div>
        
        <div className="flex gap-2">
          {hasChildren && (
            <span className="px-2 py-1 bg-violet-900/50 text-violet-300 rounded-full text-xs flex items-center gap-1">
              <FaBuilding className="text-xs" /> {location.children.length}
            </span>
          )}
          {hasDevices && (
            <span className="px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-xs flex items-center gap-1">
              <FaServer className="text-xs" /> {location.devices.length}
            </span>
          )}
        </div>
      </Motion.div>
      
      <AnimatePresence>
        {expanded && (
          <Motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="pl-8 mt-2 border-l border-gray-700/50"
          >
            {hasChildren && (
              <div className="space-y-2">
                {location.children.map(child => (
                  <LocationNode key={child.id} location={child} depth={depth + 1} searchTerm={searchTerm} />
                ))}
              </div>
            )}
            
            {hasDevices && (
              <div className="mt-2">
                <h6 className="text-violet-400 mb-2 flex items-center text-sm font-medium">
                  <FaServer className="mr-2" /> Устройства в локации
                </h6>
                <div className="space-y-1">
                  {location.devices.map(device => (
                    <Motion.div 
                      key={device.id}
                      whileHover={{ x: 4 }}
                      className={`
                        p-2 rounded-lg flex justify-between items-center
                        ${device.status === 'active' ? 'bg-emerald-900/20 border border-emerald-800/30' :
                          device.status === 'storage' ? 'bg-violet-900/20 border border-violet-800/30' :
                          device.status === 'maintenance' ? 'bg-amber-900/20 border border-amber-800/30' : 
                          'bg-gray-800/20 border border-gray-700/30'}
                        ${searchTerm && device.serial_number.toLowerCase().includes(searchTerm.toLowerCase())
                          ? 'ring-2 ring-violet-500/30'
                          : ''}
                      `}
                    >
                      <div className="flex items-center">
                        <FaServer className={`mr-2 ${
                          device.status === 'active' ? 'text-emerald-400' :
                          device.status === 'storage' ? 'text-violet-400' :
                          device.status === 'maintenance' ? 'text-amber-400' : 
                          'text-gray-400'
                        }`} />
                        <span className="text-sm text-gray-300">{device.serial_number}</span>
                      </div>
                      <span className={`
                        px-2 py-1 rounded-full text-xs
                        ${device.status === 'active' ? 'bg-emerald-900/50 text-emerald-300' :
                          device.status === 'storage' ? 'bg-violet-900/50 text-violet-300' :
                          device.status === 'maintenance' ? 'bg-amber-900/50 text-amber-300' : 
                          'bg-gray-900/50 text-gray-300'}
                      `}>
                        {device.status === 'active' ? 'Активно' :
                         device.status === 'storage' ? 'На складе' :
                         device.status === 'maintenance' ? 'В ремонте' : 
                         'Другое'}
                      </span>
                    </Motion.div>
                  ))}
                </div>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  )
}

export default function LocationTreeView({ locations = [], searchTerm = '' }) {
  if (!locations || locations.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        {searchTerm ? 'Локации не найдены' : 'Нет локаций'}
      </div>
    )
  }

  // Filter locations based on search
  const filterLocationsRecursive = (locations, term) => {
    if (!term) return locations;

    return locations.map(location => {
      const matchesSearch = 
        location.name.toLowerCase().includes(term.toLowerCase()) ||
        location.description?.toLowerCase().includes(term.toLowerCase());

      const filteredChildren = location.children 
        ? filterLocationsRecursive(location.children, term)
        : [];

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...location,
          children: filteredChildren
        };
      }
      return null;
    }).filter(Boolean);
  };

  const filteredLocations = filterLocationsRecursive(locations, searchTerm);

  return (
    <div className="space-y-4">
      {filteredLocations.map(location => (
        <LocationNode key={location.id} location={location} searchTerm={searchTerm} />
      ))}
    </div>
  )
} 