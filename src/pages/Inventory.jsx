import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { serverUrl } from "../../config";

import {
  FaBoxes,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { MdOutlineInventory, MdLowPriority } from "react-icons/md";

const Inventory = () => {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    inStock: 0,
  });
  const [lowStockItems, setLowStockItems] = useState([]);

  /*  FETCH INVENTORY */
  const fetchInventory = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get(
        `${serverUrl}/api/product/inventory`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        setStats(data.stats);
        setLowStockItems(data.lowStockItems);
      } else {
        toast.error("Failed to load inventory");
      }
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /* UI  */

  const inventoryStats = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <FaBoxes />,
      color: "blue",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: <FaExclamationTriangle />,
      color: "yellow",
    },
    {
      title: "Out of Stock",
      value: stats.outOfStock,
      icon: <MdLowPriority />,
      color: "red",
    },
    {
      title: "In Stock",
      value: stats.inStock,
      icon: <FaCheckCircle />,
      color: "green",
    },
  ];

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Inventory Management
        </h1>
        <p className="text-gray-600">
          Monitor and manage your product inventory
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {inventoryStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}
              >
                {stat.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LOW STOCK ALERT */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Low Stock Alert
            </h3>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-gray-500">Loading inventory...</p>
          ) : lowStockItems.length === 0 ? (
            <p className="text-green-600 font-medium">
               No low stock products
            </p>
          ) : (
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Threshold: {item.threshold} units
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-yellow-600">
                      {item.stock}
                    </span>
                    <p className="text-sm text-gray-600">units left</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed rounded-lg hover:bg-blue-50">
            <MdOutlineInventory className="text-2xl mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">
              Update Inventory
            </p>
          </button>

          <button className="p-4 border-2 border-dashed rounded-lg hover:bg-green-50">
            <FaBoxes className="text-2xl mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">
              Bulk Import
            </p>
          </button>

          <button className="p-4 border-2 border-dashed rounded-lg hover:bg-purple-50">
            <FaCheckCircle className="text-2xl mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">
              Stock Audit
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
