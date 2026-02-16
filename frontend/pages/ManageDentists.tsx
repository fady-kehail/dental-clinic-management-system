
import React, { useState, useEffect } from 'react';
import { getDentists, addDentist, deleteDentist } from '../services/Api';
import { Dentist } from '../types';

const ManageDentists: React.FC<{onNavigate: (p: string) => void}> = ({onNavigate}) => {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newDentist, setNewDentist] = useState({
    name: '',
    specialization: '',
    experience: 0,
    imageUrl: '',
    bio: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadDentists();
  }, []);

  const loadDentists = async () => {
    const data = await  getDentists();
    setDentists(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', newDentist.name);
    formData.append('specialization', newDentist.specialization);
    formData.append('experience', newDentist.experience.toString());
    formData.append('bio', newDentist.bio);
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (newDentist.imageUrl) {
        formData.append('imageUrl', newDentist.imageUrl);
    }

    try {
        await addDentist(formData);
        setIsAdding(false);
        setNewDentist({ name: '', specialization: '', experience: 0, imageUrl: '', bio: '' });
        setImageFile(null);
        loadDentists();
    } catch (error) {
        console.error("Failed to add dentist", error);
        alert("Failed to add dentist. Please check constraints (e.g. image size < 2MB).");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Remove this dentist from system?')) {
      await  deleteDentist(id);
      loadDentists();
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dentist Directory</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition"
        >
          Add New Dentist
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 my-8 relative">
            <h2 className="text-xl font-bold mb-6">Add New Staff Member</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <input 
                placeholder="Full Name" className="w-full p-3 border rounded-xl" required
                value={newDentist.name} onChange={e => setNewDentist({...newDentist, name: e.target.value})}
              />
              <input 
                placeholder="Specialization (e.g. Orthodontics)" className="w-full p-3 border rounded-xl" required
                value={newDentist.specialization} onChange={e => setNewDentist({...newDentist, specialization: e.target.value})}
              />
              <input 
                type="number" placeholder="Years of Experience" className="w-full p-3 border rounded-xl" required
                value={newDentist.experience} onChange={e => setNewDentist({...newDentist, experience: parseInt(e.target.value)})}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <div className="flex gap-2">
                    <input 
                        type="file" 
                        accept="image/*"
                        className="w-full p-3 border rounded-xl text-sm"
                        onChange={e => {
                            if (e.target.files?.[0]) {
                                setImageFile(e.target.files[0]);
                            }
                        }}
                    />
                </div>
                <p className="text-xs text-gray-500">Max size: 2MB. Formats: JPEG, PNG.</p>
              </div>
              <textarea 
                placeholder="Bio" className="w-full p-3 border rounded-xl" rows={3}
                value={newDentist.bio} onChange={e => setNewDentist({...newDentist, bio: e.target.value})}
              ></textarea>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-3 border rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Save Dentist</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dentists.map(dentist => (
          <div key={dentist.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition group">
            <div className="aspect-square relative overflow-hidden">
              <img src={dentist.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={dentist.name} />
              <button 
                onClick={() => handleDelete(dentist.id)}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-gray-900">{dentist.name}</h3>
              <p className="text-blue-600 text-sm font-medium">{dentist.specialization}</p>
              <p className="text-gray-400 text-xs mt-1">{dentist.experience} Years Experience</p>
              <p className="text-gray-500 text-sm mt-3 line-clamp-2">{dentist.bio}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageDentists;
