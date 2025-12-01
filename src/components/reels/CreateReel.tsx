import { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Video, Upload, X } from 'lucide-react';

interface CreateReelProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateReel({ onClose, onSuccess }: CreateReelProps) {
  const { user } = useAuth();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'groups' | 'private'>('public');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      alert('يرجى اختيار ملف فيديو');
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
  };

  const generatePosterFrame = async (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoFile);
      video.currentTime = 1; // Get frame at 1 second

      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        const posterUrl = canvas.toDataURL('image/jpeg');
        resolve(posterUrl);
      };
    });
  };

  const handleUpload = async () => {
    if (!videoFile || !user) return;

    setUploading(true);
    try {
      // Upload video to Supabase Storage
      const videoPath = `reels/${user.id}/${Date.now()}_${videoFile.name}`;
      const { data: videoData, error: uploadError } = await supabase.storage
        .from('reels')
        .upload(videoPath, videoFile, {
          contentType: videoFile.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from('reels').getPublicUrl(videoPath);
      const videoUrl = urlData.publicUrl;

      // Generate poster frame
      const posterDataUrl = await generatePosterFrame(videoFile);
      const posterBlob = await fetch(posterDataUrl).then((r) => r.blob());
      const posterPath = `reels/posters/${user.id}/${Date.now()}_poster.jpg`;

      const { data: posterData, error: posterError } = await supabase.storage
        .from('reels')
        .upload(posterPath, posterBlob, {
          contentType: 'image/jpeg',
        });

      if (posterError) throw posterError;

      const { data: posterUrlData } = supabase.storage
        .from('reels')
        .getPublicUrl(posterPath);
      const posterUrl = posterUrlData.publicUrl;

      // Get video duration
      const video = document.createElement('video');
      video.src = videoUrl;
      const duration = await new Promise<number>((resolve) => {
        video.onloadedmetadata = () => {
          resolve(video.duration);
        };
      });

      // Create reel record
      const { error: reelError } = await supabase.from('reels').insert({
        author_id: user.id,
        video_url: videoUrl,
        poster_frame_url: posterUrl,
        caption,
        visibility,
        duration_seconds: Math.floor(duration),
      });

      if (reelError) throw reelError;

      onSuccess();
    } catch (error) {
      console.error('Error uploading reel:', error);
      alert('حدث خطأ أثناء رفع الفيديو');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">إنشاء مقطع فيديو</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {!videoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-teal-500 transition-colors"
            >
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">انقر لاختيار فيديو</p>
              <p className="text-sm text-gray-500">MP4, MOV, أو WebM</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <video
                src={videoPreview}
                controls
                className="w-full rounded-lg"
              />
              <button
                onClick={() => {
                  setVideoFile(null);
                  setVideoPreview(null);
                }}
                className="absolute top-2 left-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التسمية التوضيحية
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              dir="rtl"
              placeholder="أضف وصفاً لمقطع الفيديو..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الخصوصية
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="public">عام</option>
              <option value="groups">المجموعات</option>
              <option value="private">خاص</option>
            </select>
          </div>

          <div className="flex space-x-3 space-x-reverse justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !videoFile}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'جاري الرفع...' : 'نشر'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

