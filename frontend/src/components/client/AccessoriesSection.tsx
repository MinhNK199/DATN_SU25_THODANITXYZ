import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AccessoryCategory {
  _id: string;
  name: string;
  image: string;
  slug?: string;
  parentCategory?: string;
  isActive?: boolean;
}

const AccessoriesSection: React.FC = () => {
  const navigate = useNavigate();
  const [accessoriesCategories, setAccessoriesCategories] = useState<AccessoryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/category');
        if (!response.ok) throw new Error('Lỗi khi tải danh mục');
        
        const data = await response.json();
        
        // Filter for accessories categories or use all categories if no specific filter
        // You can modify this filter based on your backend structure
        const filteredCategories = data.filter((category: AccessoryCategory) => 
          category.isActive !== false && 
          (category.name.toLowerCase().includes('phụ kiện') || 
           category.parentCategory === 'accessories' ||
           // Add more conditions based on your category structure
           true) // For now, show all active categories
        ) as AccessoryCategory[];
        
        setAccessoriesCategories(filteredCategories);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category: AccessoryCategory) => {
    // Sử dụng slug nếu có, nếu không thì sử dụng _id
    const categoryParam = category.slug || category._id;
    console.log('Category clicked:', category);
    console.log('Category param:', categoryParam);
    navigate(`/products?category=${categoryParam}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">DANH MỤC</h2>
            <button 
              onClick={() => navigate('/products?category=accessories')}
              className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
            >
              Xem tất cả
            </button>
          </div>
          <div className="text-center text-gray-500">Đang tải danh mục...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">DANH MỤC</h2>
            <button 
              onClick={() => navigate('/products?category=accessories')}
              className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
            >
              Xem tất cả
            </button>
          </div>
          <div className="text-center text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            DANH MỤC
          </h2>
          <button 
            onClick={() => navigate('/products?category=accessories')}
            className="text-blue-600 hover:text-blue-700 font-medium text-lg transition-colors"
          >
            Xem tất cả
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9 gap-4">
          {accessoriesCategories.map((category) => (
            <button
              key={category._id}
              onClick={() => handleCategoryClick(category)}
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 p-4 text-center"
            >
              <div className="aspect-square mb-3 overflow-hidden rounded-md">
                <img
                  src={category.image || 'https://via.placeholder.com/150x150/cccccc/666666?text=No+Image'}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150x150/cccccc/666666?text=No+Image';
                  }}
                />
              </div>
              <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                {category.name}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AccessoriesSection;
