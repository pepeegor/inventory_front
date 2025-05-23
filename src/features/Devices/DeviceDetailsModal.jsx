import { useState, useEffect } from 'react'
import { FaTimes, FaCalendarAlt, FaTag, FaMapMarkerAlt, FaInfoCircle, FaUser } from 'react-icons/fa'
import Modal from '../../components/common/Modal'
import { Link } from 'react-router-dom'
import { FiMap } from 'react-icons/fi'
import Button from '../../components/ui/Button'
import { getUserById } from '../../api/users'

export default function DeviceDetailsModal({ isOpen, onClose, device }) {
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch creator information when device changes
  useEffect(() => {
    // Reset state when device changes
    setCreator(null);
    
    let isMounted = true;
    
    async function fetchCreator() {
      if (!device || !device.created_by) return;
      
      setLoading(true);
      try {
        const userData = await getUserById(device.created_by);
        if (isMounted) {
          setCreator(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    fetchCreator();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [device?.id]); // Only depend on device.id, not the entire device object

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'storage':
        return 'bg-blue-100 text-blue-800';
      case 'repair':
        return 'bg-orange-100 text-orange-800';
      case 'decommissioned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateWarrantyStatus = () => {
    if (!device.warranty_end) return { status: 'Not set', className: 'text-gray-400' };
    
    const endDate = new Date(device.warranty_end);
    const now = new Date();
    
    if (endDate < now) {
      return { 
        status: 'Expired', 
        className: 'text-red-500',
        daysAgo: Math.floor((now - endDate) / (1000 * 60 * 60 * 24))
      };
    }
    
    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 30) {
      return { 
        status: 'Expiring soon', 
        className: 'text-orange-500',
        daysRemaining
      };
    }
    
    return { 
      status: 'Valid', 
      className: 'text-green-500',
      daysRemaining 
    };
  };

  const warrantyDetails = calculateWarrantyStatus();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-t-lg flex justify-between items-center border-b border-gray-700">
        <h3 className="text-xl font-medium text-white">Device Details</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <FaTimes />
        </button>
      </div>
      
      <div className="bg-gray-800 p-4">
        {/* Device header */}
        <div className="mb-6 text-center">
          <h4 className="text-2xl font-semibold text-white mb-2">{device.serial_number}</h4>
          <span className={`${getStatusBadgeClass(device.status)} px-3 py-1 rounded-full text-sm font-medium`}>
            {device.status?.charAt(0).toUpperCase() + device.status?.slice(1) || 'Unknown'}
          </span>
        </div>

        {/* Device info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type info */}
          <div className="bg-gray-750 p-4 rounded-lg">
            <h5 className="text-md font-semibold text-gray-300 mb-3 flex items-center">
              <FaTag className="mr-2 text-blue-400" /> Device Type
            </h5>
            {device.type ? (
              <div>
                <p className="text-white"><span className="text-gray-400">Manufacturer:</span> {device.type.manufacturer}</p>
                <p className="text-white"><span className="text-gray-400">Model:</span> {device.type.model}</p>
                <p className="text-white"><span className="text-gray-400">Part Type:</span> {device.type.part_types?.name}</p>
                <p className="text-white">
                  <span className="text-gray-400">Expected Lifetime:</span> {device.type.expected_lifetime_months ? `${device.type.expected_lifetime_months} months` : 'Not set'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No type information</p>
            )}
          </div>

          {/* Location info */}
          <div className="bg-gray-750 p-4 rounded-lg">
            <h5 className="text-md font-semibold text-gray-300 mb-3 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-400" /> Location
            </h5>
            {device.current_location ? (
              <div>
                <p className="text-white"><span className="text-gray-400">Location:</span> {device.current_location.name}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No location information</p>
            )}
          </div>

          {/* Creator info */}
          <div className="bg-gray-750 p-4 rounded-lg">
            <h5 className="text-md font-semibold text-gray-300 mb-3 flex items-center">
              <FaUser className="mr-2 text-blue-400" /> Created By
            </h5>
            {loading ? (
              <p className="text-gray-500 italic">Loading...</p>
            ) : creator ? (
              <div>
                <p className="text-white"><span className="text-gray-400">User:</span> {creator.username}</p>
                {creator.email && (
                  <p className="text-white"><span className="text-gray-400">Email:</span> {creator.email}</p>
                )}
                <p className="text-white"><span className="text-gray-400">Role:</span> {creator.role}</p>
              </div>
            ) : device.created_by ? (
              <p className="text-white"><span className="text-gray-400">User ID:</span> {device.created_by}</p>
            ) : (
              <p className="text-gray-500 italic">No creator information</p>
            )}
          </div>

          {/* Warranty info */}
          <div className="bg-gray-750 p-4 rounded-lg">
            <h5 className="text-md font-semibold text-gray-300 mb-3 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-400" /> Warranty
            </h5>
            {warrantyDetails.status === 'Not set' ? (
              <p className="text-gray-500 italic">No warranty information</p>
            ) : (
              <div>
                <p className={`text-${warrantyDetails.className} text-sm`}>
                  {warrantyDetails.status}
                </p>
                {warrantyDetails.status === 'Expiring soon' && (
                  <p className="text-gray-500 text-sm">
                    {warrantyDetails.daysRemaining} days remaining
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Purchase date info */}
          <div className="bg-gray-750 p-4 rounded-lg">
            <h5 className="text-md font-semibold text-gray-300 mb-3 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-400" /> Purchase Date
            </h5>
            {device.purchase_date ? (
              <p className="text-white">
                {formatDate(device.purchase_date)}
              </p>
            ) : (
              <p className="text-gray-500 italic">No purchase date information</p>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <div>
            <Button 
              as={Link} 
              to={`/devices/${device.id}/movements`}
              className="flex items-center gap-2 bg-indigo-600"
            >
              <FiMap /> История перемещений
            </Button>
          </div>
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </Modal>
  )
} 