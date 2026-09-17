/**
 * Visitor entry: capture (file or webcam) the visitor photo plus details.
 * Uploads multipart/form-data to POST /api/visitors and creates a 'pending'
 * record for the resident to approve.
 * @module pages/security/VisitorEntry
 */
import { useEffect, useRef, useState } from 'react';
import {
  UserRound,
  Camera,
  Upload,
  X,
  CheckCircle2,
  Phone,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api, { resolvePhotoUrl } from '../../api/axios';

const PURPOSES = ['Delivery', 'Guest', 'Cab / Taxi', 'Maintenance Staff', 'Friend / Family'];

const FLATS = ['101', '102', '201', '202', '301', '302', '401', '402', '501', '502'];

/**
 * Webcam capture modal using getUserMedia; returns a JPEG data URL.
 */
function WebcamCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError('Camera unavailable. Please use file upload instead.');
      }
    };
    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    onCapture(canvas.toDataURL('image/jpeg', 0.85));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Capture Visitor Photo</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        {error ? (
          <p className="text-sm text-red-600 py-6">{error}</p>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black" />
        )}
        <button
          onClick={capture}
          disabled={!!error}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold transition"
        >
          Take Snapshot
        </button>
      </div>
    </div>
  );
}

export default function VisitorEntry() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [flatNumber, setFlatNumber] = useState('');
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Cleanup object URLs to avoid memory leaks.
  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }
    setError('');
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleWebcamCapture = (dataUrl) => {
    setPhotoPreview(dataUrl);
    // Convert the data URL into a File so the same multipart flow works.
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        setPhotoFile(new File([blob], 'webcam-visitor.jpg', { type: 'image/jpeg' }));
      })
      .catch(() => setError('Could not process the captured photo.'));
    setShowWebcam(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !flatNumber) {
      setError('Name, phone number, and flat are required.');
      return;
    }
    if (!photoFile) {
      setError('A visitor photo is required.');
      return;
    }

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('phone', phone.trim());
    formData.append('flatNumber', flatNumber);
    formData.append('purpose', purpose);
    formData.append('photo', photoFile, photoFile.name);

    try {
      const { data } = await api.post('/visitors', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSubmitted(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log visitor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSubmitted(null);
    setName('');
    setPhone('');
    setFlatNumber('');
    setPurpose(PURPOSES[0]);
    setPhotoPreview('');
    setPhotoFile(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto space-y-6 pt-6">
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 text-center p-8">
          <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-800">Waiting for Resident Approval</h2>
          <p className="text-sm text-gray-500 mt-1">
            {submitted.flatNumber} has been notified. Entry will be allowed once they approve.
          </p>
          <div className="mt-6 flex items-center justify-center">
            {submitted.photoUrl ? (
              <img
                src={resolvePhotoUrl(submitted.photoUrl)}
                alt={submitted.name}
                className="w-24 h-24 object-cover rounded-2xl border border-gray-200 shadow"
              />
            ) : null}
          </div>
          <div className="mt-4 text-left bg-gray-50 rounded-xl p-4 space-y-1">
            <p className="text-sm"><strong>Name:</strong> {submitted.name}</p>
            <p className="text-sm flex items-center space-x-1">
              <Phone className="w-3.5 h-3.5" /> <span>{submitted.phone}</span>
            </p>
            <p className="text-sm flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" /> <span>Flat {submitted.flatNumber}</span>
            </p>
            <p className="text-sm"><strong>Purpose:</strong> {submitted.purpose}</p>
          </div>
          <button
            onClick={resetForm}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
          >
            Log Another Visitor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Log New Visitor Entry</h1>
        <p className="text-sm text-gray-500">
          Capture the visitor photo and details. The resident is notified for approval.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        {/* Photo capture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Photo *</label>
          <div className="flex items-center space-x-4">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Visitor preview"
                className="w-24 h-24 object-cover rounded-xl border-2 border-blue-200"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                <UserRound className="w-10 h-10" />
              </div>
            )}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
              <button
                type="button"
                onClick={() => setShowWebcam(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                <Camera className="w-4 h-4" />
                <span>Capture with Webcam</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visitor Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              className="field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Flat to Visit</label>
            <select
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              className="field"
              required
            >
              <option value="">Select flat…</option>
              {FLATS.map((flat) => (
                <option key={flat} value={flat}>
                  {flat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="field"
            >
              {PURPOSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-3 rounded-lg text-sm font-semibold transition"
        >
          {loading ? 'Submitting…' : 'Submit & Notify Resident'}
        </button>
      </form>

      {showWebcam && (
        <WebcamCapture
          onCapture={handleWebcamCapture}
          onClose={() => setShowWebcam(false)}
        />
      )}
    </div>
  );
}