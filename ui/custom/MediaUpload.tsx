"use client";
import { FC, useState } from "react";
import { CiImageOn } from "react-icons/ci";
import Image from "next/image";
import { FaTrashAlt } from "react-icons/fa";
import { IoVideocamOutline } from "react-icons/io5";
import MediaGallery from "./MediaGallery";

const MediaUpload: FC<MediaUploadProps> = ({
  value = [],
  onChange,
  onRemove,
  folderId = "uploads",
  multiple = false,
  accept = ["image", "video"],
}) => {
  const [galleryOpen, setGalleryOpen] = useState(false);

  const handleSelect = (url: string, type: MediaType) => {
    // Validate media type
    if (!accept.includes(type)) {
      console.warn(`Media type ${type} not allowed`);
      return;
    }

    if (multiple) {
      // Add to existing values if multiple is allowed
      onChange(url, type);
    } else {
      // Replace existing value if single upload
      onChange(url, type);
    }
    setGalleryOpen(false);
  };

  const handleRemove = (urlToRemove: string) => {
    if (onRemove) {
      onRemove(urlToRemove);
    } else {
      // Fallback if no onRemove is provided
      onChange("");
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4">
        {value.map((item) => (
          <div
            key={item.url}
            className="group relative size-[200px] overflow-hidden rounded-md"
          >
            {item.type === "image" ? (
              <Image
                fill
                className="object-cover"
                alt="Upload"
                src={item.url}
              />
            ) : (
              <div className="relative size-full">
                <video
                  className="size-full object-cover"
                  src={item.url}
                  muted
                  loop
                  controls={false}
                />
                <div className="absolute bottom-2 right-2 rounded-full bg-black/70 p-1">
                  <IoVideocamOutline className="text-white" size={16} />
                </div>
              </div>
            )}
            <div
              onClick={() => handleRemove(item.url)}
              className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100"
            >
              <FaTrashAlt className="text-white" size={20} />
            </div>
          </div>
        ))}

        {/* Hide the upload option if not allowing multiple uploads and there is already an image uploaded */}
        {!multiple && value.length === 0 && (
          <div
            onClick={() => setGalleryOpen(true)}
            className="flex size-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-200/20 bg-white p-2 text-gray-800 transition hover:border-gray-800"
          >
            <CiImageOn size={40} />
            <p className="text-center text-sm font-medium">Upload media</p>
            <p className="text-center text-xs text-gray-500">
              {accept.join(" & ")}
            </p>
          </div>
        )}
      </div>
      <MediaGallery
        visible={galleryOpen}
        folderId={folderId}
        onClose={() => setGalleryOpen(false)}
        onSelect={handleSelect}
      />
    </div>
  );
};

export default MediaUpload;
