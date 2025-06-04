import React, { useState } from 'react';
import { User } from '../types';
import UserAvatar from './UserAvatar';
import Button from './Button';

interface ProfilePictureUploadProps {
    user: User | null;
    onUpload: (file: File) => Promise<void>;
    onRemove?: () => Promise<void>;
    isLoading?: boolean;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
    user,
    onUpload,
    onRemove,
    isLoading = false
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showButtons, setShowButtons] = useState<boolean>(false);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleUpload = async () => {
        if (selectedFile) {
            try {
                await onUpload(selectedFile);
                handleCancel();
                setShowButtons(false);
            } catch (error) {
                console.error('Upload failed:', error);
            }
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setShowButtons(false);
    };

    const handleRemove = async () => {
        if (onRemove) {
            try {
                await onRemove();
                setShowButtons(false);
            } catch (error) {
                console.error('Remove failed:', error);
            }
        }
    };

    const handleAvatarClick = () => {
        if (selectedFile) {
            return;
        }
        
        if (!showButtons) {
            setShowButtons(true);
        } else {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                        alert('File size must be less than 5MB');
                        return;
                    }
                    handleFileSelect(file);
                }
            };
            input.click();
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div 
                className="relative group cursor-pointer"
                onClick={handleAvatarClick}
            >
                {previewUrl ? (
                    <div className="relative">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 transition-all duration-200 group-hover:brightness-75"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-white text-xs font-medium">Preview</span>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <UserAvatar user={user} size="xl" className="transition-all duration-200 group-hover:brightness-75" />
                        <div className="absolute inset-0 bg-black bg-opacity-30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {selectedFile ? (
                <div className="flex space-x-2">
                    <Button
                        onClick={handleUpload}
                        variant="primary"
                        size="sm"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Uploading...' : 'Save'}
                    </Button>
                    <Button
                        onClick={handleCancel}
                        variant="secondary"
                        size="sm"
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            ) : showButtons && (
                <div className="flex space-x-3">
                    <Button
                        onClick={handleAvatarClick}
                        variant="outline"
                        size="sm"
                        disabled={isLoading}
                        className="text-sm"
                    >
                        Change
                    </Button>
                    {user?.profile_picture && onRemove && (
                        <Button
                            onClick={handleRemove}
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                            className="text-sm text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                        >
                            Remove
                        </Button>
                    )}
                </div>
            )}

            {selectedFile && (
                <p className="text-xs text-gray-500 text-center">{selectedFile.name}</p>
            )}
        </div>
    );
};

export default ProfilePictureUpload;
