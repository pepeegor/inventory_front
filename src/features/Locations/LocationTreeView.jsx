import { useState, useEffect } from 'react'
import { Container, Card, Spinner, Row, Col } from 'react-bootstrap'
import { FaBuilding, FaServer, FaChevronRight, FaChevronDown, FaMap } from 'react-icons/fa'
import { getAllLocations } from '../../api/locations'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'

// Recursive component for rendering location nodes
const LocationNode = ({ location, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth === 0) // Auto-expand root nodes
  
  const toggleExpand = () => setExpanded(!expanded)
  const hasChildren = location.children?.length > 0
  const hasDevices = location.devices?.length > 0
  const hasExpandableContent = hasChildren || hasDevices
  
  return (
    <div className="location-node mb-2">
      <div 
        className={`d-flex align-items-center p-2 rounded ${hasExpandableContent ? 'cursor-pointer' : ''} ${depth === 0 ? 'bg-gray-700' : 'bg-gray-800'}`}
        onClick={hasExpandableContent ? toggleExpand : undefined}
      >
        <div className="me-2" style={{ width: '20px' }}>
          {hasExpandableContent && (
            expanded ? <FaChevronDown className="text-blue-400" /> : <FaChevronRight className="text-blue-400" />
          )}
        </div>
        
        <FaBuilding className="text-blue-500 me-2" />
        
        <div className="flex-grow-1">
          <span className="fw-bold">{location.name}</span>
          {location.description && (
            <p className="text-muted small mb-0">{location.description}</p>
          )}
        </div>
        
        <div className="d-flex gap-3">
          {hasChildren && (
            <span className="badge bg-purple-600 d-flex align-items-center">
              <FaBuilding className="me-1" /> {location.children.length}
            </span>
          )}
          {hasDevices && (
            <span className="badge bg-blue-600 d-flex align-items-center">
              <FaServer className="me-1" /> {location.devices.length}
            </span>
          )}
        </div>
      </div>
      
      {expanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="ps-4 mt-2"
        >
          {/* Child locations */}
          {hasChildren && (
            <div className="child-locations mb-2">
              {location.children.map(child => (
                <LocationNode key={child.id} location={child} depth={depth + 1} />
              ))}
            </div>
          )}
          
          {/* Devices in this location */}
          {hasDevices && (
            <div className="devices">
              <h6 className="text-blue-400 mb-2 d-flex align-items-center">
                <FaServer className="me-2" /> Devices in this location
              </h6>
              <div className="ps-2">
                {location.devices.map(device => (
                  <motion.div 
                    key={device.id}
                    whileHover={{ x: 4 }}
                    className={`device-item p-2 mb-1 rounded d-flex justify-content-between align-items-center ${
                      device.status === 'active' ? 'bg-green-900/20' :
                      device.status === 'storage' ? 'bg-blue-900/20' :
                      device.status === 'maintenance' ? 'bg-yellow-900/20' : 
                      'bg-gray-900/20'
                    }`}
                  >
                    <div className="d-flex align-items-center">
                      <FaServer className={`me-2 ${
                        device.status === 'active' ? 'text-green-500' :
                        device.status === 'storage' ? 'text-blue-500' :
                        device.status === 'maintenance' ? 'text-yellow-500' : 
                        'text-gray-500'
                      }`} />
                      <span>{device.serial_number}</span>
                    </div>
                    <span className={`badge ${
                      device.status === 'active' ? 'bg-green-600' :
                      device.status === 'storage' ? 'bg-blue-600' :
                      device.status === 'maintenance' ? 'bg-yellow-600' : 
                      'bg-gray-600'
                    }`}>
                      {device.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function LocationTreeView() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const data = await getAllLocations()
        setLocations(data)
      } catch (error) {
        console.error('Error fetching locations:', error)
        toast.error('Failed to load location tree')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  return (
    <Container fluid className="py-4 px-4 animate__animated animate__fadeIn">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center">
            <FaMap className="text-blue-500 me-2" size={24} />
            <h2 className="m-0 text-white">Location Map</h2>
          </div>
        </Col>
      </Row>

      <Card className="shadow border-0 bg-gray-800 text-white">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-5">
              <p className="mb-0">No locations found</p>
            </div>
          ) : (
            <div className="location-tree">
              {locations.map(location => (
                <LocationNode key={location.id} location={location} />
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
      
      <div className="mt-4 p-3 bg-gray-900 rounded">
        <h5 className="text-white mb-3">Legend</h5>
        <div className="d-flex flex-wrap gap-4">
          <div className="d-flex align-items-center">
            <span className="badge bg-green-600 me-2">active</span>
            <span className="text-white">Device is currently in use</span>
          </div>
          <div className="d-flex align-items-center">
            <span className="badge bg-blue-600 me-2">storage</span>
            <span className="text-white">Device is in storage</span>
          </div>
          <div className="d-flex align-items-center">
            <span className="badge bg-yellow-600 me-2">maintenance</span>
            <span className="text-white">Device is under maintenance</span>
          </div>
          <div className="d-flex align-items-center">
            <span className="badge bg-gray-600 me-2">other</span>
            <span className="text-white">Other status</span>
          </div>
        </div>
      </div>
    </Container>
  )
} 