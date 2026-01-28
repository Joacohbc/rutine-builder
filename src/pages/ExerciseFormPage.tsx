import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useExercises } from '../hooks/useExercises';
import { useInventory } from '../hooks/useInventory';
import { Layout } from '../components/ui/Layout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Icon, cn } from '../components/ui/Icon';
import type { MediaItem, Exercise } from '../types';

export default function ExerciseFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { exercises, addExercise, updateExercise } = useExercises();
  const { items: inventoryItems } = useInventory();
  
  const [title, setTitle] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<number[]>([]);
  const [defaultType, setDefaultType] = useState<Exercise['defaultType']>('weight_reps');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id && exercises.length > 0) {
      const ex = exercises.find(e => e.id === Number(id));
      if (ex) {
        setTitle(ex.title);
        setMuscleGroup(ex.muscleGroup);
        setMedia(ex.media);
        setSelectedEquipment(ex.primaryEquipmentIds);
        setDefaultType(ex.defaultType);
      }
    }
  }, [id, exercises]);

  const handleSave = async () => {
    const exerciseData = {
      title,
      muscleGroup,
      media,
      primaryEquipmentIds: selectedEquipment,
      defaultType
    };

    if (id) {
      await updateExercise({ ...exerciseData, id: Number(id) });
    } else {
      await addExercise(exerciseData);
    }
    navigate('/exercises');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Only images and videos are supported.');
      return;
    }

    const url = URL.createObjectURL(file);
    const newMedia: MediaItem = {
      id: crypto.randomUUID(),
      type: isImage ? 'image' : 'video',
      url, // For immediate preview
      blob: file // For persistence
    };
    
    // For blob persistence, in a real app we'd convert to Blob/ArrayBuffer before saving to IDB, 
    // but the structured clone algorithm of IDB supports Blobs directly.
    
    setMedia([...media, newMedia]);
  };

  const addYouTube = () => {
    const url = prompt('Enter YouTube URL:');
    if (!url) return;
    
    // Simple ID extraction
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (videoId) {
      setMedia([...media, {
        id: crypto.randomUUID(),
        type: 'youtube',
        url: videoId, // Store ID
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/0.jpg`
      }]);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const removeMedia = (mediaId: string) => {
    setMedia(media.filter(m => m.id !== mediaId));
  };

  const toggleEquipment = (eqId: number) => {
    if (selectedEquipment.includes(eqId)) {
      setSelectedEquipment(selectedEquipment.filter(id => id !== eqId));
    } else {
      setSelectedEquipment([...selectedEquipment, eqId]);
    }
  };

  return (
    <Layout
      header={
        <div className="flex items-center justify-between px-6 py-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight">
            <Icon name="arrow_back" />
          </button>
          <h1 className="text-lg font-bold">{id ? 'Edit Exercise' : 'New Exercise'}</h1>
          <Button size="sm" onClick={handleSave}>Save</Button>
        </div>
      }
    >
      <div className="flex flex-col gap-6 mt-4">
        {/* Basic Info */}
        <section className="flex flex-col gap-4">
          <Input label="Title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bench Press" />
          <Input label="Muscle Group" value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} placeholder="e.g. Chest" />
          
          <div>
             <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Default Type</label>
             <div className="flex bg-surface-light dark:bg-surface-dark rounded-2xl p-1 border border-gray-200 dark:border-surface-highlight">
               {(['weight_reps', 'time', 'bodyweight_reps'] as const).map((t) => (
                 <button
                   key={t}
                   onClick={() => setDefaultType(t)}
                   className={cn(
                     "flex-1 py-2 text-xs font-medium rounded-xl transition-all",
                     defaultType === t ? "bg-primary text-white shadow-md" : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                   )}
                 >
                   {t === 'weight_reps' ? 'Weight' : t === 'time' ? 'Time' : 'Bodyweight'}
                 </button>
               ))}
             </div>
          </div>
        </section>

        {/* Media */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Media</h3>
            <div className="flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="text-primary text-xs font-bold flex items-center gap-1">
                <Icon name="upload" size={16} /> Upload
              </button>
              <button onClick={addYouTube} className="text-red-500 text-xs font-bold flex items-center gap-1">
                <Icon name="play_circle" size={16} /> YouTube
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/*" 
                onChange={handleFileUpload} 
              />
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {media.length === 0 && (
              <div className="flex-none w-32 h-32 rounded-2xl bg-gray-100 dark:bg-surface-highlight border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400">
                <Icon name="image" size={32} />
              </div>
            )}
            {media.map(m => (
              <div key={m.id} className="relative flex-none w-32 h-32 rounded-2xl overflow-hidden bg-black group">
                {m.type === 'image' && <img src={m.url} className="w-full h-full object-cover" />}
                {m.type === 'video' && <video src={m.url} className="w-full h-full object-cover" />}
                {m.type === 'youtube' && (
                  <>
                    <img src={m.thumbnailUrl} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon name="play_circle" className="text-white drop-shadow-lg" size={32} />
                    </div>
                  </>
                )}
                <button 
                  onClick={() => removeMedia(m.id)}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Equipment */}
        <section>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Equipment</h3>
          <div className="flex flex-col gap-2">
            {inventoryItems.map(item => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-center p-3 rounded-2xl border transition-all cursor-pointer",
                  selectedEquipment.includes(item.id!) 
                    ? "bg-primary/10 border-primary" 
                    : "bg-surface-light dark:bg-surface-dark border-gray-100 dark:border-surface-highlight"
                )}
                onClick={() => toggleEquipment(item.id!)}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-colors",
                  selectedEquipment.includes(item.id!) ? "bg-primary text-white" : "bg-gray-100 dark:bg-surface-highlight text-gray-500"
                )}>
                  <Icon name={item.icon} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.name}</p>
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                  selectedEquipment.includes(item.id!) ? "bg-primary border-primary" : "border-gray-300 dark:border-gray-600"
                )}>
                  {selectedEquipment.includes(item.id!) && <Icon name="check" size={16} className="text-white" />}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
